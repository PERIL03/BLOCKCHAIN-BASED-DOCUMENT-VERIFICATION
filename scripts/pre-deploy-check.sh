#!/bin/bash

# Pre-Deployment Checklist Script
# Verifies that the application is ready for deployment

set -e

echo "🔍 Running Pre-Deployment Checklist..."
echo ""

ERRORS=0
WARNINGS=0

# Check Node.js version
echo "1️⃣ Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "   ❌ Node.js version must be 18 or higher (current: $(node -v))"
    ERRORS=$((ERRORS+1))
else
    echo "   ✅ Node.js version: $(node -v)"
fi

# Check if dependencies are installed
echo ""
echo "2️⃣ Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "   ⚠️  Root dependencies not installed"
    WARNINGS=$((WARNINGS+1))
else
    echo "   ✅ Root dependencies installed"
fi

if [ ! -d "backend/node_modules" ]; then
    echo "   ⚠️  Backend dependencies not installed"
    WARNINGS=$((WARNINGS+1))
else
    echo "   ✅ Backend dependencies installed"
fi

if [ ! -d "client/node_modules" ]; then
    echo "   ⚠️  Client dependencies not installed"
    WARNINGS=$((WARNINGS+1))
else
    echo "   ✅ Client dependencies installed"
fi

# Check environment files
echo ""
echo "3️⃣ Checking environment configuration..."
if [ ! -f ".env" ]; then
    echo "   ❌ .env file not found"
    ERRORS=$((ERRORS+1))
else
    echo "   ✅ .env file exists"
    
    # Check critical environment variables
    if grep -q "PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" .env; then
        echo "   ⚠️  Using default Hardhat private key (change for production!)"
        WARNINGS=$((WARNINGS+1))
    fi
    
    if grep -q "MONGODB_URI=" .env; then
        echo "   ✅ MongoDB URI configured"
    else
        echo "   ❌ MongoDB URI not configured"
        ERRORS=$((ERRORS+1))
    fi
fi

# Check smart contracts
echo ""
echo "4️⃣ Checking smart contracts..."
if [ ! -d "artifacts/contracts/DocumentRegistry.sol" ]; then
    echo "   ⚠️  Smart contracts not compiled"
    echo "   Run: npm run compile"
    WARNINGS=$((WARNINGS+1))
else
    echo "   ✅ Smart contracts compiled"
fi

if [ ! -f "deployments/latest.json" ]; then
    echo "   ⚠️  Smart contract not deployed"
    echo "   Run: npm run deploy (for localhost) or npm run deploy:sepolia (for testnet)"
    WARNINGS=$((WARNINGS+1))
else
    echo "   ✅ Smart contract deployed"
fi

# Check backend configuration
echo ""
echo "5️⃣ Checking backend configuration..."
if [ ! -f "backend/config/contract.json" ]; then
    echo "   ⚠️  Contract config not found in backend"
    WARNINGS=$((WARNINGS+1))
else
    echo "   ✅ Backend contract config exists"
fi

# Run tests
echo ""
echo "6️⃣ Running tests..."
echo "   Running smart contract tests..."
npm test > /dev/null 2>&1 && echo "   ✅ Smart contract tests passed" || {
    echo "   ❌ Smart contract tests failed"
    ERRORS=$((ERRORS+1))
}

# Check for production-specific files
echo ""
echo "7️⃣ Checking deployment configurations..."
[ -f "docker-compose.prod.yml" ] && echo "   ✅ Production docker-compose found" || echo "   ⚠️  docker-compose.prod.yml not found"
[ -f "client/vercel.json" ] && echo "   ✅ Vercel config found" || echo "   ⚠️  client/vercel.json not found"
[ -f "backend/render.yaml" ] && echo "   ✅ Render config found" || echo "   ⚠️  backend/render.yaml not found"
[ -f ".env.production" ] && echo "   ✅ Production env template found" || echo "   ⚠️  .env.production template not found"

# Security checks
echo ""
echo "8️⃣ Security checks..."
if grep -r "console.log" backend/*.js > /dev/null 2>&1; then
    echo "   ⚠️  Found console.log statements in backend code"
    WARNINGS=$((WARNINGS+1))
else
    echo "   ✅ No console.log in backend production code"
fi

# Check .gitignore
if [ -f ".gitignore" ]; then
    if grep -q ".env" .gitignore && grep -q "node_modules" .gitignore; then
        echo "   ✅ .gitignore properly configured"
    else
        echo "   ⚠️  .gitignore may be missing important entries"
        WARNINGS=$((WARNINGS+1))
    fi
else
    echo "   ❌ .gitignore not found"
    ERRORS=$((ERRORS+1))
fi

# Summary
echo ""
echo "═══════════════════════════════════════════"
echo "📊 SUMMARY"
echo "═══════════════════════════════════════════"
echo "❌ Errors:   $ERRORS"
echo "⚠️  Warnings: $WARNINGS"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ All checks passed! Ready for deployment."
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  Deployment possible but with warnings."
    echo "Please review warnings before deploying to production."
    exit 0
else
    echo "❌ Please fix errors before deploying."
    exit 1
fi
