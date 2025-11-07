#!/bin/bash

# Comprehensive deployment preparation script
# This script ensures everything is ready for deployment

set -e

echo "🚀 Preparing project for deployment..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env is in git
if git ls-files --error-unmatch .env > /dev/null 2>&1; then
    echo -e "${RED}❌ CRITICAL: .env is tracked by git!${NC}"
    echo "   Run: npm run security:fix"
    exit 1
fi

# Create production env template if it doesn't exist
if [ ! -f ".env.production.example" ]; then
    echo -e "${YELLOW}⚠️  Creating .env.production.example${NC}"
    cp .env.example .env.production.example
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd backend && npm install && cd ..
cd client && npm install && cd ..
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Compile contracts
echo "🔨 Compiling smart contracts..."
npm run compile
echo -e "${GREEN}✅ Contracts compiled${NC}"
echo ""

# Run tests
echo "🧪 Running tests..."
npm test
echo -e "${GREEN}✅ Tests passed${NC}"
echo ""

# Build frontend
echo "🏗️  Building frontend..."
cd client && npm run build && cd ..
echo -e "${GREEN}✅ Frontend built${NC}"
echo ""

# Check for security issues
echo "🔒 Security checks..."
if grep -r "console.log" backend/routes backend/models backend/utils > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Warning: Found console.log in production code${NC}"
fi

if [ -f ".env" ]; then
    if grep -q "PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" .env; then
        echo -e "${YELLOW}⚠️  Warning: Using default Hardhat private key${NC}"
        echo "   Generate new key before deploying to production!"
    fi
fi
echo ""

# Final checklist
echo "═══════════════════════════════════════════"
echo "📋 DEPLOYMENT READINESS CHECKLIST"
echo "═══════════════════════════════════════════"
echo ""
echo "Before deploying, ensure you have:"
echo "  [ ] Created MongoDB Atlas database"
echo "  [ ] Generated new Ethereum wallet (not Hardhat default)"
echo "  [ ] Set up Infura/Alchemy RPC provider"
echo "  [ ] Deployed smart contract to testnet/mainnet"
echo "  [ ] Updated backend/config/contract.json with deployed address"
echo "  [ ] Set all environment variables in hosting platform"
echo "  [ ] Generated new SESSION_SECRET and JWT_SECRET"
echo "  [ ] Configured CORS with actual frontend URL"
echo "  [ ] Removed .env from git (if committed)"
echo ""
echo "═══════════════════════════════════════════"
echo -e "${GREEN}✅ Project is ready for deployment!${NC}"
echo "═══════════════════════════════════════════"
echo ""
echo "Next steps:"
echo "1. Read DEPLOYMENT_CHECKLIST.md"
echo "2. Set up production environment variables"
echo "3. Deploy smart contract: npm run deploy:sepolia"
echo "4. Deploy backend to Render/Railway"
echo "5. Deploy frontend to Vercel"
echo ""
