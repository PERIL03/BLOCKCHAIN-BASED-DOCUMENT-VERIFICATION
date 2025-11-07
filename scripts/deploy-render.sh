#!/bin/bash

# Deployment Script for Render (Backend)
# This script helps prepare and deploy the backend to Render

set -e

echo "🚀 Deploying backend to Render..."

# Check if render.yaml exists
if [ ! -f "backend/render.yaml" ]; then
    echo "❌ Error: backend/render.yaml not found"
    exit 1
fi

echo "✅ render.yaml found"
echo ""
echo "📝 Deployment Instructions:"
echo "1. Go to https://render.com and sign in"
echo "2. Click 'New +' and select 'Blueprint'"
echo "3. Connect your GitHub repository"
echo "4. Select the backend/render.yaml file"
echo "5. Configure the following environment variables:"
echo "   - MONGODB_URI (your MongoDB connection string)"
echo "   - BLOCKCHAIN_RPC_URL (Infura/Alchemy endpoint)"
echo "   - PRIVATE_KEY (your wallet private key)"
echo "   - CLIENT_URL (your frontend URL)"
echo "6. Click 'Apply' to deploy"
echo ""
echo "🔐 Security Note:"
echo "Make sure to use environment variables for all secrets!"
echo ""
echo "✅ Backend will be deployed at: https://your-service-name.onrender.com"
