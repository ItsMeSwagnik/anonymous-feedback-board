import React, { createContext, useCallback, useContext, useEffect, useState, type PropsWithChildren } from 'react';
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

// Per Midnight docs: wallets inject under a UUID key — enumerate, never hardcode
const COMPATIBLE_VERSION = '^4.0.0';
const STORAGE_KEY = 'anon-feed-wallet';
const NETWORK_ID = 'preprod';

const isCompatible = (w: unknown): w is InitialAPI =>
  !!w &&
  typeof w === 'object' &&
  'apiVersion' in w &&
  typeof (w as InitialAPI).apiVersion === 'string' &&
  semver.satisfies((w as InitialAPI).apiVersion, COMPATIBLE_VERSION);

const getAllWallets = (): InitialAPI[] => {
  if (typeof window === 'undefined' || !window.midnight) return [];
  return Object.values(window.midnight).filter(isCompatible);
};

// Per docs: enumerate window.midnight — do NOT hardcode 'mnLace'
// Prefer Lace if present (rdns = 'io.lace'), otherwise first compatible wallet
const pickWallet = (): InitialAPI | undefined => {
  const wallets = getAllWallets();
  if (wallets.length === 0) return undefined;
  return wallets.find((w) => w.rdns?.includes('lace')) ?? wallets[0];
};

export const WalletProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [status, setStatus] = useState<WalletStatus>('disconnected');
  const [address, setAddress] = useState('');
  const [walletName, setWalletName] = useState('');
  const [error, setError] = useState('');

  // Restore persisted session on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { address: a, walletName: n } = JSON.parse(saved) as { address: string; walletName: string };
        if (a && n) {
          setAddress(a);
          setWalletName(n);
          setStatus('connected');
        }
      }
    } catch { /* ignore */ }
  }, []);

  // CRITICAL per Midnight docs: connect() must be called synchronously inside the
  // click handler — no await before it or the wallet popup will never appear.
  // We call wallet.connect() directly here (synchronously triggered by user click),
  // then handle the async result in a .then()/.catch() chain.
  const connect = useCallback(() => {
    setStatus('connecting');
    setError('');

    const wallet = pickWallet();

    if (!wallet) {
      // Wallet not injected yet — poll for up to 8s then give up
      let attempts = 0;
      const poll = setInterval(() => {
        attempts++;
        const w = pickWallet();
        if (w) {
          clearInterval(poll);
          doConnect(w);
        } else if (attempts >= 40) {
          clearInterval(poll);
          const all = getAllWallets();
          setError(
            all.length > 0
              ? `Found wallet(s) [${all.map((x) => x.name).join(', ')}] but none compatible with API v4. Update your wallet extension.`
              : 'No Midnight wallet found. Install Lace (lace.io/midnight) or 1AM (1am.xyz), enable Midnight Preprod, then reload.',
          );
          setStatus('error');
        }
      }, 200);
      return;
    }

    doConnect(wallet);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const doConnect = (wallet: InitialAPI) => {
    setWalletName(wallet.name ?? 'Wallet');
    setStatus('syncing');

    // wallet.connect() is called here — this is the synchronous trigger point
    wallet
      .connect(NETWORK_ID)
      .then(async (connectedAPI) => {
        const connectionStatus = await connectedAPI.getConnectionStatus();

        if (connectionStatus.status === 'disconnected') {
          throw new Error(
            `${wallet.name ?? 'Wallet'} reported "disconnected". Open the wallet extension and try again.`,
          );
        }

        const walletNet = connectionStatus.networkId ?? 'an unknown network';
        if (walletNet !== NETWORK_ID) {
          throw new Error(
            `"${wallet.name}" is on "${walletNet}" but this app requires "${NETWORK_ID}". ` +
            `Open ${wallet.name} → Settings → Networks and switch to Midnight Preprod.`,
          );
        }

        const { shieldedAddress } = await connectedAPI.getShieldedAddresses();
        const shortAddr = shieldedAddress.length > 20
          ? `${shieldedAddress.slice(0, 14)}...${shieldedAddress.slice(-6)}`
          : shieldedAddress;
        const name = wallet.name ?? 'Wallet';

        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ address: shortAddr, walletName: name }));
        setAddress(shortAddr);
        setWalletName(name);
        setStatus('connected');
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : String(e);
        // Retry on sync/not-ready errors up to 30s
        if (msg.toLowerCase().includes('sync') || msg.toLowerCase().includes('not ready')) {
          setStatus('syncing');
          setTimeout(() => doConnect(wallet), 3_000);
        } else {
          setError(msg);
          setStatus('error');
        }
      });
  };

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
