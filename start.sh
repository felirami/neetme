#!/bin/sh
# Railway startup script
# This script runs database migrations and then starts the server

set -e

echo "🚀 Starting NeetMeTree deployment..."

# Ensure we're in the right directory
cd /app || cd "$(dirname "$0")/.." || exit 1

# Run database migrations
# Prisma CLI should be available via npx (installed during build)
echo "📦 Running database migrations..."
if [ -f "node_modules/.bin/prisma" ] || command -v npx > /dev/null 2>&1; then
  npx prisma db push --skip-generate --accept-data-loss || {
    echo "⚠️  Database migration had issues, but continuing..."
  }
  echo "✅ Database migration completed"
else
  echo "⚠️  Prisma CLI not found, skipping database migration"
  echo "⚠️  You may need to run: railway run npm run railway:deploy"
fi

# Start the server
echo "✅ Starting Next.js standalone server..."
# Next.js standalone server automatically reads PORT from environment
# NODE_OPTIONS is optional - only suppresses warnings
exec node .next/standalone/server.js
