# Railway Local Debugging Setup Complete ✅

## What We've Set Up

1. ✅ **Railway CLI** - Already installed and linked to your project
2. ✅ **Project Linked** - Connected to project "neetme" (production environment)
3. ✅ **Debug Script** - Created `scripts/debug-railway.sh` for easy debugging
4. ✅ **Documentation** - Created `RAILWAY_DEBUG.md` with detailed instructions
5. ✅ **Build Fix** - Updated `nixpacks.toml` to ensure public and static files are copied

## Quick Start - Find Your Service Name

Since Railway has multiple services, you need to find your web service name:

1. Go to https://railway.app
2. Open your project "neetme"
3. Look at the services list - you'll see services like:
   - A PostgreSQL database service
   - A web/service for your Next.js app (this is what you need)
4. The service name is usually: `web`, `neetme`, `api`, or similar
   - It's the one that runs your Next.js app (not the database)

## Debug Commands

Once you know your service name (let's call it `<service-name>`):

### 1. Check Recent Logs
```bash
railway logs -s <service-name> --tail 100
```

### 2. Test Build Locally with Railway Environment
```bash
railway run -s <service-name> npm run build
```

### 3. Test Start Command Locally
```bash
railway run -s <service-name> npm start
```
This will start your app locally using Railway's environment variables - perfect for debugging!

### 4. Check Environment Variables
```bash
railway run -s <service-name> env | grep -E "^(DATABASE_URL|NEXT_PUBLIC_|NEXTAUTH_|NODE_ENV)"
```

### 5. Use the Debug Script
```bash
# Check logs
./scripts/debug-railway.sh logs <service-name>

# Test build
./scripts/debug-railway.sh build <service-name>

# Test start
./scripts/debug-railway.sh start <service-name>

# Show env vars (masked)
./scripts/debug-railway.sh env <service-name>
```

## Common Issues to Check

### Issue 1: Build Errors
**Symptoms:** Build fails in Railway
**Debug:**
```bash
railway run -s <service-name> npm run build
```
**Common causes:**
- Missing dependencies
- TypeScript errors
- Environment variables missing during build

### Issue 2: Start Command Errors
**Symptoms:** App builds but doesn't start
**Debug:**
```bash
railway run -s <service-name> npm start
```
**Common causes:**
- `.next/standalone/server.js` not found
- Missing `public` or `.next/static` folders (we fixed this in nixpacks.toml)
- Database connection errors
- Missing environment variables

### Issue 3: Database Connection
**Symptoms:** App starts but can't connect to database
**Debug:**
```bash
railway run -s <service-name> npx prisma db push
```
**Check:**
- `DATABASE_URL` is set correctly
- PostgreSQL service is running in Railway
- Database migrations have run

### Issue 4: Missing Environment Variables
**Symptoms:** App starts but features don't work
**Check required variables:**
- `DATABASE_URL` (auto-set by Railway PostgreSQL)
- `NEXT_PUBLIC_REOWN_PROJECT_ID`
- `NEXT_PUBLIC_APP_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NODE_ENV=production`

## What We Fixed

1. **Updated `nixpacks.toml`** - Added commands to copy `public` and `.next/static` to standalone directory
   - This ensures static assets are available when running the standalone server

## Next Steps

1. **Find your service name** from Railway dashboard
2. **Check the logs** to see what errors are happening:
   ```bash
   railway logs -s <service-name> --tail 100
   ```
3. **Test locally** with Railway environment:
   ```bash
   railway run -s <service-name> npm start
   ```
4. **Fix any issues** you find
5. **Commit and push** - Railway will auto-deploy

## Getting More Help

- **Railway Dashboard:** https://railway.app - Check build logs and runtime logs
- **Railway Docs:** https://docs.railway.com
- **Debug Script:** `./scripts/debug-railway.sh --help`
- **Full Guide:** See `RAILWAY_DEBUG.md`

## Example Workflow

```bash
# 1. Find service name (check Railway dashboard)
# Let's say it's "web"

# 2. Check what's happening
railway logs -s web --tail 100

# 3. Test build locally
railway run -s web npm run build

# 4. Test start locally (this will show errors if any)
railway run -s web npm start

# 5. If you see errors, fix them and redeploy
git add .
git commit -m "Fix deployment issues"
git push
```

Good luck debugging! 🚀

