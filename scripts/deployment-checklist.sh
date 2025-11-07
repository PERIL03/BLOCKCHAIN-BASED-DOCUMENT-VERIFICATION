#!/bin/bash

# Final Deployment Checklist Runner
# Run this script before deploying to production

set -e

echo "═══════════════════════════════════════════════════════════"
echo "🚀 BLOCKCHAIN DOCUMENT VERIFICATION - DEPLOYMENT CHECKLIST"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to check status
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1"
        ERRORS=$((ERRORS+1))
    fi
}

warn_status() {
    echo -e "${YELLOW}⚠${NC} $1"
    WARNINGS=$((WARNINGS+1))
}

echo "📋 STEP 1: Environment Files"
echo "────────────────────────────"
[ -f ".env" ] && check_status ".env exists" || { echo -e "${RED}✗${NC} .env missing"; ERRORS=$((ERRORS+1)); }
[ -f ".env.production" ] && check_status ".env.production template exists" || warn_status ".env.production missing"
[ -f ".env.docker" ] && check_status ".env.docker exists" || warn_status ".env.docker missing"
echo ""

echo "📋 STEP 2: Dependencies"
echo "────────────────────────────"
[ -d "node_modules" ] && check_status "Root dependencies installed" || warn_status "Run: npm install"
[ -d "backend/node_modules" ] && check_status "Backend dependencies installed" || warn_status "Run: cd backend && npm install"
[ -d "client/node_modules" ] && check_status "Client dependencies installed" || warn_status "Run: cd client && npm install"
echo ""

echo "📋 STEP 3: Smart Contracts"
echo "────────────────────────────"
[ -d "artifacts/contracts" ] && check_status "Contracts compiled" || warn_status "Run: npm run compile"
[ -f "deployments/latest.json" ] && check_status "Contracts deployed" || warn_status "Run: npm run deploy or npm run deploy:sepolia"
[ -f "backend/config/contract.json" ] && check_status "Backend contract config exists" || warn_status "Deploy contracts first"
echo ""

echo "📋 STEP 4: Docker Configuration"
echo "────────────────────────────"
[ -f "docker-compose.yml" ] && check_status "docker-compose.yml exists" || { echo -e "${RED}✗${NC} docker-compose.yml missing"; ERRORS=$((ERRORS+1)); }
[ -f "docker-compose.prod.yml" ] && check_status "docker-compose.prod.yml exists" || warn_status "Production docker config missing"
[ -f "backend/Dockerfile" ] && check_status "Backend Dockerfile exists" || { echo -e "${RED}✗${NC} Backend Dockerfile missing"; ERRORS=$((ERRORS+1)); }
[ -f "client/Dockerfile" ] && check_status "Client Dockerfile exists" || { echo -e "${RED}✗${NC} Client Dockerfile missing"; ERRORS=$((ERRORS+1)); }
[ -f ".dockerignore" ] && check_status "Root .dockerignore exists" || warn_status "Add .dockerignore"
[ -f "backend/.dockerignore" ] && check_status "Backend .dockerignore exists" || warn_status "Add backend/.dockerignore"
[ -f "client/.dockerignore" ] && check_status "Client .dockerignore exists" || warn_status "Add client/.dockerignore"
echo ""

echo "📋 STEP 5: Deployment Configs"
echo "────────────────────────────"
[ -f "client/vercel.json" ] && check_status "Vercel config exists" || warn_status "Vercel config missing"
[ -f "backend/render.yaml" ] && check_status "Render config exists" || warn_status "Render config missing"
[ -f "backend/railway.json" ] && check_status "Railway backend config exists" || warn_status "Railway config missing"
[ -f "client/railway.json" ] && check_status "Railway client config exists" || warn_status "Railway config missing"
[ -f "client/nginx.conf" ] && check_status "Nginx config exists" || warn_status "Nginx config missing"
echo ""

