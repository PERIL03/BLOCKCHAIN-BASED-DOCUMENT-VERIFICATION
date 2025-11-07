# 🚀 Deployment Guide

Complete deployment guide for the Blockchain Document Verification System.

## Table of Contents

- [Deployment Options](#deployment-options)
- [Prerequisites](#prerequisites)
- [Docker Deployment](#docker-deployment)
- [Vercel Deployment (Frontend)](#vercel-deployment)
- [Render Deployment (Backend)](#render-deployment)
- [Railway Deployment (Full Stack)](#railway-deployment)
- [AWS Deployment](#aws-deployment)
- [Environment Variables](#environment-variables)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)

---

## Deployment Options

| Option | Best For | Cost | Complexity |
|--------|----------|------|------------|
| **Docker** | Local/VPS deployment | Free (hosting costs) | Low |
| **Vercel + Render** | Quick deployment | Free tier available | Low |
| **Railway** | All-in-one solution | Paid ($5+/month) | Low |
| **AWS** | Production/Enterprise | Variable | High |
| **Custom VPS** | Full control | $5-50/month | Medium |

---

## Prerequisites

Before deploying, ensure you have:

- [ ] MongoDB database (Atlas, local, or containerized)
- [ ] Ethereum RPC endpoint (Infura, Alchemy, or local node)
- [ ] Private key for blockchain transactions
- [ ] Domain name (optional but recommended)
- [ ] SSL certificate (for production)

---

## Docker Deployment

### Local Development

```bash
# Clone the repository
git clone <repository-url>
cd blockchain-doc-verify

# Create environment file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### Production Docker Setup

1. **Update docker-compose.yml for production:**

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    volumes:
      - mongodb_data:/data/db
    networks:
      - blockchain-network

  backend:
    build: ./backend
    restart: always
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - BLOCKCHAIN_RPC_URL=${BLOCKCHAIN_RPC_URL}
      - PRIVATE_KEY=${PRIVATE_KEY}
    depends_on:
      - mongodb
    networks:
      - blockchain-network

  frontend:
    build: ./client
    restart: always
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    networks:
      - blockchain-network

networks:
  blockchain-network:
    driver: bridge

volumes:
  mongodb_data:
```

2. **Deploy:**

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Enable auto-restart
docker update --restart=unless-stopped $(docker ps -q)
```

---

## Vercel Deployment

Perfect for deploying the React frontend.

### Step 1: Prepare Frontend

```bash
cd client

# Create vercel.json
cat > vercel.json << EOF
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
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "REACT_APP_API_URL": "@api-url"
  }
}
EOF
```

### Step 2: Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Production deployment
vercel --prod
```

### Step 3: Configure Environment Variables

In Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add:
   - `REACT_APP_API_URL` = Your backend API URL

---

## Render Deployment

Ideal for deploying the backend API.

### Step 1: Prepare Backend

Create `render.yaml`:

```yaml
services:
  - type: web
    name: blockchain-doc-backend
    env: node
    region: oregon
    plan: starter
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
      - key: MONGODB_URI
        sync: false
      - key: BLOCKCHAIN_RPC_URL
        sync: false
      - key: PRIVATE_KEY
        sync: false
      - key: CLIENT_URL
        sync: false
    healthCheckPath: /health

databases:
  - name: blockchain-doc-mongodb
    region: oregon
    plan: starter
    databaseName: document-verification
    user: admin
```

### Step 2: Deploy

1. **Via Render Dashboard:**
   - Connect your GitHub repository
   - Select "New Web Service"
   - Choose the backend directory
   - Configure environment variables
   - Deploy

2. **Via Render CLI:**

```bash
# Install Render CLI
npm install -g @render-oss/cli

# Deploy
render deploy
```

### Step 3: Configure Environment Variables

In Render Dashboard, add:
- `MONGODB_URI`
- `BLOCKCHAIN_RPC_URL`
- `PRIVATE_KEY`
- `CLIENT_URL`

---

## Railway Deployment

Full-stack deployment on Railway.

### Step 1: Create railway.json

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Step 2: Deploy

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy backend
cd backend
railway up

# Deploy frontend
cd ../client
railway up

# Deploy MongoDB
railway add mongodb
```

### Step 3: Configure Services

1. **Backend Service:**
   - Set `MONGODB_URI` from Railway MongoDB
   - Add other environment variables
   - Set domain for API

2. **Frontend Service:**
   - Set `REACT_APP_API_URL` to backend domain
   - Configure build command: `npm run build`
   - Configure start command: `npx serve -s build`

---

## AWS Deployment

Enterprise-grade deployment on AWS.

### Architecture

```
┌─────────────────┐
│   CloudFront    │  (CDN for frontend)
└────────┬────────┘
         │
┌────────▼────────┐
│   S3 Bucket     │  (Static frontend)
└─────────────────┘

┌─────────────────┐
│   Route 53      │  (DNS)
└────────┬────────┘
         │
┌────────▼────────┐
│  Load Balancer  │
└────────┬────────┘
         │
┌────────▼────────┐
│   ECS/EC2       │  (Backend containers)
└────────┬────────┘
         │
┌────────▼────────┐
│  DocumentDB     │  (MongoDB-compatible)
└─────────────────┘
```

### Step 1: Deploy Frontend to S3

```bash
# Build frontend
cd client
npm run build

# Install AWS CLI
pip install awscli

# Configure AWS
aws configure

# Create S3 bucket
aws s3 mb s3://your-app-name

# Enable static website hosting
aws s3 website s3://your-app-name --index-document index.html

# Upload build
aws s3 sync build/ s3://your-app-name --acl public-read

# Create CloudFront distribution
aws cloudfront create-distribution --origin-domain-name your-app-name.s3.amazonaws.com
```

### Step 2: Deploy Backend to ECS

1. **Create ECR Repository:**

```bash
aws ecr create-repository --repository-name blockchain-doc-backend
```

2. **Build and Push Docker Image:**

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t blockchain-doc-backend ./backend

# Tag image
docker tag blockchain-doc-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/blockchain-doc-backend:latest

# Push image
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/blockchain-doc-backend:latest
```

3. **Create ECS Task Definition:**

```json
{
  "family": "blockchain-doc-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/blockchain-doc-backend:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "MONGODB_URI",
          "valueFrom": "arn:aws:secretsmanager:..."
        }
      ]
    }
  ]
}
```

### Step 3: Setup DocumentDB

```bash
# Create DocumentDB cluster
aws docdb create-db-cluster \
  --db-cluster-identifier blockchain-doc-cluster \
  --engine docdb \
  --master-username admin \
  --master-user-password <password>

# Create instance
aws docdb create-db-instance \
  --db-instance-identifier blockchain-doc-instance \
  --db-instance-class db.t3.medium \
  --engine docdb \
  --db-cluster-identifier blockchain-doc-cluster
```

---

## Environment Variables

### Production Environment Variables

#### Backend (.env)

```bash
# Production settings
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# Blockchain
BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=your_private_key_here
BLOCKCHAIN_NETWORK=sepolia

# CORS
CLIENT_URL=https://your-frontend-domain.com

# Optional
ETHERSCAN_API_KEY=your_etherscan_key
```

#### Frontend (.env)

```bash
REACT_APP_API_URL=https://api.your-domain.com
```

---

## Post-Deployment

### 1. Verify Deployment

```bash
# Check backend health
curl https://api.your-domain.com/health

# Check frontend
curl https://your-domain.com

# Test document upload
curl -X POST https://api.your-domain.com/api/documents/upload \
  -F "file=@test.pdf" \
  -F "uploadedBy=test@example.com"
```

### 2. Monitor Services

Set up monitoring with:
- **Application Monitoring**: New Relic, DataDog, or CloudWatch
- **Error Tracking**: Sentry
- **Uptime Monitoring**: UptimeRobot, Pingdom

### 3. Setup SSL/TLS

```bash
# Using Let's Encrypt with Certbot
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
0 12 * * * /usr/bin/certbot renew --quiet
```

### 4. Configure Firewall

```bash
# UFW (Ubuntu)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

### 5. Setup Backups

```bash
# MongoDB backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGODB_URI" --out="/backups/backup_$DATE"
aws s3 sync /backups/ s3://your-backup-bucket/
```

---

## Troubleshooting

### Common Issues

#### MongoDB Connection Failed

```bash
# Check MongoDB status
docker-compose logs mongodb

# Verify connection string
mongo "$MONGODB_URI"

# Check network
docker network inspect blockchain-network
```

#### Smart Contract Not Deployed

```bash
# Redeploy contract
npm run deploy

# Verify deployment
npx hardhat run scripts/verify-deployment.js
```

#### Frontend Can't Connect to Backend

```bash
# Check CORS settings
# Verify CLIENT_URL in backend .env

# Check API URL
# Verify REACT_APP_API_URL in frontend
```

#### High Memory Usage

```bash
# Check container stats
docker stats

# Increase memory limit in docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 2G
```

---

## Scaling

### Horizontal Scaling

```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      replicas: 3
```

### Load Balancing

Use Nginx as load balancer:

```nginx
upstream backend {
    server backend1:5000;
    server backend2:5000;
    server backend3:5000;
}

server {
    location /api {
        proxy_pass http://backend;
    }
}
```

---

## Security Checklist

- [ ] Use environment variables for secrets
- [ ] Enable HTTPS/SSL
- [ ] Implement rate limiting
- [ ] Enable CORS properly
- [ ] Use strong MongoDB passwords
- [ ] Keep dependencies updated
- [ ] Enable firewall
- [ ] Setup monitoring and alerts
- [ ] Regular security audits
- [ ] Backup strategy in place

---

## Support

For deployment issues:
- **Documentation**: This guide
- **GitHub Issues**: [Report deployment issues](https://github.com/yourusername/blockchain-doc-verify/issues)
- **Email**: devops@example.com

---

**Last Updated**: November 2024
