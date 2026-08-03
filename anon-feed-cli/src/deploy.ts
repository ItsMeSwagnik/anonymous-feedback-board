/**
 * Non-interactive deployment script for anon-feed contract on Preprod.
 * Run with: node --loader ts-node/esm src/deploy.ts
 *
 * Steps:
 *  1. Generates a fresh wallet seed
 *  2. Prints unshielded address — you fund it via faucet
 *  3. Waits for funds to arrive (polls indefinitely)
 *  4. Generates tDUST
 *  5. Deploys the contract
 *  6. Writes contract address to README.md, .env, .env.preprod
 */

import { WebSocket } from 'ws';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createLogger } from './logger-utils.js';
import { PreprodRemoteConfig } from './config.js';
import { MidnightWalletProvider } from './midnight-wallet-provider.js';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { unshieldedToken } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { toHex } from '@midnight-ntwrk/midnight-js-utils';
import { AnonFeedAPI, type AnonFeedProviders, type PrivateStateId } from '../../api/src/index.js';
import { type AnonFeedPrivateState } from '../../contract/src/witnesses.js';
import { randomBytes } from '../../api/src/utils/index.js';
import { syncWallet, waitForUnshieldedFunds } from './wallet-utils.js';
import { generateDust } from './generate-dust.js';

// @ts-expect-error: needed for WebSocket in apollo
globalThis.WebSocket = WebSocket;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');

const PLACEHOLDER = '<YOUR_DEPLOYED_CONTRACT_ADDRESS>';

function replaceInFile(filePath: string, address: string) {
  try {
    const content = readFileSync(filePath, 'utf8');
    if (!content.includes(PLACEHOLDER)) {
      console.log(`  [skip] ${filePath} — placeholder not found (may already be set)`);
      return;
    }
    writeFileSync(filePath, content.replaceAll(PLACEHOLDER, address), 'utf8');
    console.log(`  [ok]   ${filePath}`);
  } catch (e) {
    console.error(`  [err]  ${filePath}: ${(e as Error).message}`);
  }
}

async function main() {
  const config = new PreprodRemoteConfig();
  // Override logDir to avoid Windows path double-drive-letter bug with import.meta.url
  const logDir = path.join(__dirname, '..', 'logs', 'preprod-remote', `${new Date().toISOString().replace(/:/g, '-')}.log`);
  const logger = await createLogger(logDir);
  const testEnv = config.getEnvironment(logger);

  console.log('\n=== anon-feed contract deployment ===\n');

  const envConfig = await testEnv.start();
  logger.info(`Environment started: ${JSON.stringify(envConfig)}`);

  // Generate a fresh wallet seed
  const seed = toHex(randomBytes(32));
  console.log(`\nWallet seed (save this!): ${seed}\n`);

  const walletProvider = await MidnightWalletProvider.build(logger, envConfig, seed);
  await walletProvider.start();

  const walletFacade = walletProvider.wallet;

  console.log('\n>>> Fund the wallet shown above at:');
  console.log('    https://midnight-tmnight-preprod.nethermind.dev/');
  console.log('\nWaiting for tNIGHT to arrive (this may take 2-3 minutes)...\n');

  const unshieldedState = await waitForUnshieldedFunds(logger, walletFacade, envConfig, unshieldedToken());
  const nightBalance = unshieldedState.balances[unshieldedToken().raw];
  console.log(`\ntNIGHT balance: ${nightBalance}\n`);

  if (!nightBalance || nightBalance === 0n) {
    console.error('No funds received. Exiting.');
    await walletProvider.stop();
    await testEnv.shutdown();
    process.exit(1);
  }

  // Generate tDUST
  console.log('Generating tDUST (required for transaction fees)...');
  const dustTx = await generateDust(logger, seed, unshieldedState, walletFacade);
  if (dustTx) {
    logger.info(`Dust generation tx: ${dustTx}`);
    await syncWallet(logger, walletFacade);
  }

  // Build providers
  const zkConfigProvider = new NodeZkConfigProvider<'post' | 'takeDown'>(config.zkConfigPath);
  const providers: AnonFeedProviders = {
    privateStateProvider: levelPrivateStateProvider<PrivateStateId, AnonFeedPrivateState>({
      privateStateStoreName: config.privateStateStoreName,
      signingKeyStoreName: `${config.privateStateStoreName}-signing-keys`,
      privateStoragePasswordProvider: () => 'AnonFeed-Deploy-2026!',
      accountId: seed,
    }),
    publicDataProvider: indexerPublicDataProvider(envConfig.indexer, envConfig.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(envConfig.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };

  // Deploy
  console.log('\nDeploying contract (this takes ~30 seconds)...\n');
  const api = await AnonFeedAPI.deploy(providers, logger);
  const contractAddress = api.deployedContractAddress;

  console.log(`\n✅ Contract deployed at: ${contractAddress}\n`);

  // Write address to all config files
  console.log('Writing contract address to config files...');
  replaceInFile(path.join(ROOT, 'README.md'), contractAddress);
  replaceInFile(path.join(ROOT, 'anon-feed-ui', '.env'), contractAddress);
  replaceInFile(path.join(ROOT, 'anon-feed-ui', '.env.preprod'), contractAddress);

  console.log('\n✅ Done! Contract address written to all config files.');
  console.log(`\nVerify on explorer: https://preprod.midnightexplorer.com/contracts/${contractAddress}\n`);

  await walletProvider.stop();
  await testEnv.shutdown();
}

main().catch((e) => {
  console.error('Deployment failed:', e);
  process.exit(1);
});
