#!/bin/bash

# Quick Start Script for Production Deployment
# This script guides you through the deployment process step-by-step

set -e

echo "🚀 Blockchain Document Verification - Production Deployment"
echo "=========================================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running from correct directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Run this script from the project root directory${NC}"
    exit 1
fi

echo -e "${RED}⚠️  CRITICAL SECURITY CHECK${NC}"
echo "=============================="
echo ""

# Check for .env in git
if git ls-files --error-unmatch .env > /dev/null 2>&1; then
    echo -e "${RED}🚨 CRITICAL: .env file is in git!${NC}"
    echo "Run: npm run security:fix"
    echo "Then read SECURITY_ALERT.md immediately!"
    exit 1
fi

# Check for exposed credentials
if [ -f ".env" ]; then
    if grep -q "PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" .env; then
        echo -e "${YELLOW}⚠️  Warning: Using Hardhat default private key${NC}"
        echo "You MUST generate a new private key for production!"
        echo ""
    fi
fi

echo -e "${BLUE}📋 Pre-Deployment Checklist${NC}"
echo "=============================="
echo ""

# Function to ask yes/no questions
ask_confirmation() {
    while true; do
        read -p "$1 (y/n): " yn
        case $yn in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Please answer yes or no.";;
        esac
    done
}

# Checklist
echo "Have you completed all steps in SECURITY_ALERT.md?"
if ! ask_confirmation ""; then
    echo -e "${RED}❌ Please read and complete SECURITY_ALERT.md first!${NC}"
    exit 1
fi

echo ""
echo "Have you created a MongoDB Atlas database?"
if ! ask_confirmation ""; then
    echo -e "${YELLOW}⚠️  Create one at: https://cloud.mongodb.com${NC}"
    exit 1
fi

echo ""
echo "Have you set up Infura or Alchemy RPC provider?"
if ! ask_confirmation ""; then
    echo -e "${YELLOW}⚠️  Create account at: https://infura.io or https://alchemy.com${NC}"
    exit 1
fi

echo ""
echo "Have you generated a NEW Ethereum wallet (not Hardhat default)?"
if ! ask_confirmation ""; then
    echo -e "${YELLOW}⚠️  Generate with: npm run generate:secrets${NC}"
    exit 1
fi

echo ""
echo "Have you funded your wallet with testnet ETH?"
if ! ask_confirmation ""; then
    echo -e "${YELLOW}⚠️  Get testnet ETH from: https://sepoliafaucet.com${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Pre-checks passed!${NC}"
echo ""

# Deployment options
echo -e "${BLUE}🎯 Choose Deployment Option${NC}"
echo "=============================="
echo "1. Deploy to Sepolia Testnet (Recommended first)"
echo "2. Deploy to Mainnet (Production)"
echo "3. Exit"
echo ""

read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        echo ""
        echo -e "${GREEN}Deploying to Sepolia Testnet...${NC}"
        echo ""
        
        # Check environment variables
        if [ ! -f ".env" ]; then
            echo -e "${RED}❌ .env file not found${NC}"
            echo "Create .env file with your configuration"
            exit 1
        fi
        
        # Check for required variables
        if ! grep -q "SEPOLIA_RPC_URL=" .env; then
            echo -e "${RED}❌ SEPOLIA_RPC_URL not set in .env${NC}"
            exit 1
        fi
        
        if ! grep -q "PRIVATE_KEY=" .env; then
            echo -e "${RED}❌ PRIVATE_KEY not set in .env${NC}"
            exit 1
        fi
        
        echo "Installing dependencies..."
        npm install
        
        echo ""
        echo "Compiling contracts..."
        npm run compile
        
        echo ""
        echo "Deploying contract to Sepolia..."
        npm run deploy:sepolia
        
        echo ""
        echo -e "${GREEN}✅ Contract deployed!${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Verify contract on Etherscan (optional)"
        echo "2. Update frontend/backend environment variables"
        echo "3. Deploy backend to Render/Railway"
        echo "4. Deploy frontend to Vercel"
        echo ""
        echo "See DEPLOYMENT_CHECKLIST.md for detailed instructions"
        ;;
        
    2)
        echo ""
        echo -e "${YELLOW}⚠️  WARNING: Mainnet Deployment${NC}"
        echo "=============================="
        echo ""
        echo "Deploying to mainnet requires:"
        echo "- Real ETH for gas fees (expensive!)"
        echo "- Thorough testing on testnet first"
        echo "- Security audit of smart contracts"
        echo "- Production-ready infrastructure"
        echo ""
        
        if ! ask_confirmation "Are you ABSOLUTELY SURE you want to deploy to mainnet?"; then
            echo "Deployment cancelled."
            exit 0
        fi
        
        echo ""
        echo -e "${RED}This feature is not automated for safety reasons.${NC}"
        echo "Please deploy to mainnet manually:"
        echo ""
        echo "1. Update hardhat.config.js with mainnet network"
        echo "2. Ensure you have enough ETH for gas"
        echo "3. Run: npx hardhat run scripts/deploy.js --network mainnet"
        echo "4. Verify contract on Etherscan"
        echo "5. Update all production configs"
        echo ""
        ;;
        
    3)
        echo "Exiting..."
        exit 0
        ;;
        
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo "═══════════════════════════════════════════"
echo -e "${GREEN}🎉 Deployment process completed!${NC}"
echo "═══════════════════════════════════════════"
echo ""
echo "📚 Additional Resources:"
echo "- Full deployment guide: DEPLOYMENT_CHECKLIST.md"
echo "- Security guidelines: SECURITY_ALERT.md"
echo "- API documentation: API_DOCUMENTATION.md"
echo "- Production README: README_PRODUCTION.md"
echo ""
