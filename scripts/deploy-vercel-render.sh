#!/bin/bash

# Complete Deployment Script for Vercel + Render
# This script will deploy frontend to Vercel via CLI
# and provide instructions for Render backend deployment

set -e

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                                                                  ║"
echo "║     🚀 DEPLOYING TO VERCEL (Frontend) + RENDER (Backend)        ║"
echo "║                                                                  ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Ensure all changes are committed
echo -e "${BLUE}Step 1: Checking Git Status${NC}"
echo "═══════════════════════════════════════════"

if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Uncommitted changes detected${NC}"
    echo "Committing changes..."
    git add .
    git commit -m "chore: prepare for production deployment" || true
fi

# Step 2: Push to GitHub
echo ""
echo -e "${BLUE}Step 2: Pushing to GitHub${NC}"
echo "═══════════════════════════════════════════"
echo "Pushing to origin/main..."
git push origin main

echo -e "${GREEN}✅ Code pushed to GitHub${NC}"
echo ""

# Step 3: Deploy Frontend to Vercel
echo -e "${BLUE}Step 3: Deploying Frontend to Vercel${NC}"
echo "═══════════════════════════════════════════"
echo ""
echo "NOTE: You'll be asked to login to Vercel if not already logged in"
echo "      Press Enter to continue..."
read -p ""

cd client

# Check if vercel.json exists
if [ ! -f "vercel.json" ]; then
    echo -e "${YELLOW}Creating vercel.json...${NC}"
    cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      },
      "dest": "/static/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
EOF
fi

# Deploy to Vercel
echo ""
echo -e "${GREEN}Deploying to Vercel...${NC}"
echo ""

# Login to Vercel
echo "Logging in to Vercel..."
vercel login

# Deploy
echo ""
echo "Deploying frontend..."
VERCEL_URL=$(vercel --prod --yes 2>&1 | grep -o 'https://[^ ]*' | tail -1)

cd ..

echo ""
echo -e "${GREEN}✅ Frontend deployed to Vercel!${NC}"
echo -e "${GREEN}   URL: ${VERCEL_URL}${NC}"
echo ""

# Save deployment info
mkdir -p .deployments
cat > .deployments/vercel-deployment.txt << EOF
Frontend Deployed: $(date)
Vercel URL: ${VERCEL_URL}
Status: Success
EOF

# Step 4: Backend Deployment Instructions (Render via Dashboard)
echo ""
echo -e "${BLUE}Step 4: Backend Deployment on Render${NC}"
echo "═══════════════════════════════════════════"
echo ""
echo -e "${YELLOW}NOTE: Render requires dashboard deployment for initial setup${NC}"
echo ""
echo "Follow these steps to deploy backend:"
echo ""
echo "1️⃣  Go to: https://render.com"
echo "2️⃣  Sign in with GitHub"
echo "3️⃣  Click 'New +' → 'Web Service'"
echo "4️⃣  Connect repository: PERIL03/BLOCKCHAIN-BASED-DOCUMENT-VERIFICATION"
echo "5️⃣  Configure:"
echo "    - Name: blockchain-doc-backend"
echo "    - Region: Oregon (or closest)"
echo "    - Branch: main"
echo "    - Root Directory: backend"
echo "    - Environment: Node"
echo "    - Build Command: npm install"
echo "    - Start Command: npm start"
echo "    - Instance Type: Free"
echo ""
echo "6️⃣  Add Environment Variables (click 'Advanced'):"
echo ""

# Create environment variables template
cat > .deployments/render-env-vars.txt << EOF
# Copy these environment variables to Render dashboard:

NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Database (UPDATE with your NEW MongoDB credentials!)
MONGODB_URI=<YOUR_NEW_MONGODB_URI>

# Blockchain (UPDATE with your NEW Infura key!)
BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/<YOUR_NEW_INFURA_KEY>
BLOCKCHAIN_NETWORK=sepolia
PRIVATE_KEY=<YOUR_NEW_PRIVATE_KEY>

# CORS (UPDATE with your Vercel URL)
CLIENT_URL=${VERCEL_URL}

# File upload
MAX_FILE_SIZE=10485760
RATE_LIMIT_MAX=100

# Secrets (Render can auto-generate these)
SESSION_SECRET=<auto-generate>
JWT_SECRET=<auto-generate>
EOF

echo ""
echo -e "${YELLOW}Environment variables template saved to:${NC}"
echo -e "${YELLOW}.deployments/render-env-vars.txt${NC}"
echo ""
cat .deployments/render-env-vars.txt
echo ""

# Step 5: Update Frontend with Backend URL
echo ""
echo -e "${BLUE}Step 5: After Backend is Deployed${NC}"
echo "═══════════════════════════════════════════"
echo ""
echo "Once your backend is deployed on Render, you'll get a URL like:"
echo "https://blockchain-doc-backend-xxxx.onrender.com"
echo ""
echo "You need to:"
echo ""
echo "1️⃣  Update client environment variable:"
echo "    cd client"
echo "    echo 'REACT_APP_API_URL=https://your-backend-url.onrender.com' > .env.production"
echo ""
echo "2️⃣  Redeploy frontend to Vercel:"
echo "    vercel --prod"
echo ""
echo "3️⃣  Update CLIENT_URL in Render backend environment variables"
echo ""

# Final Summary
echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                                                                  ║"
echo "║                   🎉 DEPLOYMENT SUMMARY                          ║"
echo "║                                                                  ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✅ Frontend deployed to Vercel${NC}"
echo -e "   URL: ${VERCEL_URL}"
echo ""
echo -e "${YELLOW}⏳ Backend pending Render dashboard setup${NC}"
echo -e "   Follow instructions above"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Deploy backend on Render dashboard (see instructions above)"
echo "2. Update REACT_APP_API_URL in client/.env.production"
echo "3. Redeploy frontend: cd client && vercel --prod"
echo "4. Update CLIENT_URL in Render backend settings"
echo "5. Test your application!"
echo ""
echo -e "${RED}⚠️  CRITICAL SECURITY:${NC}"
echo "   Remember to change MongoDB credentials and Infura API key!"
echo "   See SECURITY_ALERT.md for details"
echo ""
echo "Deployment info saved in .deployments/"
echo ""
echo -e "${GREEN}🚀 Deployment process initiated!${NC}"
echo ""
