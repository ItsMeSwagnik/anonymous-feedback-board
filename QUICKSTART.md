# Quick Start Guide - Anonymous Feedback Board

This guide helps you get the Anonymous Feedback Board running quickly.

## Prerequisites Checklist

- [ ] Node.js v24.11.1 or higher installed
- [ ] Docker Desktop installed and running
- [ ] Lace wallet browser extension installed
- [ ] Access to Midnight Compact compiler (or willing to compile manually)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Start the Proof Server

```bash
cd anon-feed-cli
docker compose -f proof-server-local.yml up -d
cd ..
```

Verify it's running:
```bash
docker ps
```

You should see a container named `anon-feedback-proof-server` or similar.

## Step 3: Compile the Contract (Manual)

⚠️ **This step requires authentication with GitHub Container Registry**

```bash
cd contract
set COMPACTC_VERSION=0.31.0
run-compactc compile src/anon-feed.compact ./src/managed/anon-feed
cd ..
```

If you don't have access to the Compact compiler:
- Contact the Midnight team for access
- Or use the stub files already created (for development/testing only)

## Step 4: Build the Project

### Build API
```bash
cd api
npm run build
cd ..
```

### Build CLI
```bash
cd anon-feed-cli
npm run build
cd ..
```

### Build UI (Optional)
```bash
cd anon-feed-ui
npm run build
cd ..
```

## Step 5: Deploy the Contract (Manual)

### Option A: Using CLI

```bash
cd anon-feed-cli
npm run preprod-remote
```

Then follow the prompts:
1. Choose option `1` to build a fresh wallet
2. Save the wallet address and seed
3. Fund the wallet from the faucet: https://midnight-tmnight-preprod.nethermind.dev/
4. Wait for funds to arrive (2-3 minutes)
5. Choose option to deploy a new contract
6. **Save the deployed contract address**

### Option B: Using Deploy Script

```bash
NODE_OPTIONS="--max-old-space-size=12288" npm run deploy -- --network preprod
```

## Step 6: Update Contract Address

After deployment, update these files with your actual contract address:

### 1. Update README.md
Replace `<YOUR_DEPLOYED_CONTRACT_ADDRESS>` with your actual address.

### 2. Update UI Environment
Edit `anon-feed-ui/.env.preprod`:
```env
VITE_CONTRACT_ADDRESS=<YOUR_DEPLOYED_CONTRACT_ADDRESS>
```

### 3. Update Any Other Config Files
Search for `<YOUR_DEPLOYED_CONTRACT_ADDRESS>` and replace everywhere.

## Step 7: Run the Application

### CLI Interface

```bash
cd anon-feed-cli
npm run preprod-remote
```

Then:
1. Choose option `2` to join existing contract
2. Enter your deployed contract address
3. Use the menu to post/view/remove messages

### Web UI

```bash
cd anon-feed-ui
npm run build:start
```

The UI will be available at http://127.0.0.1:8080

Then:
1. Open in browser with Lace wallet installed
2. Connect your wallet
3. Enter the contract address
4. Post and manage messages

## Common Issues

### Contract Compilation Fails
- Ensure Docker is running
- Check COMPACTC_VERSION is set
- Verify you have access to ghcr.io

### Proof Server Won't Start
- Check Docker Desktop is running
- Ensure port 6300 isn't in use
- Try `docker compose down` then restart

### Wallet Not Connecting
- Install Lace wallet extension
- Configure Midnight Preprod network
- Set proof server to http://localhost:6300
- Fund wallet with tNIGHT from faucet

### No Funds in Wallet
- Visit https://midnight-tmnight-preprod.nethermind.dev/
- Request tNIGHT tokens
- Wait 2-3 minutes for confirmation

## Next Steps

After everything is running:

1. **Test the CLI**: Post a message, view it, remove it
2. **Test the UI**: Connect wallet, post a message
3. **Take Screenshots**: Capture the interface for your README
4. **Update Documentation**: Fill in the Initial Idea section
5. **Push to GitHub**: Commit and push your code

## GitHub Push Instructions

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Anonymous Feedback Board DApp"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/anon-feed.git

# Push to GitHub
git push -u origin master
```

## Useful Commands

```bash
# Check proof server status
docker ps

# Stop proof server
docker compose -f proof-server-local.yml down

# View contract state (CLI)
npm run preprod-remote
# Then choose option 3

# Clear build artifacts
npm run clean (if available)

# Rebuild everything
npm install && npm run build (in each package)
```

## Support

- Midnight Documentation: https://docs.midnight.network/
- Lace Wallet: https://www.lace.io/
- Preprod Faucet: https://midnight-tmnight-preprod.nethermind.dev/
