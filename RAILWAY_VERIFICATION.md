# Railway Deployment Verification Checklist

## ✅ Configuration Files Verified

### 1. Railway Configuration (`railway.json`)
- ✅ Builder: NIXPACKS
- ✅ Build command: `npm run build`
- ✅ Start command: `npm start` (uses standalone server)
- ✅ Restart policy: ON_FAILURE with 10 retries

### 2. Nixpacks Configuration (`nixpacks.toml`)
- ✅ Node.js version: 20
- ✅ Install phase: `npm ci --ignore-scripts` + `npm run db:generate`
- ✅ Build phase: `npm run build`
- ✅ Start command: `npm start`

### 3. Next.js Configuration (`next.config.js`)
- ✅ Standalone output enabled: `output: 'standalone'`
- ✅ CSP headers configured for Reown/WalletConnect
- ✅ React strict mode enabled

### 4. Package.json Scripts
- ✅ `build`: `next build` (creates standalone output)
- ✅ `start`: `node .next/standalone/server.js` (correct for Railway)
- ✅ `db:generate`: `prisma generate` (runs during build)

## ✅ Port Configuration

- ✅ Next.js standalone server automatically reads `PORT` from environment
- ✅ Railway sets `PORT` automatically (usually 8080)
- ✅ No hardcoded ports in code

## ✅ Database Configuration

- ✅ Prisma schema uses PostgreSQL provider
- ✅ `DATABASE_URL` read from environment (Railway auto-sets this)
- ✅ Prisma client generated during build phase
- ✅ Database connection handled in `lib/prisma.ts`

## ✅ Health Check

- ✅ Health endpoint: `/api/health`
- ✅ Returns: `{ status: 'ok', timestamp, uptime }`
- ✅ Available for Railway health checks

## ✅ Environment Variables Required

### Required in Railway Dashboard:

1. **DATABASE_URL** 
   - ✅ Automatically set by Railway when PostgreSQL is added
   - ✅ Format: `postgresql://user:password@host:port/database`

2. **NEXT_PUBLIC_REOWN_PROJECT_ID**
   - ✅ Required for Reown AppKit
   - ✅ Get from: https://dashboard.reown.com
   - ✅ Must be set before build

3. **NEXT_PUBLIC_APP_URL**
   - ✅ Your Railway app URL (e.g., `https://your-app-name.up.railway.app`)
   - ✅ Used for metadata and redirects
   - ✅ Must match Railway domain

4. **NODE_ENV**
   - ✅ Set to `production` in Railway
   - ✅ Affects logging and optimizations

### Optional (but recommended):

5. **NEXTAUTH_URL**
   - ✅ Same as `NEXT_PUBLIC_APP_URL`
   - ✅ Used for authentication callbacks

6. **NEXTAUTH_SECRET**
   - ✅ Generate with: `openssl rand -base64 32`
   - ✅ Used for session encryption

## ✅ Build Process Verification

- ✅ Build tested locally: **SUCCESS**
- ✅ Standalone output created: `.next/standalone/`
- ✅ All pages compile correctly
- ✅ No build errors or warnings (except expected React Native dependency warning)

## ✅ Code Quality

- ✅ TypeScript compilation: No errors
- ✅ ESLint: No errors
- ✅ React hooks: Properly configured with useCallback
- ✅ Error handling: Proper try-catch blocks
- ✅ Environment variable validation: Project ID checked at build time

## ✅ Deployment Steps

1. **Pre-deployment:**
   - [x] Code pushed to GitHub
   - [x] Railway project created
   - [x] PostgreSQL database added (user confirmed)
   - [ ] Environment variables set in Railway dashboard

2. **Deployment:**
   - [ ] Railway detects Next.js and builds automatically
   - [ ] Build completes successfully
   - [ ] Server starts on Railway's PORT
   - [ ] Health check passes

3. **Post-deployment:**
   - [ ] Verify app loads at Railway URL
   - [ ] Test wallet connection
   - [ ] Test user creation
   - [ ] Test profile features
   - [ ] Update Reown dashboard with Railway domain

## ⚠️ Important Notes

1. **Environment Variables:**
   - Must be set BEFORE deployment
   - `NEXT_PUBLIC_REOWN_PROJECT_ID` is checked at build time
   - If missing, build will fail with clear error

2. **Reown Dashboard:**
   - Must add Railway domain to allowed origins
   - Update homepage URL to Railway domain
   - This prevents CSP errors

3. **Database:**
   - PostgreSQL is already initialized (user confirmed)
   - `DATABASE_URL` is auto-set by Railway
   - No manual migration needed (Prisma handles schema)

4. **Port:**
   - Railway sets `PORT` automatically
   - Next.js standalone reads it automatically
   - No configuration needed

## 🚀 Ready for Deployment

**Status: ✅ READY**

All configuration files are correct. The application will:
- Build successfully with Nixpacks
- Start the standalone Next.js server
- Connect to PostgreSQL automatically
- Listen on Railway's PORT
- Serve health checks at `/api/health`

**Next Steps:**
1. Set environment variables in Railway dashboard
2. Deploy (automatic on push or manual trigger)
3. Verify deployment
4. Update Reown dashboard with Railway domain

