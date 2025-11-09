#!/bin/sh
# Railway startup script
# Starts the Next.js standalone server

set -e

echo "🚀 Starting NeetMeTree server..."

# Ensure we're in the right directory
cd /app || cd "$(dirname "$0")/.." || exit 1

# Start the server
echo "✅ Starting Next.js standalone server..."
# Ensure PORT is set (Railway provides this automatically)
# Default to 8080 if not set (Railway's default)
export PORT=${PORT:-8080}
echo "📡 Server will listen on port: $PORT"
echo "🌐 Health check available at: http://0.0.0.0:$PORT/api/health"

# Next.js standalone server reads PORT from environment automatically
# Use exec to replace shell process with node process
exec node .next/standalone/server.js
