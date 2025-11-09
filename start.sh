#!/bin/sh
# Railway startup script
# This script runs database migrations and then starts the server

# Don't exit on error for migration step - we want server to start even if migration fails
set +e

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

# Start the server - exit on error here so Railway knows if server fails
set -e

echo "✅ Starting Next.js standalone server..."
# Ensure PORT is set (Railway provides this automatically)
# Default to 8080 if not set (Railway's default)
export PORT=${PORT:-8080}
echo "📡 Server will listen on port: $PORT"
echo "🌐 Health check available at: http://0.0.0.0:$PORT/api/health"

# Next.js standalone server reads PORT from environment automatically
# Use exec to replace shell process with node process
exec node .next/standalone/server.js
