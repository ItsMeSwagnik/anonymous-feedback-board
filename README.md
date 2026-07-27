# Anonymous Feedback Board

A privacy-preserving feedback board built on the [Midnight Network](https://midnight.network/) where users can post anonymous messages that only they can remove.

[![Generic badge](https://img.shields.io/badge/Compact%20Compiler-0.31.0-1abc9c.svg)](https://shields.io/)
[![Generic badge](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://shields.io/)

## 🚀 Live Demo

**Vercel Deployment:** [Deploy to Vercel](https://vercel.com/new) 

**Live URL:** `https://anonymous-feedback-board.vercel.app` *(after deployment)*

> **📋 Deployment Guide:** See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed deployment instructions.

> **⚡ Quick Deploy:**
> ```bash
> npm install -g vercel
> vercel login
> vercel --prod
> ```

## Contract Address

| Network | Contract Address |
|---------|------------------|
| Preprod | `<YOUR_DEPLOYED_CONTRACT_ADDRESS>` |

**Status:** ⏳ Pending Deployment

> **⚠️ Manual Deployment Required:** The contract needs to be deployed manually. See [Deployment Guide](#manual-deployment) for instructions.

## Features

- ✅ **Anonymous Posting**: Users can post messages without revealing their identity
- ✅ **Owner Verification**: Only the original poster can remove their message
- ✅ **Privacy-Preserving**: Uses zero-knowledge proofs to verify ownership without exposing identity
- ✅ **Single Message Board**: One message at a time ensures focused feedback
- ✅ **Dual Interfaces**: Both CLI and web UI available
- ✅ **Lace Wallet Integration**: Seamless wallet connection
- ✅ **Real-time State Updates**: Live contract state synchronization

## What This Project Does

The Anonymous Feedback Board allows anyone to post a single message to a shared public board. The message author is identified only by a cryptographic key that they keep secret. This enables:

- Anonymous feedback in organizations
- Whistleblowing without identity exposure
- Private suggestions and complaints
- Censorship-resistant communication

When someone posts a message, the system creates a zero-knowledge proof that they know the secret key associated with the post, without revealing what that key is. Later, only someone who knows the same secret key can remove the message.

## UI Screenshots

### Main Interface
![Main Interface](./screenshots/ui-main.png)
*The main interface showing the feedback board status*

### Posting a Message
![Post Message](./screenshots/ui-post.png)
*User posting an anonymous message*

### Wallet Connection
![Wallet Connection](./screenshots/ui-wallet.png)
*Lace wallet integration*

### Message View
![View Message](./screenshots/ui-view.png)
*Viewing posted messages on the board*

> **📸 Add Your Screenshots:** After running the application, capture screenshots and add them to the `screenshots/` folder, then update the links above.

## Privacy Model

### Public Information
- **Board State**: Whether the board is vacant or occupied (visible to everyone)
- **Message Content**: The actual message text (visible to everyone once posted)
- **Sequence Number**: Counter tracking how many messages have been posted
- **Owner Hash**: A cryptographic hash of the owner's secret key (not the key itself)

### Private Information
- **Secret Key**: A 32-byte random value known only to the message author
- **Witness Data**: The private state used to generate zero-knowledge proofs

### What Users Prove Without Revealing
- **Ownership**: Users prove they know the secret key without revealing it
- **Board State**: Users prove the board is in the correct state (vacant/occupied) before acting
- **Authorization**: Only the rightful owner can take down their message, proven via ZK proof

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **Smart Contract** | Compact (Midnight's privacy-preserving language) |
| **Frontend** | React 19, Material-UI, Vite |
| **Backend/API** | TypeScript with Midnight.js libraries |
| **CLI** | TypeScript Node.js application |
| **Zero-Knowledge Proofs** | Midnight proof server (Docker) |
| **Wallet** | Lace wallet integration |
| **State Management** | RxJS observables |
| **Private State Storage** | LevelDB |
| **Deployment** | Vercel (Frontend), Manual (Contract) |

## Folder Structure

```
anon-feed/
├── contract/               # Smart contract in Compact language
│   └── src/
│       ├── anon-feed.compact    # Main contract source
│       ├── index.ts             # TypeScript exports
│       ├── witnesses.ts         # Witness function implementations
│       └── managed/             # Compiled contract output (generated)
├── api/                    # Shared API types and utilities
│   └── src/
│       ├── index.ts             # Main API exports
│       ├── common-types.ts      # Shared type definitions
│       └── utils/               # Utility functions
├── anon-feed-cli/        # Command-line interface
│   └── src/
│       ├── index.ts             # CLI main logic
│       ├── config.ts            # Configuration management
│       └── launcher/            # Network-specific launchers
├── anon-feed-ui/         # Web browser interface
│   └── src/
│       ├── App.tsx              # Main React component
│       ├── main.tsx             # Entry point
│       ├── components/          # React UI components
│       ├── contexts/            # React contexts
│       └── hooks/               # Custom React hooks
├── screenshots/            # UI screenshots for README
├── vercel.json            # Vercel deployment configuration
├── README.md              # This file
└── QUICKSTART.md          # Quick setup guide
```

## Quick Start

### Prerequisites

- [x] Node.js v24.11.1 or higher
- [x] Docker Desktop (for proof server)
- [x] Lace wallet browser extension
- [x] Access to Midnight Compact compiler

### Installation

```bash
# Install dependencies
npm install

# Start proof server
cd anon-feed-cli
docker compose -f proof-server-local.yml up -d
cd ..

# Build the project
cd api && npm run build && cd ..
cd anon-feed-cli && npm run build && cd ..
cd anon-feed-ui && npm run build && cd ..
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy the UI
cd anon-feed-ui
vercel

# Follow the prompts to deploy
```

## Manual Deployment

### Step 1: Compile the Contract

```bash
cd contract
set COMPACTC_VERSION=0.31.0
run-compactc compile src/anon-feed.compact ./src/managed/anon-feed
```

### Step 2: Deploy the Contract

```bash
cd anon-feed-cli
npm run preprod-remote
```

Follow the CLI prompts:
1. Choose option `1` to build a fresh wallet
2. Save the wallet address and seed
3. Fund the wallet from [Preprod Faucet](https://midnight-tmnight-preprod.nethermind.dev/)
4. Wait for funds (2-3 minutes)
5. Choose option to deploy a new contract
6. **Save the deployed contract address**

### Step 3: Update Contract Address

Update these files with your actual contract address:

1. **README.md** - Replace `<YOUR_DEPLOYED_CONTRACT_ADDRESS>` in the Contract Address table
2. **anon-feed-ui/.env.preprod** - Set `VITE_CONTRACT_ADDRESS`
3. Search and replace all occurrences in the codebase

## Environment Variables

### Frontend (.env.preprod)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_NETWORK_ID` | Network identifier | `preprod` |
| `VITE_LOGGING_LEVEL` | Log verbosity | `info` |
| `VITE_CONTRACT_ADDRESS` | Deployed contract address | `0x...` |
| `VITE_PROOF_SERVER` | Proof server URL | `http://localhost:6300` |

## Usage

### CLI Interface

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

Access at: http://127.0.0.1:8080

## Troubleshooting

### Wallet Connection Errors

If you see errors like:
```
Midnight Lace wallet has failed to respond. Extension enabled?
Wallet connector API has failed to respond
```

This is **expected** if you haven't set up the Midnight wallet infrastructure yet.

**Solution:**

1. **Install Lace Wallet Extension**
   - Chrome: https://chromewebstore.google.com/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk
   - Edge: https://microsoftedge.microsoft.com/addons/detail/lace/efeiemlfnahiidnjglmehaihacglceia

2. **Configure for Midnight Network**
   ```
   1. Open Lace wallet
   2. Settings → Networks
   3. Add "Midnight Preprod" network
   4. Set proof server: http://localhost:6300
   5. Connect to Preprod network
   ```

3. **Start the Proof Server**
   ```bash
   cd anon-feed-cli
   docker compose -f proof-server-local.yml up -d
   ```

4. **Get Test Tokens**
   - Visit [Preprod Faucet](https://midnight-tmnight-preprod.nethermind.dev/)
   - Request tNIGHT tokens
   - Wait 2-3 minutes for confirmation

### Common Issues

| Issue | Solution |
|-------|----------|
| Contract compilation fails | Ensure Docker is running and you have access to ghcr.io |
| Proof server won't start | Check Docker Desktop is running, port 6300 not in use |
| Wallet not connecting | Install Lace wallet, configure Midnight Preprod network |
| No funds in wallet | Request tNIGHT from [Preprod Faucet](https://midnight-tmnight-preprod.nethermind.dev/) |
| Vercel deployment fails | Check vercel.json configuration and build logs |
| `titleTypographyProps` warning | Minor MUI prop naming - doesn't affect functionality |

## Resources

- [Midnight Documentation](https://docs.midnight.network/)
- [Compact Language Guide](https://docs.midnight.network/compact/writing)
- [Preprod Faucet](https://midnight-tmnight-preprod.nethermind.dev/)
- [Lace Wallet](https://www.lace.io/)
- [Builder Resources](https://pool-morocco-ae1.notion.site/Midnight-Builder-Resources-306087eb373e809c89fbd7f61a5b4d17)

## License

Apache-2.0

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

---

**Built for the Midnight Bootcamp** 🌙
