import React, {
  createContext, useCallback, useContext, useEffect, useRef, useState,
  type PropsWithChildren,
} from 'react';
import semver from 'semver';
import type { InitialAPI } from '@midnight-ntwrk/dapp-connector-api';

export type WalletStatus = 'disconnected' | 'picking' | 'connecting' | 'syncing' | 'connected' | 'error';

export interface WalletState {
  status: WalletStatus;
  address: string;
  walletName: string;
  error: string;
  availableWallets: InitialAPI[];
  connectedWallet: InitialAPI | null;
  connect: () => void;
  selectWallet: (wallet: InitialAPI) => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletState | undefined>(undefined);

const COMPATIBLE_VERSION = '^4.0.0';
const STORAGE_KEY = 'anon-feed-wallet';
const NETWORK_ID = 'preview';

const isCompatible = (w: unknown): w is InitialAPI =>
  !!w &&
  typeof w === 'object' &&
  'apiVersion' in w &&
  typeof (w as InitialAPI).apiVersion === 'string' &&
  semver.satisfies((w as InitialAPI).apiVersion, COMPATIBLE_VERSION);

// Scan all wallets from window.midnight per CAIP-372 / Midnight docs.
// Also explicitly check window.midnight.mnLace (Lace's stable key) since
// Lace injects under that fixed key in addition to the UUID-keyed v4 path.
const getAllWallets = (): InitialAPI[] => {
  if (typeof window === 'undefined' || !window.midnight) return [];
  const seen = new Set<string>();
  const wallets: InitialAPI[] = [];

  const add = (w: unknown) => {
    if (!isCompatible(w)) return;
    const id = w.rdns ?? w.name;
    if (id && seen.has(id)) return;
    if (id) seen.add(id);
    wallets.push(w);
  };

  // Check known stable keys first (Lace = mnLace, 1AM = '1am')
  add((window.midnight as Record<string, unknown>)['mnLace']);
  add((window.midnight as Record<string, unknown>)['1am']);

  // Then scan all values for any other CAIP-372 compatible wallet
  Object.values(window.midnight).forEach(add);

  return wallets;
};

export const WalletProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [status, setStatus] = useState<WalletStatus>('disconnected');
  const [address, setAddress] = useState('');
  const [walletName, setWalletName] = useState('');
  const [error, setError] = useState('');
  const [availableWallets, setAvailableWallets] = useState<InitialAPI[]>([]);
  const [connectedWallet, setConnectedWallet] = useState<InitialAPI | null>(null);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryWallet = useRef<InitialAPI | null>(null);

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

  // connect() — called synchronously in click handler (required by wallet popup rules)
  const connect = useCallback(() => {
    setError('');
    const wallets = getAllWallets();

    if (wallets.length === 0) {
      setError(
        'No Midnight wallet found. Install Lace (lace.io/midnight) or 1AM (1am.xyz), ' +
        'enable Midnight Preview inside the extension, then reload this page.',
      );
      setStatus('error');
      return;
    }

    if (wallets.length === 1) {
      // Only one wallet — connect directly without showing picker
      doConnect(wallets[0]);
      return;
    }

    // Multiple wallets — show picker
    setAvailableWallets(wallets);
    setStatus('picking');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // selectWallet() — called when user picks from the dialog
  const selectWallet = useCallback((wallet: InitialAPI) => {
    setStatus('connecting');
    setAvailableWallets([]);
    doConnect(wallet);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const doConnect = (wallet: InitialAPI) => {
    setStatus('connecting');
    setWalletName(wallet.name ?? 'Wallet');
    retryWallet.current = wallet;

    // wallet.connect() MUST be called synchronously in the user-gesture path
    wallet.connect(NETWORK_ID)
      .then(async (api) => {
        setStatus('syncing');

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
        setConnectedWallet(wallet);
        setStatus('connected');
        retryWallet.current = null;
      })
      .catch((e: unknown) => {
        console.warn('[WalletContext] connect error:', e);
        const isAPIError = !!e && typeof e === 'object' && (e as Record<string, unknown>).type === 'DAppConnectorAPIError';
        const msg = isAPIError
          ? String((e as Record<string, unknown>).reason ?? (e as Record<string, unknown>).code ?? 'Wallet error')
          : e instanceof Error ? e.message : String(e);
        const lower = msg.toLowerCase();

        if (lower.includes('sync') || lower.includes('not ready') || lower.includes('loading')) {
          setStatus('syncing');
          retryTimer.current = setTimeout(() => {
            if (retryWallet.current) doConnect(retryWallet.current);
          }, 3_000);
          return;
        }

        // Wallet is locked or rejected — Lace throws Rejected when locked (no auto-unlock popup)
        const apiCode = isAPIError ? String((e as Record<string, unknown>).code ?? '') : '';
        if (apiCode === 'Rejected' || lower.includes('lock') || lower.includes('unauthorized') || lower.includes('user rejected')) {
          setError(
            `${wallet.name ?? 'Wallet'} is locked. Click the extension icon in your browser toolbar to unlock it, then click "Connect Wallet" again.`,
          );
          setStatus('error');
          return;
        }

        setError(msg);
        setStatus('error');
      });
  };

  const disconnect = useCallback(() => {
    if (retryTimer.current) clearTimeout(retryTimer.current);
    retryWallet.current = null;
    sessionStorage.removeItem(STORAGE_KEY);
    setStatus('disconnected');
    setAddress('');
    setWalletName('');
    setConnectedWallet(null);
    setError('');
    setAvailableWallets([]);
  }, []);

  return (
    <WalletContext.Provider value={{
      status, address, walletName, error, availableWallets, connectedWallet,
      connect, selectWallet, disconnect,
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletState => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('WalletProvider is required');
  return ctx;
};
