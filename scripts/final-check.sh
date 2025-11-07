#!/bin/bash

# Final Pre-Deployment Verification Script
# Run this before deploying to production

echo "🔍 Final Deployment Verification"
echo "=================================="
echo ""

ERRORS=0
WARNINGS=0

# Check if .env is in git
if git ls-files --error-unmatch .env > /dev/null 2>&1; then
    echo "❌ ERROR: .env file is tracked in git!"
    echo "   Run: npm run security:fix"
    ERRORS=$((ERRORS+1))
else
    echo "✅ .env is not tracked in git"
fi

# Check if sensitive files are tracked
if git ls-files | grep -q "\.env\.production$"; then
    echo "⚠️  WARNING: .env.production is tracked"
    WARNINGS=$((WARNINGS+1))
fi

# Check for serve package in client
if grep -q '"serve"' client/package.json; then
    echo "✅ serve package found in client"
else
    echo "⚠️  WARNING: serve package missing (needed for Railway)"
    WARNINGS=$((WARNINGS+1))
fi

# Check render.yaml exists
if [ -f "render.yaml" ]; then
    echo "✅ render.yaml configuration exists"
else
    echo "❌ ERROR: render.yaml not found"
    ERRORS=$((ERRORS+1))
fi

# Check if contract is deployed
if [ -f "deployments/latest.json" ]; then
    echo "✅ Smart contract deployment found"
    NETWORK=$(cat deployments/latest.json | grep -o '"chainId":"[^"]*"' | cut -d'"' -f4)
    if [ "$NETWORK" = "31337" ]; then
        echo "⚠️  WARNING: Contract deployed to localhost only"
        echo "   Run: npm run deploy:sepolia"
        WARNINGS=$((WARNINGS+1))
    else
        echo "✅ Contract deployed to network: $NETWORK"
    fi
else
    echo "⚠️  WARNING: No contract deployment found"
    WARNINGS=$((WARNINGS+1))
fi

# Check backend config
if [ -f "backend/config/contract.json" ]; then
    echo "✅ Backend contract config exists"
else
    echo "❌ ERROR: backend/config/contract.json missing"
    ERRORS=$((ERRORS+1))
fi

# Check documentation
echo ""
echo "📚 Documentation Check:"
[ -f "SECURITY_ALERT.md" ] && echo "✅ SECURITY_ALERT.md" || echo "❌ SECURITY_ALERT.md missing"
[ -f "RENDER_DEPLOYMENT.md" ] && echo "✅ RENDER_DEPLOYMENT.md" || echo "❌ RENDER_DEPLOYMENT.md missing"
[ -f "DEPLOYMENT_CHECKLIST.md" ] && echo "✅ DEPLOYMENT_CHECKLIST.md" || echo "❌ DEPLOYMENT_CHECKLIST.md missing"

# Summary
echo ""
echo "=================================="
echo "📊 VERIFICATION SUMMARY"
echo "=================================="
echo "❌ Errors:   $ERRORS"
echo "⚠️  Warnings: $WARNINGS"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ ALL CHECKS PASSED!"
    echo ""
    echo "🚀 Ready to deploy to Render!"
    echo ""
    echo "Next steps:"
    echo "1. Read SECURITY_ALERT.md"
    echo "2. Deploy contract: npm run deploy:sepolia"
    echo "3. Commit: git commit -m 'chore: production ready'"
    echo "4. Push: git push origin main"
    echo "5. Follow RENDER_DEPLOYMENT.md"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  Deployment possible with warnings"
    echo "Review warnings above before deploying"
    exit 0
else
    echo "❌ Fix errors before deploying"
    exit 1
fi
