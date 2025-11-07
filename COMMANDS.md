# 🚀 Quick Command Reference

## 📋 Pre-Deployment Commands

```bash
# Security check - DO THIS FIRST!
npm run security:fix

# Generate secure secrets
npm run generate:secrets

# Install all dependencies
npm run install:all

# Prepare for deployment (runs all checks)
npm run prepare:deploy

# Build everything
npm run build:all
```

## 🔨 Development Commands

```bash
# Install dependencies
npm install                  # Root
npm run install:backend      # Backend only
npm run install:client       # Client only
npm run install:all          # All at once

# Compile smart contracts
npm run compile

# Run tests
npm test                     # Smart contracts
npm run test:backend         # Backend API
npm run test:client          # Frontend
npm run test:all            # Everything

# Development servers
npm run node                # Start local blockchain
npm run deploy              # Deploy to local blockchain
npm run backend:dev         # Start backend (dev mode)
npm run client              # Start frontend
npm run dev                 # Start all services

# Build
npm run client:build        # Build frontend
npm run build:all          # Build everything
```

## 🌐 Deployment Commands

```bash
# Deploy smart contract
npm run deploy              # Local network
npm run deploy:sepolia      # Sepolia testnet
npm run verify              # Verify on Etherscan

# Docker deployment
npm run docker:build        # Build dev images
npm run docker:up           # Start dev containers
npm run docker:down         # Stop dev containers
npm run docker:logs         # View logs

npm run docker:prod:build   # Build prod images
npm run docker:prod         # Start prod containers
npm run docker:prod:down    # Stop prod containers

# Platform deployment
npm run deploy:vercel       # Deploy frontend to Vercel
npm run deploy:render       # Deploy backend to Render
npm run deploy:docker       # Deploy with Docker

# Pre-deployment checks
npm run pre-deploy          # Run pre-deployment checks
npm run deployment:checklist # Run deployment checklist
```

## 🧹 Utility Commands

```bash
# Clean up
npm run clean               # Remove all node_modules and build files

# Code quality
npm run lint                # Run ESLint
npm run format              # Format with Prettier

# Database
npm run seed                # Seed database with test data

# Scripts
npm run setup               # Initial setup
```

## 🔐 Security Commands

```bash
# Remove .env from git (CRITICAL if committed)
npm run security:fix

# Generate secure random secrets
npm run generate:secrets
```

## 📦 Quick Start Sequences

### Local Development
```bash
# 1. Clone and install
git clone <repo>
cd FINAL_FULLSTACK
npm run install:all

# 2. Start blockchain
npm run node                # Terminal 1

# 3. Deploy contract
npm run deploy              # Terminal 2

# 4. Start backend
npm run backend:dev         # Terminal 3

# 5. Start frontend
npm run client              # Terminal 4
```

### Production Deployment
```bash
# 1. Security check
npm run security:fix

# 2. Prepare
npm run prepare:deploy

# 3. Generate secrets
npm run generate:secrets

# 4. Deploy contract to testnet
npm run deploy:sepolia

# 5. Use interactive wizard
./deploy.sh
```

## 🐳 Docker Quick Start

### Development
```bash
docker-compose up -d
docker-compose logs -f
```

### Production
```bash
# Edit .env.production first!
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml logs -f
```

## 🔍 Debugging Commands

```bash
# Check if .env is in git
git ls-files | grep "\.env"

# View Docker logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb

# Test MongoDB connection
mongosh "YOUR_MONGODB_URI"

# Check smart contract deployment
cat deployments/latest.json

# Test backend health
curl http://localhost:5000/health

# Test API endpoint
curl http://localhost:5000/api
```

## 📊 Monitoring Commands

```bash
# View application logs
npm run docker:logs

# Check container status
docker ps

# View MongoDB logs
docker logs blockchain-doc-mongodb

# Check network connectivity
docker network inspect blockchain-network
```

## 🆘 Emergency Commands

```bash
# Stop everything
docker-compose down
pkill -f "hardhat node"
pkill -f "node"

# Reset blockchain
rm -rf artifacts cache deployments/*.json

# Clean and reinstall
npm run clean
npm run install:all

# Remove .env from git (if accidentally committed)
npm run security:fix
```

## 📱 Vercel CLI (Frontend)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to preview
cd client
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs
```

## 🚂 Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up

# View logs
railway logs

# Open dashboard
railway open
```

## 🎨 Render Deployment

```bash
# Render uses git push deployment
# Just push to GitHub and connect via Render dashboard

# Check deployment status at:
# https://dashboard.render.com
```

## ⚙️ Environment Variables

### Local Development
```bash
# Create .env from example
cp .env.example .env

# Edit .env
nano .env
# or
code .env
```

### Production
```bash
# Create production env from template
cp .env.production.example .env.production

# Edit with production values
nano .env.production
```

## 🧪 Testing Commands

```bash
# Smart contract tests
npm test
npm test -- --grep "DocumentRegistry"

# Backend API tests
cd backend
npm test
npm run test:watch

# Frontend tests
cd client
npm test
npm test -- --coverage

# Test with Docker
docker-compose -f docker-compose.yml exec backend npm test
```

## 🔄 Git Commands

```bash
# Remove .env from git (CRITICAL)
git rm --cached .env
git commit -m "Remove .env from repository"
git push

# Remove .env from history (advanced)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Check git status
git status
git ls-files | grep "\.env"
```

## 📖 Documentation Commands

```bash
# View key documentation
cat SECURITY_ALERT.md
cat DEPLOYMENT_CHECKLIST.md
cat README_PRODUCTION.md

# View in browser (macOS)
open SECURITY_ALERT.md

# View in browser (Linux)
xdg-open SECURITY_ALERT.md
```

---

## 🎯 Most Important Commands

```bash
# 1. SECURITY CHECK (DO FIRST!)
npm run security:fix

# 2. READ CRITICAL DOCS
cat SECURITY_ALERT.md

# 3. PREPARE FOR DEPLOYMENT
npm run prepare:deploy

# 4. DEPLOY INTERACTIVELY
./deploy.sh
```

---

*Quick reference for all project commands*
*For detailed guides, see DEPLOYMENT_CHECKLIST.md*
