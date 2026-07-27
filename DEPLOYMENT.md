# Vercel Deployment Guide

This guide helps you deploy the Anonymous Feedback Board UI to Vercel.

## Prerequisites

- Vercel account (free tier is sufficient)
- Vercel CLI installed: `npm install -g vercel`
- GitHub repository pushed and public

## Quick Deploy

### Option 1: Using Vercel CLI

```bash
# Navigate to UI folder
cd anon-feed-ui

# Deploy to Vercel
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name? anon-feed
# - Directory? ./ (already in correct folder)
# - Override settings? N

# After deployment completes, you'll get a URL like:
# https://anon-feed-xyz.vercel.app
```

### Option 2: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `anon-feed-ui`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variables:
   - `VITE_NETWORK_ID`: `preprod`
   - `VITE_LOGGING_LEVEL`: `info`
   - `VITE_CONTRACT_ADDRESS`: `<YOUR_DEPLOYED_CONTRACT_ADDRESS>`
6. Click "Deploy"

## Environment Variables in Vercel

After deployment, configure environment variables:

1. Go to your project in Vercel dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following:

| Name | Value | Environments |
|------|-------|--------------|
| `VITE_NETWORK_ID` | `preprod` | Production, Preview, Development |
| `VITE_LOGGING_LEVEL` | `info` | Production, Preview, Development |
| `VITE_CONTRACT_ADDRESS` | Your actual contract address | Production, Preview, Development |

## Post-Deployment Steps

1. **Update README**: Replace the Vercel link in README.md with your actual deployment URL
2. **Test the Deployment**: Open the Vercel URL in a browser with Lace wallet installed
3. **Add to README**: Update the "Live Demo" section with the working link

## Updating Deployment

After making changes:

```bash
# From the anon-feed-ui folder
vercel --prod

# Or simply push to your main branch (if connected to Git)
git push
```

## Troubleshooting

### Build Fails

- Check that all dependencies are installed: `npm install`
- Verify the build command in vercel.json
- Check Vercel deployment logs for specific errors

### Runtime Errors

- Ensure environment variables are set correctly
- Verify the contract address is valid
- Check browser console for errors

### Wallet Connection Issues

- Ensure users have Lace wallet installed
- The proof server URL should be localhost (for local dev) - Vercel is frontend-only
- Note: The proof server must run locally; Vercel only hosts the frontend

## Important Notes

⚠️ **Proof Server**: The Midnight proof server runs locally via Docker. Vercel only hosts the frontend UI. Users must run the proof server locally to generate zero-knowledge proofs.

⚠️ **Contract Address**: The deployed contract address must be set in environment variables for the UI to interact with the contract.

⚠️ **Local Development**: For local testing, use `npm run dev` or `npm run build:start`. For production, deploy to Vercel.

## Custom Domain (Optional)

To add a custom domain:

1. Go to Vercel dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Wait for SSL certificate provisioning

## Deployment Checklist

- [ ] Vercel CLI installed
- [ ] Project deployed successfully
- [ ] Environment variables configured
- [ ] Contract address set
- [ ] Live link tested with Lace wallet
- [ ] README.md updated with Vercel URL
- [ ] Screenshots added to README

## Useful Commands

```bash
# Check deployment status
vercel ls

# View deployment logs
vercel logs

# Redeploy to production
vercel --prod

# Link local folder to existing project
vercel link

# Pull environment variables from Vercel
vercel env pull
```

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
