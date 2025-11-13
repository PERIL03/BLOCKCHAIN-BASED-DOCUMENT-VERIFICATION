#!/usr/bin/env bash
set -euo pipefail

echo "🛑 Stopping local demo..."

# Kill frontend (React dev server)
for pid in $(ps aux | grep "react-scripts start" | grep -v grep | awk '{print $2}' 2>/dev/null || true); do
  echo "Stopping frontend (PID: $pid)"
  kill $pid 2>/dev/null || true
done

# Kill backend (nodemon/node server.js)
for pid in $(ps aux | grep "nodemon server.js\|node server.js" | grep -v grep | awk '{print $2}' 2>/dev/null || true); do
  echo "Stopping backend (PID: $pid)"
  kill $pid 2>/dev/null || true
done

# Kill hardhat node
for pid in $(ps aux | grep "hardhat node" | grep -v grep | awk '{print $2}' 2>/dev/null || true); do
  echo "Stopping Hardhat node (PID: $pid)"
  kill $pid 2>/dev/null || true
done

echo "✅ Local demo stopped"
echo "📊 Logs preserved in /tmp/*-local.log"