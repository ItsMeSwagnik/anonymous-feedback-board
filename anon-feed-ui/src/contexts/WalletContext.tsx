import React, { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import semver from 'semver';
import { type InitialAPI } from '@midnight-ntwrk/dapp-connector-api';

export type WalletStatus = 'disconnected' | 'connecting' | 'syncing' | 'connected' | 'error';

export interface WalletState {
  status: WalletStatus;
  address: string;
  walletName: string;
  error: string;
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletState | undefined>(undefined);

const COMPATIBLE_VERSION = '^4.0.0';
const STORAGE_KEY = 'anon-feed-wallet';
const NETWORK_ID = 'preprod';

const isCompatible = (w: unknown): w is InitialAPI =>
  !!w &&
  typeof w === 'object' &&
  'apiVersion' in w &&
  typeof (w as InitialAPI).apiVersion === 'string' &&
  semver.satisfies((w as InitialAPI).apiVersion, COMPATIBLE_VERSION);

// Enumerate all wallets from window.midnight — never hardcode a key
const getAllWallets = (): InitialAPI[] => {
  if (typeof window === 'undefined' || !window.midnight) return [];
  return Object.values(window.midnight).filter(isCompatible);
};

const pickWallet = (): InitialAPI | undefined => getAllWallets()[0];

export const WalletProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [status, setStatus] = useState<WalletStatus>('disconnected');
  const [address, setAddress] = useState('');
  const [walletName, setWalletName] = useState('');
  const [error, setError] = useState('');
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore persisted session on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { address: a, walletName: n } = JSON.parse(saved) as { address: string; walletName: string };
        if (a && n) { setAddress(a); setWalletName(n); setStatus('connected'); }
      }
    } catch { /* ignore */ }
    return () => { if (retryTimer.current) clearTimeout(retryTimer.current); };
  }, []);

  // Per Midnight docs: connect() MUST be called synchronously in the click handler.
  // No await/setTimeout before wallet.connect() — or the wallet popup never appears.
  const connect = useCallback(() => {
    setStatus('connecting');
    setError('');

    const wallet = pickWallet();

    if (!wallet) {
      setError(
        'No Midnight wallet found. Install Lace (lace.io/midnight) or 1AM (1am.xyz), ' +
        'enable Midnight Preprod inside the extension, then reload this page.',
      );
      setStatus('error');
      return;
    }

    setWalletName(wallet.name ?? 'Wallet');

    // wallet.connect() called synchronously here — this is the user-gesture trigger
    wallet.connect(NETWORK_ID)
      .then(async (api) => {
        setStatus('syncing');

        // getConnectionStatus() is optional validation — skip networkId check
        // because connect() itself already throws on network mismatch
        const cs = await api.getConnectionStatus().catch(() => null);
        if (cs && cs.status === 'disconnected') {
          throw new Error(
            `${wallet.name ?? 'Wallet'} is disconnected. Open the extension and unlock it, then try again.`,
          );
        }

        const { shieldedAddress } = await api.getShieldedAddresses();
        const short = `${shieldedAddress.slice(0, 14)}...${shieldedAddress.slice(-6)}`;
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ address: short, walletName: wallet.name ?? 'Wallet' }));
        setAddress(short);
        setWalletName(wallet.name ?? 'Wallet');
        setStatus('connected');
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : String(e);
        const lower = msg.toLowerCase();

        if (lower.includes('sync') || lower.includes('not ready') || lower.includes('loading')) {
          // Wallet still syncing — retry automatically
          setStatus('syncing');
          retryTimer.current = setTimeout(() => connect(), 3_000);
          return;
        }

        // Surface the real error message — don't wrap it
        setError(msg);
        setStatus('error');
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const disconnect = useCallback(() => {
    if (retryTimer.current) clearTimeout(retryTimer.current);
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
