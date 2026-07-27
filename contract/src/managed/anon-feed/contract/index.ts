// Stub file for Vercel build - replace with actual compiled output
// Run locally: cd contract && set COMPACTC_VERSION=0.31.0 && run-compactc compile src/anon-feed.compact ./src/managed/anon-feed

export const State = { VACANT: 0, OCCUPIED: 1 } as const;
export type State = 0 | 1;

export interface Contract<T> {
  [key: string]: any;
}

export interface Witnesses<T> {
  [key: string]: any;
}

export const ledger = () => ({});
export const pureCircuits = { publicKey: () => new Uint8Array(32) };

export const Contract = {} as any;
export const Witnesses = {} as any;

