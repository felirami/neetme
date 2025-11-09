# Railway Deployment - Final Fix

## Problem Summary

The app deploys successfully but Railway can't detect it's running, causing "Application failed to respond" errors.

## Root Cause

Next.js standalone server binds to `localhost` by default, but Railway needs it to bind to `0.0.0.0` (all interfaces) to detect the server is running.

## Solution: Add Environment Variables in Railway Dashboard

Go to Railway Dashboard → Your Service → **Variables** tab and add:

### 1. HOSTNAME (CRITICAL)
```
HOSTNAME=0.0.0.0
```
**Why:** Forces Next.js to listen on all network interfaces so Railway can detect it.

### 2. PORT (Optional but recommended)
```
PORT=8080
```
**Why:** Explicitly sets the port (Railway auto-sets this, but explicit is better).

## Steps to Fix

1. **Go to Railway Dashboard**
2. **Click on your `neetme` service**
3. **Go to "Variables" tab**
4. **Add the HOSTNAME variable:**
   - Click "+ New Variable"
   - Name: `HOSTNAME`
   - Value: `0.0.0.0`
   - Click "Add"
5. **The service will automatically redeploy**
6. **Wait 2-3 minutes for deployment to complete**
7. **Test:** Visit https://neetme-production.up.railway.app

## Why This Wasn't Needed Before

At commit `07119f5` (the last working deployment), either:
- Railway had different default networking behavior
- OR the database tables already existed, so startup was faster
- OR there was a HOSTNAME variable set that got removed

## Current Configuration (All Correct)

✅ **package.json:**
```json
"start": "prisma db push --skip-generate --accept-data-loss && node .next/standalone/server.js"
```
This is NECESSARY - ensures database schema is synced before starting.

✅ **railway.json:**
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```
Simplified configuration - lets Nixpacks handle build automatically.

✅ **nixpacks.toml:**
```toml
[phases.build]
cmds = [
  "npm run build",
  "cp -r public .next/standalone/public || true",
  "cp -r .next/static .next/standalone/.next/static || true"
]
```
Copies static files to standalone build.

## Environment Variables Checklist

In Railway Dashboard, you should have:

- ✅ `DATABASE_URL` (auto-set by Railway)
- ✅ `NEXT_PUBLIC_REOWN_PROJECT_ID`
- ✅ `NEXT_PUBLIC_APP_URL`
- ✅ `NEXTAUTH_URL`
- ✅ `NEXTAUTH_SECRET`
- ✅ `NODE_ENV=production`
- ⚠️ **`HOSTNAME=0.0.0.0`** ← **ADD THIS NOW!**

## Expected Result

After adding `HOSTNAME=0.0.0.0`, your logs should show:

```
Starting Container
> prisma db push --skip-generate --accept-data-loss && node .next/standalone/server.js
The database is already in sync with the Prisma schema.
▲ Next.js 14.2.33
- Local:        http://0.0.0.0:8080  ← Should show 0.0.0.0 now
✓ Ready in 68ms
[Container stays running - no SIGTERM]
```

And your app will be accessible at https://neetme-production.up.railway.app

## Verification

After deployment completes:
1. Check Railway logs - should NOT see "Stopping Container" immediately
2. Visit https://neetme-production.up.railway.app - should load
3. Visit https://neetme-production.up.railway.app/api/health - should return `{"status":"ok"}`

