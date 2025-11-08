# Railway Deployment Guide

This guide will help you deploy NeetMeTree to Railway.

## Prerequisites

1. A GitHub account
2. A Railway account (sign up at https://railway.app)
3. A Reown project ID (get it from https://dashboard.reown.com)

## Important: PostgreSQL Required

**PostgreSQL is required for all environments** - both development and production. The Prisma schema is configured for PostgreSQL and should not be changed.

### Setting up PostgreSQL for Local Development

Before developing locally, you need a PostgreSQL database:

**Option 1: Local PostgreSQL**
1. Install PostgreSQL on your machine
2. Create a database: `createdb neetmetree`
3. Update `.env` with: `DATABASE_URL="postgresql://user:password@localhost:5432/neetmetree"`

**Option 2: Docker**
```bash
docker run --name postgres-neetmetree \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=neetmetree \
  -p 5432:5432 \
  -d postgres
```

**Option 3: Cloud PostgreSQL**
- Use Railway, Supabase, or Neon for a free PostgreSQL database
- Copy the connection string to your `.env` file

## Step 1: Push to GitHub

1. Initialize git repository (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create a new repository on GitHub

3. Push your code:
   ```bash
   git remote add origin https://github.com/yourusername/neetmetree.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Create Railway Project

1. Go to https://railway.app and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway will automatically detect it's a Next.js app

## Step 3: Add PostgreSQL Database

1. In your Railway project, click "New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will automatically create a PostgreSQL database
4. The `DATABASE_URL` environment variable will be automatically set

## Step 4: Configure Environment Variables

In your Railway project settings, add these environment variables:

### Required Variables:

- `NEXT_PUBLIC_REOWN_PROJECT_ID` - Your Reown project ID
- `NEXT_PUBLIC_APP_URL` - Your Railway app URL (e.g., `https://your-app-name.railway.app`)
- `NEXTAUTH_URL` - Same as `NEXT_PUBLIC_APP_URL`
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `NODE_ENV` - Set to `production`

**Note:** `DATABASE_URL` is automatically set by Railway when you add PostgreSQL.

## Step 5: Update Reown Dashboard

1. Go to https://dashboard.reown.com
2. Open your project settings
3. Update the "Homepage URL" to your Railway domain
4. Add your Railway domain to allowed origins

## Step 6: Run Database Migrations

**Important:** Database migrations cannot run during the build phase because the database is not accessible. You must run migrations **after** deployment.

### Option 1: Using Railway Web Terminal (Recommended)

1. In Railway, go to your service
2. Click on the service name
3. Click on the "Deployments" tab
4. Click on the latest deployment
5. Click "View Logs" or use the web terminal
6. Run:
   ```bash
   npx prisma db push
   ```

### Option 2: Using Railway CLI

1. Make sure you're linked to the project: `railway link`
2. Run migrations:
   ```bash
   railway run npx prisma db push
   ```

**Note:** The build script only generates the Prisma client. Migrations must be run separately after deployment when the database is accessible.

## Step 7: Deploy

1. Railway will automatically deploy when you push to GitHub
2. Or manually trigger a deployment from the Railway dashboard
3. Wait for the deployment to complete
4. Your app will be live at `https://your-app-name.railway.app`

## Step 8: Verify Deployment

1. Visit your Railway URL
2. Test sign-in functionality
3. Test creating a profile
4. Test uploading an avatar
5. Test adding links

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is set correctly in Railway
- Check that PostgreSQL service is running
- Ensure Prisma schema is using `postgresql` provider

### Build Failures

- Check Railway build logs for errors
- Ensure all environment variables are set
- Verify `package.json` scripts are correct
- **If you see "Can't reach database server" during build:** This is normal. The database is not accessible during build. Run migrations after deployment using `npx prisma db push` in the Railway terminal.

### Image Upload Issues

- Verify images are being stored in database (check PostgreSQL)
- Check API route logs in Railway
- Ensure base64 data is being saved correctly

### Reown Connection Issues

- Verify `NEXT_PUBLIC_REOWN_PROJECT_ID` is correct
- Check Reown dashboard for allowed origins
- Ensure `NEXT_PUBLIC_APP_URL` matches your Railway domain

## Production Checklist

- [ ] PostgreSQL database added and connected
- [ ] All environment variables set
- [ ] Reown project configured with production URL
- [ ] Database migrations run successfully
- [ ] App deployed and accessible
- [ ] Sign-in functionality tested
- [ ] Image uploads working
- [ ] Links creation working
- [ ] Profile pages accessible

## Custom Domain (Optional)

1. In Railway, go to your service settings
2. Click "Generate Domain" or add a custom domain
3. Update `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL` with your custom domain
4. Update Reown dashboard with the new domain

## Monitoring

Railway provides:
- Build logs
- Runtime logs
- Metrics dashboard
- Database connection monitoring

Check these regularly to ensure your app is running smoothly.

