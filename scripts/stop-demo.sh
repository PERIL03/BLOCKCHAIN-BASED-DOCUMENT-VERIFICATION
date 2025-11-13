#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="/tmp/final_fullstack_demo_logs"

echo "Stopping demo processes..."
# Kill localtunnel (read PID file if present)
if [ -f "$LOG_DIR/localtunnel.pid" ]; then
  LT_PID=$(cat "$LOG_DIR/localtunnel.pid" 2>/dev/null || true)
  if [ -n "$LT_PID" ] && ps -p $LT_PID >/dev/null 2>&1; then
    echo "Killing localtunnel pid $LT_PID"
    kill $LT_PID || true
  fi
  rm -f "$LOG_DIR/localtunnel.pid" || true
fi

# Kill backend processes started from project
for pid in $(ps aux | grep "node -r dotenv/config server.js" | grep -v grep | awk '{print $2}'); do
  echo "Killing backend pid $pid"
  kill $pid || true
done
for pid in $(ps aux | grep "node server.js" | grep -v grep | awk '{print $2}'); do
  echo "Killing backend pid $pid"
  kill $pid || true
done

# Kill hardhat node processes
for pid in $(ps aux | grep "npx hardhat node" | grep -v grep | awk '{print $2}'); do
  echo "Killing hardhat pid $pid"
  kill $pid || true
done
for pid in $(ps aux | grep "hardhat node" | grep -v grep | awk '{print $2}'); do
  echo "Killing hardhat pid $pid"
  kill $pid || true
done

rm -f "$LOG_DIR/tunnel_url.txt" || true
echo "Stopped. Logs preserved in $LOG_DIR"
