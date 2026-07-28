// This file is part of midnightntwrk/anon-feed.
// Copyright (C) Midnight Foundation
// SPDX-License-Identifier: Apache-2.0
// Licensed under the Apache License, Version 2.0 (the "License");
// You may not use this file except in compliance with the License.
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
  filter,
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
import semver from 'semver';
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
  /**
   * Gets the observable set of board deployments.
   *
   * @remarks
   * This property represents an observable array of {@link BoardDeployment}, each also an
   * observable. Changes to the array will be emitted as boards are resolved (deployed or joined),
   * while changes to each underlying board can be observed via each item in the array.
   */
  readonly boardDeployments$: Observable<Array<Observable<BoardDeployment>>>;

  /**
   * Joins or deploys a bulletin board contract.
   *
   * @param contractAddress An optional contract address to use when resolving.
   * @returns An observable board deployment.
   *
   * @remarks
   * For a given `contractAddress`, the method will attempt to find and join the identified bulletin board
   * contract; otherwise it will attempt to deploy a new one.
   */
  readonly resolve: (contractAddress?: ContractAddress) => Observable<BoardDeployment>;
}

/**
 * A {@link DeployedBoardAPIProvider} that manages bulletin board deployments in a browser setting.
 *
 * @remarks
 * {@link BrowserDeployedBoardManager} configures and manages a connection to the Midnight Lace
 * wallet, along with a collection of additional providers that work in a web-browser setting.
 */
export class BrowserDeployedBoardManager implements DeployedBoardAPIProvider {
  readonly #boardDeploymentsSubject: BehaviorSubject<Array<BehaviorSubject<BoardDeployment>>>;
  #initializedProviders: Promise<AnonFeedProviders> | undefined;

  /**
   * Initializes a new {@link BrowserDeployedBoardManager} instance.
   *
   * @param logger The `pino` logger to for logging.
   */
  constructor(private readonly logger: Logger) {
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

    deployment = new BehaviorSubject<BoardDeployment>({
      status: 'in-progress',
    });

    if (contractAddress) {
      void this.joinDeployment(deployment, contractAddress);
    } else {
      void this.deployDeployment(deployment);
    }

    this.#boardDeploymentsSubject.next([...deployments, deployment]);

    return deployment;
  }

  private getProviders(): Promise<AnonFeedProviders> {
    // We use a cached `Promise` to hold the providers. This will:
    //
    // 1. Cache and re-use the providers (including the configured connector API), and
    // 2. Act as a synchronization point if multiple contract deploys or joins run concurrently.
    //    Concurrent calls to `getProviders()` will receive, and ultimately await, the same
    //    `Promise`.
    return this.#initializedProviders ?? (this.#initializedProviders = initializeProviders(this.logger));
  }

