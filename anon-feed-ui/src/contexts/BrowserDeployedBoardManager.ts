// This file is part of midnightntwrk/anon-feed.
// Copyright (C) Midnight Foundation
// SPDX-License-Identifier: Apache-2.0
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {
  AnonFeedAPI,
  type AnonFeedCircuitKeys,
  type AnonFeedProviders,
  type DeployedAnonFeedAPI,
} from '../../../api/src/index';
import { type ContractAddress, fromHex, toHex } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import {
  BehaviorSubject,
  catchError,
  concatMap,
  firstValueFrom,
  interval,
  map,
  type Observable,
  take,
  tap,
  throwError,
  timeout,
} from 'rxjs';
import { pipe as fnPipe } from 'fp-ts/function';
import { type Logger } from 'pino';
import { ConnectedAPI, type InitialAPI } from '@midnight-ntwrk/dapp-connector-api';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import {
  Binding,
  FinalizedTransaction,
  Proof,
  SignatureEnabled,
  Transaction,
  TransactionId,
} from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { AnonFeedPrivateState } from '@midnight-ntwrk/anon-feed-contract';
import { inMemoryPrivateStateProvider } from '../in-memory-private-state-provider';
import { NetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import type { UnboundTransaction } from '@midnight-ntwrk/midnight-js-types';

/**
 * An in-progress bulletin board deployment.
 */
export interface InProgressBoardDeployment {
  readonly status: 'in-progress';
}

/**
 * A deployed bulletin board deployment.
 */
export interface DeployedBoardDeployment {
  readonly status: 'deployed';

  /**
   * The {@link DeployedAnonFeedAPI} instance when connected to an on network bulletin board contract.
   */
  readonly api: DeployedAnonFeedAPI;
}

/**
 * A failed bulletin board deployment.
 */
export interface FailedBoardDeployment {
  readonly status: 'failed';

  /**
   * The error that caused the deployment to fail.
   */
  readonly error: Error;
}

/**
 * A bulletin board deployment.
 */
export type BoardDeployment = InProgressBoardDeployment | DeployedBoardDeployment | FailedBoardDeployment;

/**
 * Provides access to bulletin board deployments.
 */
export interface DeployedBoardAPIProvider {
  readonly boardDeployments$: Observable<Array<Observable<BoardDeployment>>>;
  readonly resolve: (contractAddress?: ContractAddress) => Observable<BoardDeployment>;
}

/**
 * A {@link DeployedBoardAPIProvider} that manages bulletin board deployments in a browser setting.
 */
export class BrowserDeployedBoardManager implements DeployedBoardAPIProvider {
  readonly #boardDeploymentsSubject: BehaviorSubject<Array<BehaviorSubject<BoardDeployment>>>;
  #initializedProviders: Promise<AnonFeedProviders> | undefined;

  /**
   * @param logger The `pino` logger to use for logging.
   * @param walletAPI The already-connected wallet to use — never re-discovers a wallet.
   */
  constructor(private readonly logger: Logger, private readonly walletAPI: InitialAPI) {
    this.#boardDeploymentsSubject = new BehaviorSubject<Array<BehaviorSubject<BoardDeployment>>>([]);
    this.boardDeployments$ = this.#boardDeploymentsSubject;
  }

  /** @inheritdoc */
  readonly boardDeployments$: Observable<Array<Observable<BoardDeployment>>>;

  /** @inheritdoc */
  resolve(contractAddress?: ContractAddress): Observable<BoardDeployment> {
    const deployments = this.#boardDeploymentsSubject.value;
    let deployment = deployments.find(
      (deployment) =>
        deployment.value.status === 'deployed' && deployment.value.api.deployedContractAddress === contractAddress,
    );

    if (deployment) {
      return deployment;
    }

    deployment = new BehaviorSubject<BoardDeployment>({ status: 'in-progress' });

    if (contractAddress) {
      void this.joinDeployment(deployment, contractAddress);
    } else {
      void this.deployDeployment(deployment);
    }

    this.#boardDeploymentsSubject.next([...deployments, deployment]);
    return deployment;
  }

  private getProviders(): Promise<AnonFeedProviders> {
    return this.#initializedProviders ?? (this.#initializedProviders = initializeProviders(this.logger, this.walletAPI));
  }

  private async deployDeployment(deployment: BehaviorSubject<BoardDeployment>): Promise<void> {
    try {
      const providers = await this.getProviders();
      const api = await AnonFeedAPI.deploy(providers, this.logger);
      deployment.next({ status: 'deployed', api });
    } catch (error: unknown) {
      deployment.next({ status: 'failed', error: error instanceof Error ? error : new Error(String(error)) });
    }
  }

  private async joinDeployment(
    deployment: BehaviorSubject<BoardDeployment>,
    contractAddress: ContractAddress,
  ): Promise<void> {
    try {
      const providers = await this.getProviders();
      const api = await AnonFeedAPI.join(providers, contractAddress, this.logger);
      deployment.next({ status: 'deployed', api });
    } catch (error: unknown) {
      deployment.next({ status: 'failed', error: error instanceof Error ? error : new Error(String(error)) });
    }
  }
}

/** @internal */
const initializeProviders = async (logger: Logger, walletAPI: InitialAPI): Promise<AnonFeedProviders> => {
  const networkId = (import.meta.env.VITE_NETWORK_ID ?? 'preview') as NetworkId;
  const connectedAPI = await connectToWallet(logger, networkId, walletAPI);
  const zkConfigPath = window.location.origin;
  const keyMaterialProvider = new FetchZkConfigProvider<AnonFeedCircuitKeys>(zkConfigPath, fetch.bind(window));
  const config = await connectedAPI.getConfiguration();
  const inMemoryAnonFeedPrivateStateProvider = inMemoryPrivateStateProvider<string, AnonFeedPrivateState>();
  const shieldedAddresses = await connectedAPI.getShieldedAddresses();
  return {
    privateStateProvider: inMemoryAnonFeedPrivateStateProvider,
    zkConfigProvider: keyMaterialProvider,
    proofProvider: httpClientProofProvider(
      config.proverServerUri ?? import.meta.env.VITE_PROOF_SERVER ?? 'http://localhost:6300',
      keyMaterialProvider,
    ),
    publicDataProvider: indexerPublicDataProvider(config.indexerUri, config.indexerWsUri),
    walletProvider: {
      getCoinPublicKey(): string {
        return shieldedAddresses.shieldedCoinPublicKey;
      },
      getEncryptionPublicKey(): string {
        return shieldedAddresses.shieldedEncryptionPublicKey;
      },
      balanceTx: async (tx: UnboundTransaction, ttl?: Date): Promise<FinalizedTransaction> => {
        try {
          logger.info({ tx, ttl }, 'Balancing transaction via wallet');
          const serializedTx = toHex(tx.serialize());
          const received = await connectedAPI.balanceUnsealedTransaction(serializedTx);
          return Transaction.deserialize<SignatureEnabled, Proof, Binding>(
            'signature',
            'proof',
            'binding',
            fromHex(received.tx),
          );
        } catch (e) {
          logger.error({ error: e }, 'Error balancing transaction via wallet');
          throw e;
        }
      },
    },
    midnightProvider: {
      submitTx: async (tx: FinalizedTransaction): Promise<TransactionId> => {
        await connectedAPI.submitTransaction(toHex(tx.serialize()));
        const txIdentifiers = tx.identifiers();
        const txId = txIdentifiers[0];
        logger.info({ txIdentifiers }, 'Submitted transaction via wallet');
        return txId;
      },
    },
  };
};

/** @internal — connects using the exact wallet the user already selected */
const connectToWallet = (logger: Logger, networkId: string, walletAPI: InitialAPI): Promise<ConnectedAPI> => {
  return firstValueFrom(
    fnPipe(
      interval(100),
      map(() => walletAPI),
      tap((w) => logger.info({ name: w.name, rdns: w.rdns }, 'Using connected wallet for board operation')),
      take(1),
      concatMap(async (initialAPI) => {
        const deadline = Date.now() + 30_000;
        let lastError: unknown;
        while (Date.now() < deadline) {
          try {
            const connectedAPI = await initialAPI.connect(networkId);
            const connectionStatus = await connectedAPI.getConnectionStatus();
            logger.info(connectionStatus, 'Wallet connection status');
            if (connectionStatus.status === 'disconnected') {
              throw new Error(
                `Wallet "${initialAPI.name}" reported status "disconnected". Open the wallet and try again.`,
              );
            }
            if (connectionStatus.networkId !== networkId) {
              const walletNet = connectionStatus.networkId ?? 'an unknown network';
              throw new Error(
                `Wallet "${initialAPI.name}" is on network "${walletNet}" but this app requires "${networkId}". ` +
                  `Open ${initialAPI.name} → Settings → Networks and switch to Midnight Preview.`,
              );
            }
            return connectedAPI;
          } catch (e: unknown) {
            lastError = e;
            const msg = e instanceof Error ? e.message : String(e);
            if (msg.toLowerCase().includes('sync') || msg.toLowerCase().includes('not ready')) {
              logger.info('Wallet syncing — retrying in 2s...');
              await new Promise((r) => setTimeout(r, 2_000));
            } else {
              throw e;
            }
          }
        }
        throw lastError ?? new Error('Wallet failed to sync within 30 seconds.');
      }),
      timeout({
        first: 45_000,
        with: () =>
          throwError(() => {
            logger.error('Wallet connector API has failed to respond');
            return new Error('Wallet is taking too long to respond. Open the extension and wait for it to finish syncing.');
          }),
      }),
      catchError((error) => throwError(() => (error instanceof Error ? error : new Error(String(error))))),
    ),
  );
};
