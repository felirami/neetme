# Environment Variables Setup

Copy this file to `.env` and fill in your values:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:1337"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
TWITTER_CLIENT_ID="your-twitter-client-id"
TWITTER_CLIENT_SECRET="your-twitter-client-secret"
```

## Getting Twitter OAuth Credentials

1. Go to https://developer.twitter.com/en/portal/projects-and-apps
2. Create a new project and app
3. Under "User authentication settings", enable OAuth 2.0
4. Set the callback URL to: `http://localhost:1337/api/auth/callback/twitter`
5. Copy your Client ID and Client Secret

## Generating NEXTAUTH_SECRET

Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

