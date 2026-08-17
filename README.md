# Anonymous Feedback Board

<img width="1917" height="1027" alt="image" src="https://github.com/user-attachments/assets/197fd710-7397-4505-b48a-98ebac233b75" />

<img width="1919" height="1025" alt="image" src="https://github.com/user-attachments/assets/518204c7-cf60-4476-92b2-65d8dd536de0" />

A privacy-preserving feedback board built on the [Midnight Network](https://midnight.network/) where users can post anonymous messages that only they can remove — proven by zero-knowledge proofs.

[![CI](https://github.com/ItsMeSwagnik/anonymous-feedback-board/actions/workflows/ci.yaml/badge.svg)](https://github.com/ItsMeSwagnik/anonymous-feedback-board/actions/workflows/ci.yaml)
[![Compact Compiler](https://img.shields.io/badge/Compact%20Compiler-0.31.0-1abc9c.svg)](https://shields.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://shields.io/)
[![Network](https://img.shields.io/badge/Network-Preview-orange.svg)](https://shields.io/)

---

## Live Demo

[https://anonymous-feedback-board.vercel.app/](https://anonymous-feedback-board.vercel.app/)

---

## Contract Address

**This section is mandatory.**

| Network | Contract Address |
|---------|------------------|
| Preview | `8c29bde18fee927977130a6fda3f9f0e066b0537b1bc9ba3e46c3093ed929614` |

**Status:** ✅ Deployed

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

## Privacy Claim

| What an observer sees | What an observer cannot see |
|-----------------------|-----------------------------|
| Board is `VACANT` or `OCCUPIED` | Who posted the message |
| The message text | The poster's secret key |
| The owner hash (derived from secret key) | The poster's wallet address |
| Sequence number (total posts) | Any link between wallet and message |

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
├── .github/
│   ├── ISSUE_TEMPLATE/          # Bug report, feature request, docs templates
│   ├── PULL_REQUEST_TEMPLATE/
│   ├── workflows/
│   │   ├── ci.yaml              # CI pipeline (compile + test + build)
│   │   └── scan.yaml            # Security scan workflow
│   └── dependabot.yml
├── contract/                    # Compact smart contract
│   └── src/
│       ├── anon-feed.compact    # Main contract source
│       ├── index.ts             # TypeScript exports
│       ├── witnesses.ts         # Witness function implementations
│       ├── managed/             # Compiled contract output (generated)
│       │   └── anon-feed/
│       │       ├── compiler/
│       │       ├── contract/
│       │       ├── keys/
│       │       └── zkir/
│       └── test/
│           ├── bboard.test.ts   # 9 contract tests
│           ├── bboard-simulator.ts
│           └── utils.ts
├── api/                         # Shared API types and utilities
│   └── src/
│       ├── index.ts             # AnonFeedAPI class + exports
│       ├── common-types.ts      # Shared type definitions
│       └── utils/
│           └── index.ts
├── anon-feed-cli/               # Command-line interface
│   └── src/
│       ├── launcher/            # Network-specific entry points
│       │   ├── preprod.ts
│       │   ├── preview.ts
│       │   └── standalone.ts
│       ├── config.ts            # Network configuration
│       ├── deploy.ts
│       ├── index.ts             # CLI main logic
│       ├── logger-utils.ts
│       ├── midnight-wallet-provider.ts
│       └── wallet-utils.ts
├── anon-feed-ui/                # Web browser interface
│   ├── public/
│   │   ├── keys/                # ZK prover/verifier keys
│   │   └── zkir/                # ZK IR files
│   └── src/
│       ├── components/
│       │   ├── Layout/          # Header, MainLayout
│       │   ├── Board.tsx
│       │   ├── Board.EmptyCardContent.tsx
│       │   ├── TextPromptDialog.tsx
│       │   └── WalletPickerDialog.tsx
│       ├── config/
│       │   └── theme.ts
│       ├── contexts/
│       │   ├── WalletContext.tsx
│       │   ├── DeployedBoardContext.tsx
│       │   └── BrowserDeployedBoardManager.ts
│       ├── hooks/
│       │   └── useDeployedBoardContext.ts
│       ├── App.tsx              # Root React component
│       ├── main.tsx             # Entry point + provider setup
│       ├── globals.ts
│       └── in-memory-private-state-provider.ts
├── vercel.json                  # Vercel deployment configuration
├── PROPOSAL.md
├── QUICKSTART.md
├── README.md
└── package.json                 # Workspace root
```

---

## Prerequisites

- Node.js v22+ (v24.11.1 recommended)
- Docker Desktop (for proof server)
- Lace wallet ([lace.io/midnight](https://www.lace.io/midnight)) or 1AM wallet ([1am.xyz](https://1am.xyz)) browser extension
- Wallet configured for **Midnight Preview** network

---

## Setup & Run Locally

```bash
# Clone the repository
git clone https://github.com/ItsMeSwagnik/anonymous-feedback-board.git
cd anonymous-feedback-board

# Install all workspace dependencies
npm install

# Start the proof server (Docker required)
cd anon-feed-cli
docker compose -f proof-server-local.yml up -d
cd ..

# Run the web UI in dev mode
cd anon-feed-ui
npm run dev
# Access at http://127.0.0.1:5173
```

---

## Run Tests

```bash
cd contract
npm test
```

The test suite covers circuit logic, state transitions, ownership enforcement, and privacy guarantees (9 tests total).

---

## CI/CD

The pipeline (`.github/workflows/ci.yaml`) runs on every push to `main` and on every pull request. It:

1. Checks out the code
2. Installs the Compact compiler via `midnightntwrk/setup-compact-action`
3. Installs Node.js v24
4. Runs `npm ci` for all workspace packages
5. Compiles the Compact contract and runs the full test suite
6. Builds the API, CLI, and UI

---

## Product Proposal

See [PROPOSAL.md](./PROPOSAL.md)

---

## Build

```bash
# Build API
cd api && npm run build && cd ..

# Build CLI
cd anon-feed-cli && npm run build && cd ..

# Build UI (targets preview by default)
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
npm run preview-remote
```

Follow the CLI prompts:

1. Choose `1` — Build a fresh wallet
2. Save the wallet seed and unshielded address
3. Fund the wallet from the [Preview Faucet](https://faucet.preview.midnight.network/)
4. Wait 2–3 minutes for funds to arrive
5. Choose to deploy a new contract
6. **Copy the deployed contract address**

### Step 3 — Run the deployment command

```bash
NODE_OPTIONS="--max-old-space-size=12288" npm run preview-remote
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
3. `anon-feed-ui/.env.preview` — `VITE_CONTRACT_ADDRESS`

No additional coding is required after this step.

---

## Environment Variables

### Frontend (`anon-feed-ui/.env` / `.env.preprod`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_NETWORK_ID` | Network identifier | `preview` |
| `VITE_LOGGING_LEVEL` | Log verbosity | `info` |
| `VITE_CONTRACT_ADDRESS` | Deployed contract address | `8c29bde18fee927977130a6fda3f9f0e066b0537b1bc9ba3e46c3093ed929614` |
| `VITE_PROOF_SERVER` | Proof server URL | `http://localhost:6300` |

### Network Endpoints (Preview)

| Service | URL |
|---------|-----|
| Node RPC | `https://rpc.preview.midnight.network` |
| Indexer (GraphQL) | `https://indexer.preview.midnight.network/api/v4/graphql` |
| Indexer (WebSocket) | `wss://indexer.preview.midnight.network/api/v4/graphql/ws` |
| Faucet UI | `https://faucet.preview.midnight.network/` |
| Block Explorer | `https://preview.midnightexplorer.com/` |

---

## Network Verification

This app targets **Midnight Preview** (`networkId = 'preview'`).

Verified in:
- `anon-feed-ui/.env` → `VITE_NETWORK_ID=preview`
- `anon-feed-ui/src/main.tsx` → `setNetworkId(networkId)` called at startup
- `anon-feed-cli/src/config.ts` → `PreviewRemoteConfig` calls `setNetworkId('preview')`
- `WalletContext.tsx` → validates `connectionStatus.networkId === 'preview'` on connect

If your wallet is on a different network (e.g. mainnet), the app will show:
> "YourWallet" is connected to "mainnet" but this app requires "preview". Open YourWallet → Settings → Networks and switch to Midnight Preview.

---

## Usage

### CLI

```bash
cd anon-feed-cli
npm run preview-remote
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

## Live Demo Link (Vercel):
https://anonymous-feedback-board.vercel.app/

## Google Drive Demo Link:
https://drive.google.com/file/d/1ZGCeUXgfycM9hKYQ8ZqjV0QDqpULZB1W/view?usp=sharing

## Initial Idea

> _The Anonymous Feedback Board lets anyone post a single message to a shared public board. The message author is identified only by a cryptographic key they keep secret._

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Network mismatch error | Wallet is on a non-Midnight network. Switch to Midnight Preview in wallet settings. |
| Wallet not found | Install Lace ([lace.io/midnight](https://www.lace.io/midnight)) or 1AM ([1am.xyz](https://1am.xyz)), enable Midnight Preview, reload page |
| Wallet is locked | Unlock the extension manually, then click Connect Wallet again |
| "Wallet is syncing" | Open the wallet extension, wait for sync indicator to clear, click Connect Wallet again (auto-retries 30s) |
| Proof server unreachable | Run `docker compose -f proof-server-local.yml up -d` in `anon-feed-cli/` |
| Contract compilation fails | Ensure Docker is running and you have access to `ghcr.io` |
| No funds in wallet | Request tNIGHT from [Preview Faucet](https://faucet.preview.midnight.network/) |
| Vercel deployment fails | Check `vercel.json` and build logs; ensure `VITE_CONTRACT_ADDRESS` is set |
| Address lost on refresh | Fixed — wallet address is persisted in `sessionStorage` after successful connection |

---

## Resources

- [Midnight Documentation](https://docs.midnight.network/)
- [Compact Language Guide](https://docs.midnight.network/compact/writing)
- [DApp Connector API](https://docs.midnight.network/api-reference/dapp-connector)
- [Preview Faucet](https://faucet.preview.midnight.network/)
- [Preview Explorer](https://preview.midnightexplorer.com/)
- [Lace Wallet](https://www.lace.io/midnight)
- [1AM Wallet](https://1am.xyz)
- [Builder Resources](https://pool-morocco-ae1.notion.site/Midnight-Builder-Resources-306087eb373e809c89fbd7f61a5b4d17)

---

## License

Apache-2.0

---

**Built for the Midnight Builder Challenge — Rise In** 🌙
