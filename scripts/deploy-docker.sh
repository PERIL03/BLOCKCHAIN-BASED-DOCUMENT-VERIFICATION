#!/bin/bash

# Production Docker Deployment Script
# This script deploys the application using Docker Compose in production mode

set -e

echo "🚀 Starting Production Deployment with Docker..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: Docker Compose is not installed"
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "⚠️  Warning: .env.production not found"
    echo "Creating from .env.example..."
    cp .env.example .env.production
    echo "❗ Please edit .env.production with your production values before continuing"
    read -p "Press Enter to continue once you've configured .env.production..."
fi

# Load production environment
export $(cat .env.production | grep -v '^#' | xargs)

echo "📦 Building production images..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

echo "🚀 Starting production containers..."
docker-compose -f docker-compose.prod.yml up -d

echo "⏳ Waiting for services to be healthy..."
sleep 10

echo "📊 Container Status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "🌐 Services:"
echo "   Frontend: http://localhost:${FRONTEND_PORT:-80}"
echo "   Backend:  http://localhost:${BACKEND_PORT:-5000}"
echo ""
echo "📝 Useful Commands:"
echo "   View logs:    docker-compose -f docker-compose.prod.yml logs -f"
echo "   Stop:         docker-compose -f docker-compose.prod.yml down"
echo "   Restart:      docker-compose -f docker-compose.prod.yml restart"
echo "   Status:       docker-compose -f docker-compose.prod.yml ps"
