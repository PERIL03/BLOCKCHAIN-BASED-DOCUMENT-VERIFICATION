#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="/tmp/final_fullstack_demo_logs"
mkdir -p "$LOG_DIR"

# Start Hardhat node
HARDHAT_LOG="$LOG_DIR/hardhat-node.log"
if lsof -iTCP:8545 -sTCP:LISTEN -P -n >/dev/null 2>&1; then
  echo "Hardhat node already listening on 8545"
else
  echo "Starting Hardhat node... (logs: $HARDHAT_LOG)"
  cd "$ROOT_DIR"
  nohup npx hardhat node > "$HARDHAT_LOG" 2>&1 &
  HARDHAT_PID=$!
  echo "Hardhat PID: $HARDHAT_PID"
fi

# Deploy the contract to localhost
echo "Deploying contract to localhost..."
cd "$ROOT_DIR"
npx hardhat run scripts/deploy.js --network localhost

# Start backend (server.js) with dotenv from repo root
BACKEND_LOG="$LOG_DIR/backend.log"
if lsof -iTCP:5001 -sTCP:LISTEN -P -n >/dev/null 2>&1; then
  echo "Backend already listening on 5001"
  # Try to preserve existing backend logs if present in /tmp/backend.log
  if [ -f "/tmp/backend.log" ] && [ ! -f "$BACKEND_LOG" ]; then
    echo "Preserving existing /tmp/backend.log to $BACKEND_LOG"
    cp /tmp/backend.log "$BACKEND_LOG" || true
  fi
else
  echo "Starting backend (PORT from .env) ... (logs: $BACKEND_LOG)"
  cd "$ROOT_DIR/backend"
  DOTENV_CONFIG_PATH="$ROOT_DIR/.env" nohup node -r dotenv/config server.js > "$BACKEND_LOG" 2>&1 &
  BACKEND_PID=$!
  echo "Backend PID: $BACKEND_PID"
fi

# Start localtunnel to expose backend
TUNNEL_LOG="$LOG_DIR/localtunnel.log"
if command -v lt >/dev/null 2>&1; then
  LT_BIN="lt"
else
  LT_BIN="npx --yes localtunnel@2"
fi

# Create tunnel and capture the public URL
echo "Starting localtunnel for port 5001... (logs: $TUNNEL_LOG)"
TMP_TUNNEL_URL_FILE="$LOG_DIR/tunnel_url.txt"
rm -f "$TMP_TUNNEL_URL_FILE" "$LOG_DIR/localtunnel.pid" "$TUNNEL_LOG"

MAX_RETRIES=3
RETRY=0
while [ $RETRY -lt $MAX_RETRIES ]; do
  # start tunnel in background
  ($LT_BIN --port 5001 > "$TUNNEL_LOG" 2>&1) &
  LT_PID=$!
  echo "$LT_PID" > "$LOG_DIR/localtunnel.pid"

  # wait for URL to appear
  COUNTER=0
  while [ $COUNTER -lt 20 ]; do
    if grep -Eo "https?://[a-z0-9.-]+\.(loca\.lt|localtunnel\.me)" "$TUNNEL_LOG" >/dev/null 2>&1; then
      URL=$(grep -Eo "https?://[a-z0-9.-]+\.(loca\.lt|localtunnel\.me)" "$TUNNEL_LOG" | tail -n1)
      echo "$URL" > "$TMP_TUNNEL_URL_FILE"
      break
    fi
    sleep 1
    COUNTER=$((COUNTER + 1))
  done

  if [ -s "$TMP_TUNNEL_URL_FILE" ]; then
    echo "Tunnel URL: $(cat "$TMP_TUNNEL_URL_FILE")"
    break
  else
    echo "localtunnel attempt $((RETRY+1)) failed to produce URL. Check $TUNNEL_LOG for details."
    # kill this attempt and retry
    if ps -p $LT_PID >/dev/null 2>&1; then
      kill $LT_PID || true
    fi
    RETRY=$((RETRY + 1))
    sleep 1
  fi
done

if [ ! -s "$TMP_TUNNEL_URL_FILE" ]; then
  echo "Tunnel was not started successfully after $MAX_RETRIES attempts. See $TUNNEL_LOG for logs." 
fi

echo "Demo started. Logs are in $LOG_DIR"

echo "To stop the demo run: scripts/stop-demo.sh" 
