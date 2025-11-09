#!/bin/bash

# Railway Local Debugging Script
# This script helps debug Railway deployment issues locally

set -e

echo "🔍 Railway Local Debugging Script"
echo "=================================="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed"
    echo "Install it with: curl -fsSL https://railway.com/install.sh | sh"
    exit 1
fi

echo "✅ Railway CLI is installed"
echo ""

# Check if logged in
echo "📋 Checking Railway connection..."
railway whoami
echo ""

# Check project status
echo "📋 Project status:"
railway status
echo ""

# Try to get service list (non-interactive)
echo "📋 Attempting to list services..."
echo "Note: If this fails, you may need to manually specify the service name"
echo ""

# Try to run a simple command to see available services
echo "🔍 Testing Railway environment connection..."
echo ""

# Function to test build with Railway env
test_build() {
    local SERVICE=$1
    echo "🏗️  Testing build with Railway environment (Service: $SERVICE)..."
    railway run -s "$SERVICE" npm run build
}

# Function to test start with Railway env
test_start() {
    local SERVICE=$1
    echo "🚀 Testing start command with Railway environment (Service: $SERVICE)..."
    echo "This will start the server - press Ctrl+C to stop"
    railway run -s "$SERVICE" npm start
}

# Function to show environment variables (without values for security)
show_env_vars() {
    local SERVICE=$1
    echo "📋 Environment variables for service: $SERVICE"
    railway run -s "$SERVICE" env | grep -E "^(DATABASE_URL|NEXT_PUBLIC_|NEXTAUTH_|NODE_ENV)" | sed 's/=.*/=***/' || echo "Could not retrieve environment variables"
}

# Function to check logs
check_logs() {
    local SERVICE=$1
    echo "📋 Recent logs for service: $SERVICE"
    railway logs -s "$SERVICE" --tail 50 || echo "Could not retrieve logs"
}

echo "Usage:"
echo "  ./scripts/debug-railway.sh build <service-name>    - Test build with Railway env"
echo "  ./scripts/debug-railway.sh start <service-name>    - Test start with Railway env"
echo "  ./scripts/debug-railway.sh env <service-name>      - Show env vars (masked)"
echo "  ./scripts/debug-railway.sh logs <service-name>     - Show recent logs"
echo ""
echo "To find your service name, check your Railway dashboard or run:"
echo "  railway service"
echo ""

# If service name provided, run the command
if [ "$1" == "build" ] && [ -n "$2" ]; then
    test_build "$2"
elif [ "$1" == "start" ] && [ -n "$2" ]; then
    test_start "$2"
elif [ "$1" == "env" ] && [ -n "$2" ]; then
    show_env_vars "$2"
elif [ "$1" == "logs" ] && [ -n "$2" ]; then
    check_logs "$2"
else
    echo "💡 To use this script, provide a command and service name:"
    echo "   Example: ./scripts/debug-railway.sh logs web"
    echo ""
    echo "Common service names in Railway are usually: 'web', 'api', or your app name"
fi