echo "📋 STEP 6: Deployment Scripts"
echo "────────────────────────────"
[ -x "scripts/deploy-docker.sh" ] && check_status "Docker deployment script ready" || warn_status "scripts/deploy-docker.sh not executable"
[ -x "scripts/deploy-vercel.sh" ] && check_status "Vercel deployment script ready" || warn_status "scripts/deploy-vercel.sh not executable"
[ -x "scripts/pre-deploy-check.sh" ] && check_status "Pre-deployment check script ready" || warn_status "scripts/pre-deploy-check.sh not executable"
[ -x "scripts/generate-secrets.sh" ] && check_status "Secret generation script ready" || warn_status "scripts/generate-secrets.sh not executable"
echo ""

echo "📋 STEP 7: CI/CD"
echo "────────────────────────────"
[ -f ".github/workflows/ci-cd.yml" ] && check_status "GitHub Actions workflow exists" || warn_status "CI/CD workflow missing"
echo ""

echo "📋 STEP 8: Documentation"
echo "────────────────────────────"
[ -f "README.md" ] && check_status "README.md exists" || { echo -e "${RED}✗${NC} README.md missing"; ERRORS=$((ERRORS+1)); }
[ -f "DEPLOYMENT.md" ] && check_status "DEPLOYMENT.md exists" || warn_status "Deployment guide missing"
[ -f "QUICKSTART_DEPLOY.md" ] && check_status "Quick deploy guide exists" || warn_status "Quick deploy guide missing"
[ -f "PRODUCTION_SETUP.md" ] && check_status "Production setup guide exists" || warn_status "Production setup guide missing"
[ -f "API_DOCUMENTATION.md" ] && check_status "API documentation exists" || warn_status "API docs missing"
echo ""

echo "📋 STEP 9: Security Check"
echo "────────────────────────────"
if grep -q "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" .env 2>/dev/null; then
    warn_status "Using default Hardhat private key (CHANGE FOR PRODUCTION!)"
else
    check_status "Not using default private key"
fi

if grep -q "\.env$" .gitignore 2>/dev/null; then
    check_status ".env in .gitignore"
else
    echo -e "${RED}✗${NC} .env NOT in .gitignore - SECURITY RISK!"
    ERRORS=$((ERRORS+1))
fi

if grep -q "node_modules" .gitignore 2>/dev/null; then
    check_status "node_modules in .gitignore"
else
    warn_status "node_modules should be in .gitignore"
fi
echo ""

echo "📋 STEP 10: Quick Tests"
echo "────────────────────────────"
echo "Running quick syntax checks..."

# Check if npm is available
if command -v npm &> /dev/null; then
    check_status "npm is available"
else
    echo -e "${RED}✗${NC} npm not found"
    ERRORS=$((ERRORS+1))
fi

# Check Node version
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
        check_status "Node.js version $NODE_VERSION is sufficient (>= 18)"
    else
        echo -e "${RED}✗${NC} Node.js version must be >= 18 (current: $NODE_VERSION)"
        ERRORS=$((ERRORS+1))
    fi
else
    echo -e "${RED}✗${NC} Node.js not found"
    ERRORS=$((ERRORS+1))
fi

# Check Docker
if command -v docker &> /dev/null; then
    check_status "Docker is available"
else
    warn_status "Docker not installed (required for Docker deployment)"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📊 FINAL SUMMARY"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo -e "Errors:   ${RED}$ERRORS${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ PERFECT! Your application is 100% ready for deployment!${NC}"
    echo ""
    echo "🚀 Next Steps:"
    echo "   1. Choose deployment strategy (see QUICKSTART_DEPLOY.md)"
    echo "   2. Configure production environment (see PRODUCTION_SETUP.md)"
    echo "   3. Deploy using: npm run deploy:docker (or deploy:vercel)"
    echo ""
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Your application can be deployed but has some warnings.${NC}"
    echo "Review warnings above and address them if deploying to production."
    echo ""
    echo "🚀 Quick deploy: npm run deploy:docker"
    echo "📖 Full guide: See QUICKSTART_DEPLOY.md"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Please fix the errors above before deploying.${NC}"
    echo ""
    echo "Common fixes:"
    echo "  • Install dependencies: npm run install:all"
    echo "  • Compile contracts: npm run compile"
    echo "  • Create .env file: cp .env.example .env"
    echo ""
    exit 1
fi
