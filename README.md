# Anonymous Feedback Board

<img width="1917" height="1022" alt="image" src="https://github.com/user-attachments/assets/83a274a6-ca1c-40aa-abb8-2776cf6635f6" />

A privacy-preserving feedback board built on the [Midnight Network](https://midnight.network/) where users can post anonymous messages that only they can remove — proven by zero-knowledge proofs.

[![Compact Compiler](https://img.shields.io/badge/Compact%20Compiler-0.31.0-1abc9c.svg)](https://shields.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://shields.io/)
[![Network](https://img.shields.io/badge/Network-Preprod-orange.svg)](https://shields.io/)

---

## Contract Address

**This section is mandatory.**

| Network | Contract Address |
|---------|------------------|
| Preprod | `<YOUR_DEPLOYED_CONTRACT_ADDRESS>` |

**Status:** ⏳ Pending Deployment

> After deploying, replace `<YOUR_DEPLOYED_CONTRACT_ADDRESS>` everywhere it appears in this project.

---

## Features

- ✅ **Anonymous Posting** — post messages without revealing your identity
- ✅ **ZK Ownership Proof** — only the original poster can remove their message, proven via zero-knowledge proofs
- ✅ **Privacy-Preserving** — secret key never leaves the user's device; no wallet address is ever linked on-chain
- ✅ **Single Message Board** — one message at a time for focused feedback
- ✅ **Dual Interfaces** — both CLI and web UI
- ✅ **Lace / 1AM Wallet Integration** — seamless wallet connection with network validation
- ✅ **Persistent Wallet Session** — wallet address survives page refresh via sessionStorage
- ✅ **Disconnect Support** — one-click wallet disconnect
- ✅ **Real-time State Updates** — live contract state via RxJS observables

---

## What This Project Does

The Anonymous Feedback Board lets anyone post a single message to a shared public board. The message author is identified only by a cryptographic key they keep secret. This enables:

- Anonymous feedback in organisations
- Whistleblowing without identity exposure
- Private suggestions and complaints
- Censorship-resistant communication

When someone posts a message, the system generates a zero-knowledge proof that they know the secret key associated with the post — without revealing what that key is. Later, only someone who knows the same secret key can remove the message.

---

## Privacy Model

> **This is the core privacy claim of this DApp.**

### What is Publicly Visible On-Chain

| Data | Description |
|------|-------------|
| Board State | `VACANT` or `OCCUPIED` — anyone can see whether a message exists |
| Message Content | The text of the posted message (readable by everyone) |
| Sequence Number | A counter of how many messages have been posted total |
| Owner Hash | A cryptographic hash derived from the poster's secret key — *not* the key itself |

### What is Never Revealed

| Data | Why it stays private |
|------|----------------------|
| Secret Key | A 32-byte random value generated locally, never leaves the user's device in plaintext |
| Wallet Address | No wallet address or public key is ever linked to a posted message on-chain |
| Poster Identity | There is no way to determine *who* posted a message from on-chain data alone |

### What Users Prove Without Revealing

| Claim | Proven How | What Stays Private |
|-------|------------|--------------------|
| "I posted this message" | ZK proof: `hash(secretKey) == owner` | The `secretKey` itself |
| "I have the right to remove this" | ZK proof of ownership | Wallet address, identity |
| "The board is vacant" | Public ledger state | Nothing extra needed |

### Privacy Guarantee Summary

An observer watching the Midnight blockchain can see *that* a message was posted and *what* it says, but **cannot determine who posted it**. The only link between a user and their message is a ZK proof that is verified and discarded — it is never stored on-chain.

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Smart Contract | Compact (Midnight's privacy-preserving language) |
| Frontend | React 19, Material-UI v9, Vite |
| Backend/API | TypeScript with Midnight.js libraries |
| CLI | TypeScript Node.js application |
| Zero-Knowledge Proofs | Midnight proof server (Docker) |
| Wallet | Lace / 1AM wallet via DApp Connector API v4 |
| State Management | RxJS observables |
| Private State Storage | LevelDB |
| Deployment | Vercel (Frontend), Manual (Contract) |

---

## Folder Structure

```
anon-feed/
├── contract/                    # Compact smart contract
│   └── src/
│       ├── anon-feed.compact    # Main contract source
│       ├── index.ts             # TypeScript exports
│       ├── witnesses.ts         # Witness function implementations
│       └── managed/             # Compiled contract output (generated)
│           └── anon-feed/
├── api/                         # Shared API types and utilities
│   └── src/
│       ├── index.ts             # AnonFeedAPI class + exports
│       ├── common-types.ts      # Shared type definitions
│       └── utils/               # Utility functions (randomBytes, etc.)
├── anon-feed-cli/               # Command-line interface
│   └── src/
│       ├── index.ts             # CLI main logic
│       ├── config.ts            # Network configuration (preprod/preview/standalone)
│       └── launcher/            # Network-specific entry points
│           ├── preprod.ts
│           ├── preview.ts
│           └── standalone.ts
├── anon-feed-ui/                # Web browser interface
│   └── src/
│       ├── App.tsx              # Root React component
│       ├── main.tsx             # Entry point + provider setup
│       ├── components/          # Board, Header, Layout, dialogs
│       ├── contexts/            # WalletContext, DeployedBoardContext, BrowserDeployedBoardManager
│       └── hooks/               # useDeployedBoardContext
├── screenshots/                 # UI screenshots for README
├── vercel.json                  # Vercel deployment configuration
├── README.md                    # This file
└── QUICKSTART.md                # Quick setup guide
```

---

## Prerequisites

- Node.js v22+ (v24.11.1 recommended)
- Docker Desktop (for proof server)
- Lace wallet ([lace.io/midnight](https://www.lace.io/midnight)) or 1AM wallet ([1am.xyz](https://1am.xyz)) browser extension
- Wallet configured for **Midnight Preprod** network

---

## Installation

```bash
# Clone the repository
git clone https://github.com/ItsMeSwagnik/anonymous-feedback-board.git
cd anonymous-feedback-board

# Install all workspace dependencies
npm install
```

---

## Build

```bash
# Build API
cd api && npm run build && cd ..

# Build CLI
cd anon-feed-cli && npm run build && cd ..

# Build UI (targets preprod by default)
cd anon-feed-ui && npm run build && cd ..
```

Or from the root (if turbo/workspace scripts are configured):

```bash
npm run build
```

---

## Compile

Compile the Compact smart contract:

```bash
cd contract
npm run compact
```

This runs:

```bash
compact compile src/anon-feed.compact ./src/managed/anon-feed
```

The compiler outputs `keys/` and `zkir/` directories under `contract/src/managed/anon-feed/`.

---

## Manual Deployment

> **Deployment is intentionally skipped in this repository.**
> The contract must be deployed manually after cloning.

### Step 1 — Start the proof server

```bash
cd anon-feed-cli
docker compose -f proof-server-local.yml up -d
```

### Step 2 — Deploy the contract

```bash
cd anon-feed-cli
npm run preprod-remote
```

Follow the CLI prompts:

1. Choose `1` — Build a fresh wallet
2. Save the wallet seed and unshielded address
3. Fund the wallet from the [Preprod Faucet](https://midnight-tmnight-preprod.nethermind.dev/)
4. Wait 2–3 minutes for funds to arrive
5. Choose to deploy a new contract
6. **Copy the deployed contract address**

### Step 3 — Run the deployment command

```bash
NODE_OPTIONS="--max-old-space-size=12288" npm run preprod-remote
```

---

## After Deployment

Once you have the deployed contract address, replace **every occurrence** of:

```
<YOUR_DEPLOYED_CONTRACT_ADDRESS>
```

In these files:

1. `README.md` — Contract Address table
2. `anon-feed-ui/.env` — `VITE_CONTRACT_ADDRESS`
3. `anon-feed-ui/.env.preprod` — `VITE_CONTRACT_ADDRESS`

No additional coding is required after this step.

---

## Environment Variables

### Frontend (`anon-feed-ui/.env` / `.env.preprod`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_NETWORK_ID` | Network identifier | `preprod` |
| `VITE_LOGGING_LEVEL` | Log verbosity | `info` |
| `VITE_CONTRACT_ADDRESS` | Deployed contract address | `<YOUR_DEPLOYED_CONTRACT_ADDRESS>` |
| `VITE_PROOF_SERVER` | Proof server URL | `http://localhost:6300` |

### Network Endpoints (Preprod)

| Service | URL |
|---------|-----|
| Node RPC | `https://rpc.preprod.midnight.network` |
| Indexer (GraphQL) | `https://indexer.preprod.midnight.network/api/v4/graphql` |
| Indexer (WebSocket) | `wss://indexer.preprod.midnight.network/api/v4/graphql/ws` |
| Faucet UI | `https://midnight-tmnight-preprod.nethermind.dev/` |
| Block Explorer | `https://preprod.midnightexplorer.com/` |

---

## Network Verification

This app targets **Midnight Preprod** (`networkId = 'preprod'`).

Verified in:
- `anon-feed-ui/.env` → `VITE_NETWORK_ID=preprod`
- `anon-feed-ui/src/main.tsx` → `setNetworkId(networkId)` called at startup
- `anon-feed-cli/src/config.ts` → `PreprodRemoteConfig` calls `setNetworkId('preprod')`
- `WalletContext.tsx` → validates `connectionStatus.networkId === 'preprod'` on connect

If your wallet is on a different network (e.g. mainnet), the app will show:
> "YourWallet" is connected to "mainnet" but this app requires "preprod". Open YourWallet → Settings → Networks and switch to Midnight Preprod.

---

## Usage

### CLI

```bash
cd anon-feed-cli
npm run preprod-remote
```

Menu options:
1. Post a message
2. Take down your message
3. Display the current ledger state
4. Display the current private state
5. Display the current derived state
6. Exit

### Web UI

```bash
cd anon-feed-ui
npm run build:start
```

Access at: `http://127.0.0.1:8080`

Or run in dev mode:

```bash
cd anon-feed-ui
npm run dev
```

---

## Screenshots

### Main Interface
![Main Interface](./screenshots/ui-main.png)

### Posting a Message
![Post Message](./screenshots/ui-post.png)

### Wallet Connection
![Wallet Connection](./screenshots/ui-wallet.png)

### Message View
![View Message](./screenshots/ui-view.png)

> Add screenshots to the `screenshots/` folder after running the application.

---

## Initial Idea

> _Fill in your initial idea and motivation here before submitting on Rise In._

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `"undefined"` in network mismatch error | Wallet is on a non-Midnight network (e.g. mainnet). Switch to Midnight Preprod in wallet settings. |
| Wallet not found | Install Lace ([lace.io/midnight](https://www.lace.io/midnight)) or 1AM ([1am.xyz](https://1am.xyz)), enable Midnight Preprod, reload page |
| "Wallet is syncing" | Open the wallet extension, wait for sync indicator to clear, click Connect Wallet again (auto-retries 30s) |
| Proof server unreachable | Run `docker compose -f proof-server-local.yml up -d` in `anon-feed-cli/` |
| Contract compilation fails | Ensure Docker is running and you have access to `ghcr.io` |
| No funds in wallet | Request tNIGHT from [Preprod Faucet](https://midnight-tmnight-preprod.nethermind.dev/) |
| Vercel deployment fails | Check `vercel.json` and build logs; ensure `VITE_CONTRACT_ADDRESS` is set |
| Address lost on refresh | Fixed — wallet address is persisted in `sessionStorage` after successful connection |

---

## Resources

- [Midnight Documentation](https://docs.midnight.network/)
- [Compact Language Guide](https://docs.midnight.network/compact/writing)
- [DApp Connector API](https://docs.midnight.network/api-reference/dapp-connector)
- [Preprod Faucet](https://midnight-tmnight-preprod.nethermind.dev/)
- [Preprod Explorer](https://preprod.midnightexplorer.com/)
- [Lace Wallet](https://www.lace.io/midnight)
- [1AM Wallet](https://1am.xyz)
- [Builder Resources](https://pool-morocco-ae1.notion.site/Midnight-Builder-Resources-306087eb373e809c89fbd7f61a5b4d17)

---

## License

Apache-2.0

---

**Built for the Midnight Builder Challenge — Rise In Level 1** 🌙
