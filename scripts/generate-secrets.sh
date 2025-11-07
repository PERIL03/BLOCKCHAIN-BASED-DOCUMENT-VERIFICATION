#!/bin/bash

# Generate production secrets
# This script generates secure random values for production environment variables

set -e

echo "🔐 Generating Production Secrets..."
echo ""

# Generate SESSION_SECRET
SESSION_SECRET=$(openssl rand -base64 32)
echo "SESSION_SECRET=$SESSION_SECRET"
echo ""

# Generate JWT_SECRET
JWT_SECRET=$(openssl rand -base64 32)
echo "JWT_SECRET=$JWT_SECRET"
echo ""

# Generate a new private key (WARNING: Fund this wallet before use!)
PRIVATE_KEY=$(openssl rand -hex 32)
echo "PRIVATE_KEY=0x$PRIVATE_KEY"
echo ""

echo "⚠️  IMPORTANT SECURITY NOTES:"
echo "1. Save these values securely (password manager recommended)"
echo "2. NEVER commit these to version control"
echo "3. Fund the generated wallet address before deploying"
echo "4. These are cryptographically random and should be used in production"
echo ""
echo "📝 Add these to your .env.production file"
echo "🔒 Store the private key securely - it controls your deployment wallet!"
