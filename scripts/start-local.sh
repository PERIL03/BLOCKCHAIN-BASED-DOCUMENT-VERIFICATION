#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "🚀 Starting local blockchain document verification demo..."

# Start Hardhat node in background
if ! lsof -iTCP:8545 -sTCP:LISTEN -P -n >/dev/null 2>&1; then
  echo "📡 Starting Hardhat node..."
  nohup npx hardhat node > /tmp/hardhat-local.log 2>&1 &
  sleep 3
fi

# Deploy contract to localhost
echo "📝 Deploying contract to localhost..."
npx hardhat run scripts/deploy.js --network localhost

# Start backend
if ! lsof -iTCP:5001 -sTCP:LISTEN -P -n >/dev/null 2>&1; then
  echo "🔧 Starting backend on port 5001..."
  cd backend
  DOTENV_CONFIG_PATH="../.env" nohup node -r dotenv/config server.js > /tmp/backend-local.log 2>&1 &
  cd ..
  sleep 3
fi

# Start frontend
if ! lsof -iTCP:3000 -sTCP:LISTEN -P -n >/dev/null 2>&1; then
  echo "🌐 Starting frontend on port 3000..."
  cd client
  nohup npm start > /tmp/frontend-local.log 2>&1 &
  cd ..
  sleep 5
fi

echo ""
echo "✅ Local demo is running!"
echo ""
echo "🔗 Links:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5001"
echo "   API Docs: http://localhost:5001/api"
echo "   Health Check: http://localhost:5001/health"
echo ""
echo "📊 Logs:"
echo "   Hardhat: tail -f /tmp/hardhat-local.log"
echo "   Backend: tail -f /tmp/backend-local.log" 
echo "   Frontend: tail -f /tmp/frontend-local.log"
echo ""
echo "🛑 To stop: ./scripts/stop-local.sh"