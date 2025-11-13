# Local Development Setup

This project runs completely locally with no external tunnels or cloud dependencies (except MongoDB Atlas).

## Quick Start

```bash
# Make scripts executable (one time)
chmod +x scripts/start-local.sh scripts/stop-local.sh

# Start everything
./scripts/start-local.sh

# Stop everything
./scripts/stop-local.sh
```

## What runs locally:

1. **Hardhat Node** (localhost:8545) - Local blockchain with pre-funded accounts
2. **Backend API** (localhost:5001) - Express server with MongoDB and blockchain integration
3. **Frontend** (localhost:3000) - React app for document upload/verification

## Environment

- Uses `.env` in repo root
- Frontend calls `http://localhost:5001` (no tunnel needed)
- Backend connects to your MongoDB Atlas instance
- Smart contract deployed to local Hardhat network

## Usage

1. Open http://localhost:3000 in your browser
2. Upload a document to register it on the local blockchain
3. Verify documents using file hash or re-uploading

## Logs

- Hardhat: `tail -f /tmp/hardhat-local.log`
- Backend: `tail -f /tmp/backend-local.log`
- Frontend: `tail -f /tmp/frontend-local.log`

## Dependencies

- Node.js >= 18
- npm packages (will be installed automatically)
- MongoDB Atlas connection (configured in `.env`)