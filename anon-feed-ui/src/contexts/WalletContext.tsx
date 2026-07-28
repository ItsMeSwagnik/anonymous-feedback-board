import React, { createContext, useCallback, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import semver from 'semver';
import { type InitialAPI } from '@midnight-ntwrk/dapp-connector-api';
import { NetworkId } from '@midnight-ntwrk/midnight-js-network-id';

export type WalletStatus = 'disconnected' | 'connecting' | 'syncing' | 'connected' | 'error';

export interface WalletState {
  status: WalletStatus;
  address: string;
  walletName: string;
  error: string;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletState | undefined>(undefined);

const COMPATIBLE_VERSION = '4.x';

const isCompatible = (w: unknown): w is InitialAPI =>
  !!w && typeof w === 'object' && 'apiVersion' in w &&
  semver.satisfies((w as InitialAPI).apiVersion, COMPATIBLE_VERSION);

const getAllWallets = (): InitialAPI[] => {
  if (!window.midnight) return [];
  return Object.values(window.midnight).filter(isCompatible);
};

/** Prefer Lace (window.midnight.mnLace) — the reference Midnight wallet per docs */
const pickWallet = (): InitialAPI | undefined => {
  if (!window.midnight) return undefined;
  const lace = (window.midnight as Record<string, unknown>)['mnLace'];
  if (isCompatible(lace)) return lace;
  return getAllWallets()[0];
};

const STORAGE_KEY = 'anon-feed-wallet';

export const WalletProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [status, setStatus] = useState<WalletStatus>('disconnected');
  const [address, setAddress] = useState('');
  const [walletName, setWalletName] = useState('');
  const [error, setError] = useState('');

  // Restore persisted connection on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { address: a, walletName: n } = JSON.parse(saved) as { address: string; walletName: string };
        if (a && n) { setAddress(a); setWalletName(n); setStatus('connected'); }
      }
    } catch { /* ignore */ }
  }, []);

  const connect = useCallback(async () => {
    setStatus('connecting');
    setError('');
    const networkId = (import.meta.env.VITE_NETWORK_ID ?? 'preprod') as NetworkId;

    try {
      // Poll up to 10s for a wallet to appear
      const wallet = await new Promise<InitialAPI>((resolve, reject) => {
        const deadline = Date.now() + 10_000;
        const poll = () => {
          const w = pickWallet();
          if (w) return resolve(w);
          if (Date.now() > deadline) {
            const found = getAllWallets();
            if (found.length > 0) {
              // Wallets exist but none is Lace — use first one anyway
              return resolve(found[0]);
            }
            return reject(new Error(
              'No Midnight wallet found. Install Lace (lace.io/midnight) or 1AM (1am.xyz) ' +
              'and enable the Midnight Preprod network inside the extension.',
            ));
          }
          setTimeout(poll, 300);
        };
        poll();
      });

      setWalletName(wallet.name ?? 'Wallet');
      setStatus('syncing');
      setError('');

      // Retry connect up to 30s for sync errors only
      const deadline = Date.now() + 30_000;
      let connectedAPI;
      let lastErr: unknown;

      while (Date.now() < deadline) {
        try {
          connectedAPI = await wallet.connect(networkId);

          // Validate connection — hard fail, do NOT retry
          const connectionStatus = await connectedAPI.getConnectionStatus();
          if (connectionStatus.status === 'disconnected') {
            throw new Error(
              `Wallet reported status "disconnected". Open ${wallet.name ?? 'the wallet'} and try again.`,
            );
          }
          // status === 'connected' — networkId is present on this branch per the ConnectionStatus type
          if (connectionStatus.networkId !== networkId) {
            const walletNet = connectionStatus.networkId ?? 'an unknown network';
            throw new Error(
              `"${wallet.name}" is connected to "${walletNet}" ` +
              `but this app requires "${networkId}". ` +
              `Open ${wallet.name} → Settings → Networks and switch to Midnight Preprod.`,
            );
          }
          break;
        } catch (e: unknown) {
          lastErr = e;
          const msg = e instanceof Error ? e.message : String(e);
          if (msg.toLowerCase().includes('sync') || msg.toLowerCase().includes('not ready')) {
            await new Promise((r) => setTimeout(r, 2_000));
          } else {
            throw e; // rethrow network mismatch and all other errors immediately
          }
        }
      }

      if (!connectedAPI) {
        throw lastErr ?? new Error('Wallet failed to sync within 30 seconds. Open the wallet and wait for sync.');
      }

      const { shieldedAddress } = await connectedAPI.getShieldedAddresses();
      const shortAddr = `${shieldedAddress.slice(0, 12)}...${shieldedAddress.slice(-6)}`;
      const name = wallet.name ?? 'Wallet';
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ address: shortAddr, walletName: name }));
      setAddress(shortAddr);
      setStatus('connected');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus('error');
    }
  }, []);

  const disconnect = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setStatus('disconnected');
    setAddress('');
    setWalletName('');
    setError('');
  }, []);

  return (
    <WalletContext.Provider value={{ status, address, walletName, error, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletState => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('WalletProvider is required');
  return ctx;
};
