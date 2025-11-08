# Authentication Setup Guide

This app supports multiple authentication providers. You can use **GitHub**, **Google**, or **Discord** - all are free and easy to set up!

## Quick Setup Comparison

| Provider | Setup Time | Best For | Username Source |
|----------|-----------|----------|-----------------|
| **GitHub** ⭐ | ~2 minutes | Developers | GitHub username |
| **Google** | ~3 minutes | General users | Email prefix |
| **Discord** | ~3 minutes | Gamers/Communities | Discord username |

## GitHub Setup (Recommended)

GitHub is the easiest and fastest to set up:

1. **Go to GitHub Settings**
   - Visit: https://github.com/settings/developers
   - Click "New OAuth App"

2. **Fill in the form:**
   - **Application name**: `NeetMeTree` (or your app name)
   - **Homepage URL**: `http://localhost:1337` (for local dev)
   - **Authorization callback URL**: `http://localhost:1337/api/auth/callback/github`
   - Click "Register application"

3. **Copy your credentials:**
   - Copy the **Client ID**
   - Click "Generate a new client secret" and copy it

4. **Add to `.env` file:**
   ```env
   GITHUB_CLIENT_ID=your_client_id_here
   GITHUB_CLIENT_SECRET=your_client_secret_here
   ```

5. **For production**, update the callback URL to:
   ```
   https://yourdomain.com/api/auth/callback/github
   ```

## Google Setup

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select existing one

2. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URI: `http://localhost:1337/api/auth/callback/google`
   - Copy **Client ID** and **Client Secret**

4. **Add to `.env` file:**
   ```env
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   ```

5. **For production**, update the redirect URI to:
   ```
   https://yourdomain.com/api/auth/callback/google
   ```

## Discord Setup

1. **Go to Discord Developer Portal**
   - Visit: https://discord.com/developers/applications
   - Click "New Application"
   - Name it and create

2. **Set up OAuth2**
   - Go to "OAuth2" in the left sidebar
   - Under "Redirects", add: `http://localhost:1337/api/auth/callback/discord`
   - Copy **Client ID** and **Client Secret** (click "Reset Secret" if needed)

3. **Add to `.env` file:**
   ```env
   DISCORD_CLIENT_ID=your_client_id_here
   DISCORD_CLIENT_SECRET=your_client_secret_here
   ```

4. **For production**, update the redirect URI to:
   ```
   https://yourdomain.com/api/auth/callback/discord
   ```

## Using Multiple Providers

You can enable all three providers at once! Just add all the credentials to your `.env` file:

```env
# GitHub
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Discord
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
```

Users will see all available options on the sign-in page.

## Environment Variables

Make sure your `.env` file includes:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:1337"
NEXTAUTH_SECRET="your-secret-key-here"

# Add at least one provider:
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
# OR
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
# OR
DISCORD_CLIENT_ID=""
DISCORD_CLIENT_SECRET=""
```

## Testing

1. Start your dev server: `npm run dev`
2. Visit `http://localhost:1337`
3. Click "Get Started"
4. Choose your preferred provider
5. Sign in and you'll be redirected to the dashboard!

## Troubleshooting

### "Invalid credentials" error
- Double-check your Client ID and Secret
- Make sure there are no extra spaces in `.env`
- Restart your dev server after changing `.env`

### Callback URL mismatch
- Ensure the callback URL in your provider settings matches exactly:
  - Local: `http://localhost:1337/api/auth/callback/[provider]`
  - Production: `https://yourdomain.com/api/auth/callback/[provider]`

### Username not showing
- Check the browser console for errors
- Verify the user was created in the database: `npm run db:studio`

## Production Deployment

When deploying to production:

1. Update all callback URLs in your provider settings
2. Set `NEXTAUTH_URL` to your production domain
3. Generate a secure `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```
4. Update your database URL if using a production database

## Why These Providers?

- **GitHub**: Free, instant approval, perfect for developers
- **Google**: Widely trusted, used by billions
- **Discord**: Popular with gaming/community audiences

All three are much easier than Twitter/X which requires API approval!