  private async deployDeployment(deployment: BehaviorSubject<BoardDeployment>): Promise<void> {
    try {
      const providers = await this.getProviders();
      const api = await AnonFeedAPI.deploy(providers, this.logger);

      deployment.next({
        status: 'deployed',
        api,
      });
    } catch (error: unknown) {
      deployment.next({
        status: 'failed',
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  private async joinDeployment(
    deployment: BehaviorSubject<BoardDeployment>,
    contractAddress: ContractAddress,
  ): Promise<void> {
    try {
      const providers = await this.getProviders();
      const api = await AnonFeedAPI.join(providers, contractAddress, this.logger);

      deployment.next({
        status: 'deployed',
        api,
      });
    } catch (error: unknown) {
      deployment.next({
        status: 'failed',
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }
}

/** @internal */
const initializeProviders = async (logger: Logger): Promise<AnonFeedProviders> => {
  const networkId = (import.meta.env.VITE_NETWORK_ID ?? 'preprod') as NetworkId;
  const connectedAPI = await connectToWallet(logger, networkId);
  const zkConfigPath = window.location.origin; // '../../../contract/src/managed/anon-feed';
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
        const txId = txIdentifiers[0]; // Return the first transaction ID
        logger.info({ txIdentifiers }, 'Submitted transaction via wallet');
        return txId;
      },
    },
  };
};

/** @internal */
const getCompatibleWallets = (): InitialAPI[] => {
  if (!window.midnight) return [];
  return Object.values(window.midnight).filter(
    (wallet): wallet is InitialAPI =>
      !!wallet &&
      typeof wallet === 'object' &&
      'apiVersion' in wallet &&
      semver.satisfies(wallet.apiVersion, COMPATIBLE_CONNECTOR_API_VERSION),
  );
};

/** Prefer Lace (mnLace) if present, otherwise use first compatible wallet */
const getPreferredWallet = (): InitialAPI | undefined => {
  if (!window.midnight) return undefined;
  const lace = (window.midnight as Record<string, unknown>)['mnLace'];
  if (
    lace &&
    typeof lace === 'object' &&
    'apiVersion' in lace &&
    semver.satisfies((lace as InitialAPI).apiVersion, COMPATIBLE_CONNECTOR_API_VERSION)
  ) {
    return lace as InitialAPI;
  }
  return getCompatibleWallets()[0];
};

const COMPATIBLE_CONNECTOR_API_VERSION = '4.x';

/** @internal */
const connectToWallet = (logger: Logger, networkId: string): Promise<ConnectedAPI> => {
  return firstValueFrom(
    fnPipe(
      interval(100),
      map(() => getPreferredWallet()),
      tap((connectorAPI) => {
        if (connectorAPI) logger.info({ name: connectorAPI.name, rdns: connectorAPI.rdns }, 'Check for wallet connector API');
      }),
      filter((connectorAPI): connectorAPI is InitialAPI => !!connectorAPI),
      tap((connectorAPI) => {
        logger.info({ name: connectorAPI.name, rdns: connectorAPI.rdns }, 'Compatible wallet connector API found. Connecting.');
      }),
      take(1),
      timeout({
        first: 10_000,
        with: () =>
          throwError(() => {
            const found = getCompatibleWallets();
            const names = found.map((w) => w.name).join(', ');
            logger.error('Could not find wallet connector API');
            return new Error(
              found.length > 0
                ? `Found wallet(s) [${names}] but none on Midnight Preprod. Open your wallet → Settings → Networks and enable Midnight Preprod.`
                : 'No Midnight wallet found. Install Lace (lace.io/midnight) or 1AM (1am.xyz) and enable Midnight Preprod network.',
            );
          }),
      }),
      concatMap(async (initialAPI) => {
        // Retry connect up to 30s to allow Lace wallet to finish syncing
        const deadline = Date.now() + 30_000;
        let lastError: unknown;
        while (Date.now() < deadline) {
          try {
            const connectedAPI = await initialAPI.connect(networkId);
            const connectionStatus = await connectedAPI.getConnectionStatus();
            logger.info(connectionStatus, 'Wallet connection status');
            // Hard-fail on disconnected or network mismatch — do NOT retry
            if (connectionStatus.status === 'disconnected') {
              throw new Error(
                `Wallet "${initialAPI.name}" reported status "disconnected". Open the wallet and try again.`,
              );
            }
            // status === 'connected': networkId is present on this branch per ConnectionStatus type
            if (connectionStatus.networkId !== networkId) {
              const walletNet = connectionStatus.networkId ?? 'an unknown network';
              throw new Error(
                `Wallet "${initialAPI.name}" is on network "${walletNet}" but this app requires "${networkId}". ` +
                  `Open ${initialAPI.name} → Settings → Networks and switch to Midnight Preprod.`,
              );
            }
            return connectedAPI;
          } catch (e: unknown) {
            lastError = e;
            const msg = e instanceof Error ? e.message : String(e);
            // Only retry on sync errors — rethrow everything else immediately
            if (msg.toLowerCase().includes('sync') || msg.toLowerCase().includes('not ready')) {
              logger.info('Wallet syncing — retrying in 2s...');
              await new Promise((r) => setTimeout(r, 2_000));
            } else {
              throw e;
            }
          }
        }
        throw lastError ?? new Error('Wallet failed to sync within 30 seconds. Open the wallet and wait for sync to finish.');
      }),
      timeout({
        first: 45_000,
        with: () =>
          throwError(() => {
            logger.error('Wallet connector API has failed to respond');
            return new Error('Wallet is taking too long to respond. Open the extension and wait for it to finish syncing.');
          }),
      }),
      // Pass errors through as-is — do NOT wrap in a generic message
      catchError((error) => throwError(() => (error instanceof Error ? error : new Error(String(error))))),
    ),
  );
};
