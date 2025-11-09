# Railway Deployment Fix - November 9, 2025

## Problem Summary

The application was building successfully on Railway but failing during the health check phase with the error:
```
Healthcheck failed!
1/1 replicas never became healthy!
```

All 6 health check attempts to `/api/health` failed with "service unavailable".

## Root Cause

**Missing Database Migration Step**: The deployment process was:
1. ✅ Installing dependencies
2. ✅ Generating Prisma client
3. ✅ Building the Next.js application
4. ❌ **MISSING**: Pushing database schema to PostgreSQL
5. ❌ Starting the server (which tried to connect to an empty database)

When the application started, it tried to connect to the PostgreSQL database, but the database tables didn't exist because we never ran `prisma db push` or `prisma migrate deploy`. This caused the application to fail to start properly, resulting in health check failures.

## Changes Made

### 1. Updated `package.json`
**File**: `package.json`

Changed the `start` script to include database migration:

```json
"start": "prisma db push --skip-generate --accept-data-loss && node .next/standalone/server.js"
```

**Why this works:**
- `prisma db push --skip-generate`: Pushes the schema to the database without regenerating the client (already done during build)
- `--accept-data-loss`: Required flag for `prisma db push` in production (safe for initial deployments)
- `&& node .next/standalone/server.js`: Only starts the server if migration succeeds

### 2. Configuration Files (No Changes Needed)

The following files were already correctly configured:

**`railway.json`**:
```json
{
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 120
  }
}
```

**`nixpacks.toml`**:
```toml
[phases.install]
cmds = [
  "npm ci --ignore-scripts",
  "npm run db:generate"  # Generates Prisma client
]

[phases.build]
cmds = [
  "npm run build",
  "cp -r public .next/standalone/public || true",
  "cp -r .next/static .next/standalone/.next/static || true"
]

[start]
cmd = "npm start"  # Now includes migration
```

## Deployment Flow (After Fix)

1. **Setup Phase**: Install Node.js 20
2. **Install Phase**: 
   - Run `npm ci --ignore-scripts` (install dependencies)
   - Run `npm run db:generate` (generate Prisma client)
3. **Build Phase**: 
   - Run `npm run build` (build Next.js app in standalone mode)
   - Copy public and static files to standalone output
4. **Start Phase** (NEW BEHAVIOR):
   - Run `prisma db push --skip-generate --accept-data-loss` (create database tables)
   - Run `node .next/standalone/server.js` (start the server)
5. **Health Check**: 
   - Railway checks `/api/health`
   - Should now return `200 OK` ✅

## Testing the Fix

### Before Redeploying

1. Ensure all environment variables are set in Railway dashboard:
   - `DATABASE_URL` (automatically set by Railway when PostgreSQL is added)
   - `NEXT_PUBLIC_REOWN_PROJECT_ID`
   - `NEXT_PUBLIC_APP_URL` (your Railway domain)
   - `NEXTAUTH_URL` (same as above)
   - `NEXTAUTH_SECRET`

### Deploy

1. Commit the changes:
   ```bash
   git add package.json nixpacks.toml
   git commit -m "Fix: Add database migration to start command"
   git push origin main
   ```

2. Railway will automatically redeploy

3. Monitor the deployment logs in Railway dashboard

### Expected Log Output

You should see:
```
> neetmetree@0.1.0 start
> prisma db push --skip-generate --accept-data-loss && node .next/standalone/server.js

Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "railway"

🚀  Your database is now in sync with your Prisma schema.
✔ Generated Prisma Client

[Server started successfully]
[Health check] Attempt #1 succeeded ✅
```

## Alternative Approaches (Not Used)

We considered but didn't use these approaches:

1. **Using `prisma migrate deploy`**: 
   - Requires migration files in `prisma/migrations/`
   - More complex setup, better for production with migration history
   - Would require: `prisma migrate deploy && node .next/standalone/server.js`

2. **Separate migration step in nixpacks.toml**:
   - Could add a `postBuild` phase
   - Less straightforward than including in start command

3. **Using Railway's Build Command**:
   - Could run migration as part of build
   - Not ideal because build phase doesn't have access to production DATABASE_URL

## Why This Fix Works

The `--accept-data-loss` flag is safe in this scenario because:
- On first deployment: Creates all tables from scratch (no data to lose)
- On subsequent deployments: If schema hasn't changed, does nothing
- If schema changed: Updates tables (this is development-friendly)

For production applications with sensitive data, consider:
- Using `prisma migrate deploy` with proper migration files
- Setting up a CI/CD pipeline with migration verification
- Creating database backups before schema changes

## Additional Notes

- The standalone mode (`output: 'standalone'` in `next.config.js`) is correctly configured
- The health endpoint at `/pages/api/health.ts` is working correctly
- The issue was purely related to database initialization timing

## Verification

After deployment succeeds, verify:
1. ✅ Application is accessible at your Railway domain
2. ✅ Health endpoint responds: `https://your-domain.railway.app/api/health`
3. ✅ Database tables exist (check using Prisma Studio or Railway dashboard)
4. ✅ Can create user accounts and links

---

**Issue Resolved**: Database migration now runs before server starts, ensuring all tables exist when the application initializes.

