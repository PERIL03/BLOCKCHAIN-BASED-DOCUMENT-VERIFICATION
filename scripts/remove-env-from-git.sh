#!/bin/bash

# Script to remove .env from git if it was accidentally committed
# Run this IMMEDIATELY if .env is in your repository

echo "🚨 SECURITY FIX: Removing .env from Git Repository"
echo ""

# Check if .env is tracked by git
if git ls-files --error-unmatch .env > /dev/null 2>&1; then
    echo "⚠️  WARNING: .env file is tracked by git!"
    echo "   This is a CRITICAL SECURITY ISSUE"
    echo ""
    
    read -p "Do you want to remove it from git? (y/n) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Removing .env from git..."
        git rm --cached .env
        echo "✅ .env removed from git index"
        echo ""
        echo "Next steps:"
        echo "1. Commit this change: git commit -m 'Remove .env from repository'"
        echo "2. Push to remote: git push"
        echo "3. IMMEDIATELY change all secrets in .env (MongoDB password, private keys, etc.)"
        echo "4. Create new .env file locally (not tracked by git)"
    else
        echo "❌ Cancelled. Please remove .env manually and update all secrets!"
    fi
else
    echo "✅ .env is not tracked by git. Good!"
fi

# Check if .env.production is tracked
if git ls-files --error-unmatch .env.production > /dev/null 2>&1; then
    echo ""
    echo "⚠️  WARNING: .env.production file is tracked by git!"
    git rm --cached .env.production
    echo "✅ .env.production removed from git index"
fi

# Check if .env.docker is tracked
if git ls-files --error-unmatch .env.docker > /dev/null 2>&1; then
    echo ""
    echo "⚠️  WARNING: .env.docker file is tracked by git!"
    git rm --cached .env.docker
    echo "✅ .env.docker removed from git index"
fi

echo ""
echo "═══════════════════════════════════════════"
echo "🔒 Security Check Complete"
echo "═══════════════════════════════════════════"
