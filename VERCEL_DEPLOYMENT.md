# Vercel Deployment Guide

This guide will help you deploy your Anonymous Feedback Board to Vercel.

## 🚀 Quick Deploy

### Option 1: Deploy via Vercel CLI (Recommended)

```bash
# 1. Install Vercel CLI globally
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Navigate to project root
cd d:\Swagnik\Codes\anon-feed

# 4. Deploy to production
vercel --prod
```

Follow the prompts:
- **Set up and deploy?** → `Y`
- **Which scope?** → Select your account
- **Link to existing project?** → `N`
- **Project name?** → `anonymous-feedback-board` (or your preferred name)
- **Directory?** → `./` (already in root)
- **Override settings?** → `N`

### Option 2: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. **Import Git Repository**:
   - Select GitHub
   - Choose `ItsMeSwagnik/anonymous-feedback-board`
4. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `cd anon-feed-ui && npm install && npm run build`
   - **Output Directory**: `anon-feed-ui/dist`
5. **Add Environment Variables**:
   - `VITE_NETWORK_ID`: `preprod`
   - `VITE_LOGGING_LEVEL`: `info`
6. Click **"Deploy"**

## ⚙️ Environment Variables

After deployment, configure environment variables in Vercel:

### Via Dashboard:
1. Go to your project in Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add the following:

| Name | Value | Environments |
|------|-------|--------------|
| `VITE_NETWORK_ID` | `preprod` | Production, Preview, Development |
| `VITE_LOGGING_LEVEL` | `info` | Production, Preview, Development |

### Via CLI:
```bash
vercel env add VITE_NETWORK_ID preprod
vercel env add VITE_LOGGING_LEVEL info
```

## 📝 Important Notes

### ⚠️ Contract Address

The UI needs the deployed contract address to work. After deploying your contract:

1. **Update `.env.preprod`** in `anon-feed-ui/`:
   ```env
   VITE_CONTRACT_ADDRESS=<YOUR_DEPLOYED_CONTRACT_ADDRESS>
   ```

2. **Add to Vercel Environment Variables**:
   ```bash
   vercel env add VITE_CONTRACT_ADDRESS <your-actual-contract-address>
   ```

3. **Update README** with the actual contract address

### ⚠️ Proof Server

**Important:** The Midnight proof server runs locally via Docker. Vercel only hosts the frontend.

Users will need to:
- Run the proof server locally: `docker compose -f proof-server-local.yml up -d`
- Configure their wallet to use `http://localhost:6300` as the proof server

### ⚠️ Wallet Connection

The app requires a Midnight-compatible wallet extension:
- Lace: https://www.lace.io/
- 1AM: https://1amwallet.com/

Users must install the wallet extension to interact with the dApp.

## 🔄 Updating Deployment

### Automatic (Git Push):
If connected to GitHub, pushing to main branch automatically deploys:
```bash
git push origin main
```

### Manual (CLI):
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## 🌐 Custom Domain (Optional)

To add a custom domain:

1. Go to Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Add your domain
3. Configure DNS records:
   - **Type**: `A` or `CNAME`
   - **Value**: Provided by Vercel
4. Wait for SSL certificate (automatic)

## 📊 Deployment Checklist

- [ ] Vercel CLI installed (`npm install -g vercel`)
- [ ] Logged into Vercel (`vercel login`)
- [ ] Project deployed (`vercel --prod`)
- [ ] Environment variables configured
- [ ] Contract address added (after deployment)
- [ ] Live URL tested
- [ ] README updated with Vercel URL
- [ ] Screenshots added to README

## 🐛 Troubleshooting

### Build Fails
```bash
# Check build locally
cd anon-feed-ui
npm install
npm run build
```

### Missing Dependencies
```bash
# Reinstall all dependencies
npm install
cd anon-feed-ui && npm install
```

### Environment Variables Not Working
```bash
# Pull environment variables from Vercel
vercel env pull

# Restart dev server
npm run dev
```

### Contract Address Not Found
- Ensure `VITE_CONTRACT_ADDRESS` is set in Vercel
- Redeploy after adding the variable
- Clear browser cache

## 📈 Vercel Dashboard Features

Once deployed, you can:

- **View Analytics**: Traffic, performance metrics
- **Check Deployments**: Build logs, deployment history
- **Manage Domains**: Custom domain configuration
- **Environment Variables**: Manage across environments
- **Rollback**: Revert to previous deployments

## 🔗 Useful Links

- **Vercel Documentation**: https://vercel.com/docs
- **Vite Deployment Guide**: https://vitejs.dev/guide/static-deploy.html
- **Vercel CLI Reference**: https://vercel.com/docs/cli
- **Your Deployment**: `https://anonymous-feedback-board.vercel.app` (after deployment)

## 🎯 Next Steps After Deployment

1. ✅ Copy your Vercel URL
2. ✅ Update README.md with the live link
3. ✅ Test the deployed app
4. ✅ Take screenshots for README
5. ✅ Share your deployment!

## 💡 Pro Tips

- Use `vercel --debug` for detailed build logs
- Preview deployments are automatic for PRs
- Use `vercel ls` to list all your deployments
- Set up automatic deployments from Git branches
