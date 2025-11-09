# Reown Authentication Setup Guide

This app now uses **Reown** (formerly WalletConnect) for authentication, which provides:

- ✅ **600+ Crypto Wallets** (MetaMask, Coinbase Wallet, Trust Wallet, etc.)
- ✅ **Social Login** (Google, GitHub, Apple, X/Twitter, Discord)
- ✅ **Email Login** (Passwordless)
- ✅ **Smart Wallets** (Auto-created for social/email users)

## Quick Setup (5 minutes)

### Step 1: Get Your Reown Project ID

1. Visit [Reown Dashboard](https://dashboard.reown.com)
2. Sign up or log in (free)
3. Click "Create New Project"
4. Fill in:
   - **Project Name**: `NeetMeTree`
   - **Homepage URL**: `http://localhost:1337` (for local dev)
5. Copy your **Project ID**

### Step 2: Add to Environment Variables

Add to your `.env` file:

```env
NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_APP_URL=http://localhost:1337
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:1337"
NEXTAUTH_SECRET="your-secret-key-here"
```

**Note**: `NEXTAUTH_SECRET` is still used for session management, but you don't need Twitter/Google/GitHub credentials anymore!

### Step 3: Restart Your Dev Server

```bash
npm run dev
```

That's it! 🎉

## How It Works

### For Wallet Users:
1. User clicks "Connect Wallet"
2. Chooses their wallet (MetaMask, Coinbase, etc.)
3. Approves connection
4. App gets their wallet address
5. User account is created/linked automatically

### For Social/Email Users:
1. User clicks "Connect Wallet or Sign In"
2. Chooses email or social provider
3. Signs in with their preferred method
4. Reown creates a smart wallet for them automatically
5. App gets the wallet address
6. User account is created/linked automatically

## Features

### Supported Wallets (600+)
- MetaMask
- Coinbase Wallet
- Trust Wallet
- Rainbow Wallet
- WalletConnect
- And 595+ more!

### Supported Social Logins
- Google
- GitHub
- Apple
- X (Twitter)
- Discord

### Email Login
- Passwordless email authentication
- Magic link sent to email
- Smart wallet auto-created

## Production Setup

When deploying to production:

1. **Update Reown Dashboard**:
   - Go to your project settings
   - Update "Homepage URL" to your production domain
   - Add production domain to allowed origins

2. **Update Environment Variables**:
   ```env
   NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

3. **Update Database**:
   - Switch from SQLite to PostgreSQL for production
   - Update `DATABASE_URL` in `.env`

## Why Reown?

✅ **No API Keys Needed** - Just one Project ID  
✅ **600+ Wallets** - Support all major wallets  
✅ **Social + Email** - Users can choose their preferred method  
✅ **Smart Wallets** - Auto-created for non-crypto users  
✅ **Free** - No cost for basic usage  
✅ **Easy Setup** - 5 minutes vs hours for individual providers  

## Troubleshooting

### "Project ID not found"
- Make sure `NEXT_PUBLIC_REOWN_PROJECT_ID` is set in `.env`
- Restart your dev server after adding it

### "User not found" error
- Make sure you've connected your wallet/signed in first
- Check browser console for errors
- Verify the address is being sent in API requests

### Wallet not connecting
- Make sure you have a wallet extension installed (MetaMask, etc.)
- Try refreshing the page
- Check browser console for errors

## Next Steps

1. Get your Project ID from [dashboard.reown.com](https://dashboard.reown.com)
2. Add it to `.env`
3. Restart the server
4. Test the connection!

That's all you need! 🚀

