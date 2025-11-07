#!/bin/bash

# Deployment Script for Vercel (Frontend)
# This script deploys the React frontend to Vercel

set -e

echo "🚀 Deploying frontend to Vercel..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Navigate to client directory
cd client

# Check if .env is configured
if [ ! -f ".env.production" ]; then
    echo "⚠️  Warning: .env.production not found"
    echo "Please ensure REACT_APP_API_URL is set in Vercel environment variables"
fi

# Deploy to Vercel
echo "📤 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Your app should be live at your Vercel domain"
echo ""
echo "📝 Next steps:"
echo "1. Configure environment variables in Vercel dashboard"
echo "2. Set REACT_APP_API_URL to your backend API URL"
echo "3. Test the deployment"
