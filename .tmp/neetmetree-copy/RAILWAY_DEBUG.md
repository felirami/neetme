# Railway Local Debugging Guide

This guide helps you debug Railway deployment issues locally using the Railway CLI.

## Quick Start

1. **Find your service name:**
   - Go to your Railway dashboard: https://railway.app
   - Open your project "neetme"
   - Look at the services list - common names are: `web`, `api`, `neetme`, or similar
   - The service name is usually shown in the service card/title

2. **Use the debug script:**
   ```bash
   # Check recent logs
   ./scripts/debug-railway.sh logs <service-name>
   
   # Test build with Railway environment
   ./scripts/debug-railway.sh build <service-name>
   
   # Test start command with Railway environment
   ./scripts/debug-railway.sh start <service-name>
   
   # Show environment variables (masked)
   ./scripts/debug-railway.sh env <service-name>
   ```

## Manual Commands

If you prefer to run commands manually:

```bash
# View logs
railway logs -s <service-name> --tail 100

# Run build with Railway environment
railway run -s <service-name> npm run build

# Run start command with Railway environment
railway run -s <service-name> npm start

# Check environment variables (without values)
railway run -s <service-name> env | grep -E "^(DATABASE_URL|NEXT_PUBLIC_|NEXTAUTH_|NODE_ENV)"
```

## Common Issues to Check

### 1. Build Errors
- Run: `railway run -s <service-name> npm run build`
- Check for missing dependencies or TypeScript errors
- Verify `nixpacks.toml` configuration

### 2. Start Command Errors
- Run: `railway run -s <service-name> npm start`
- Check if `.next/standalone` directory exists after build
- Verify `server.js` exists in standalone directory

### 3. Database Connection Issues
- Check `DATABASE_URL` environment variable is set
- Verify PostgreSQL service is running in Railway
- Test connection: `railway run -s <service-name> npx prisma db push`

### 4. Environment Variables Missing
- Check Railway dashboard → Variables tab
- Required variables:
  - `DATABASE_URL` (auto-set by PostgreSQL service)
  - `NEXT_PUBLIC_REOWN_PROJECT_ID`
  - `NEXT_PUBLIC_APP_URL`
  - `NEXTAUTH_URL`
  - `NEXTAUTH_SECRET`
  - `NODE_ENV=production`

### 5. Port Binding Issues
- Railway automatically sets `PORT` environment variable
- Your app should use `process.env.PORT || 3000`
- Check if Next.js standalone server respects PORT

## Testing Locally

1. **Pull Railway environment and test build:**
   ```bash
   railway run -s <service-name> npm run build
   ```

2. **Test the start command:**
   ```bash
   railway run -s <service-name> npm start
   ```
   This will start your app locally with Railway's environment variables.

3. **Check for errors:**
   - Look for database connection errors
   - Check for missing environment variables
   - Verify the standalone build structure

## Next Steps

After identifying the issue:
1. Fix the problem locally
2. Commit and push to GitHub
3. Railway will automatically redeploy
4. Monitor logs: `railway logs -s <service-name> --tail 100`

## Getting Help

- Railway Dashboard: https://railway.app
- Railway Docs: https://docs.railway.com
- Check build logs in Railway dashboard
- Check runtime logs: `railway logs -s <service-name>`

