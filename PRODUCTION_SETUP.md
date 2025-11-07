# Production Environment Setup

## MongoDB Atlas Setup

1. **Create MongoDB Atlas Account:**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free tier

2. **Create Cluster:**
   - Click "Build a Database"
   - Choose "Shared" (Free tier)
   - Select region closest to your users
   - Click "Create Cluster"

3. **Create Database User:**
   - Navigate to "Database Access"
   - Click "Add New Database User"
   - Set username and password
   - Set role to "Read and write to any database"

4. **Configure Network Access:**
   - Navigate to "Network Access"
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add your server's IP address

5. **Get Connection String:**
   - Click "Connect" on your cluster
   - Select "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Update MONGODB_URI in .env.production

## Infura/Alchemy Setup (Blockchain RPC)

### Option 1: Infura

1. Go to https://infura.io
2. Sign up for free account
3. Create new project
4. Select "Ethereum"
5. Copy the Sepolia endpoint URL
6. Update SEPOLIA_RPC_URL in .env.production

### Option 2: Alchemy

1. Go to https://www.alchemy.com
2. Sign up for free account
3. Create new app
4. Select "Ethereum" and "Sepolia"
5. Copy the HTTPS URL
6. Update SEPOLIA_RPC_URL in .env.production

## Private Key Setup

### ⚠️ CRITICAL SECURITY WARNING ⚠️

**NEVER use the default Hardhat private key in production!**

### Generate New Wallet:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use MetaMask
# 1. Create new account in MetaMask
# 2. Export private key
# 3. Use for deployment
```

### Fund Your Wallet:

For Sepolia testnet:
1. Go to https://sepoliafaucet.com
2. Enter your wallet address
3. Request test ETH
4. Wait for confirmation

For mainnet:
- Transfer real ETH to your deployment wallet
- Ensure sufficient balance for gas fees

## Environment Variables Template

```bash
# Copy this to .env.production and fill in your values

# === BLOCKCHAIN ===
PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE_WITHOUT_0x_PREFIX
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
BLOCKCHAIN_NETWORK=sepolia

# === DATABASE ===
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/document-verification?retryWrites=true&w=majority

# === BACKEND ===
PORT=5000
HOST=0.0.0.0
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.vercel.app

# === FRONTEND ===
REACT_APP_API_URL=https://your-backend-domain.onrender.com

# === SECURITY ===
# Generate with: openssl rand -base64 32
SESSION_SECRET=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)

# === OPTIONAL ===
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY
SENTRY_DSN=YOUR_SENTRY_DSN
```

## Deploy Smart Contract to Sepolia

```bash
# 1. Ensure environment is configured
source .env.production

# 2. Compile contracts
npm run compile

# 3. Deploy to Sepolia
npm run deploy:sepolia

# 4. Verify on Etherscan (optional)
npx hardhat verify --network sepolia CONTRACT_ADDRESS

# 5. Update backend config
# The deployment script automatically updates backend/config/contract.json
```

## SSL/TLS Certificates

### Option 1: Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal (already set up)
sudo certbot renew --dry-run
```

### Option 2: Cloudflare (Free + CDN)

1. Add your domain to Cloudflare
2. Update nameservers at your registrar
3. Enable "Full" SSL/TLS encryption
4. Enable "Always Use HTTPS"
5. Configure Page Rules for caching

## Monitoring Setup

### Option 1: PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Start backend
cd backend
pm2 start server.js --name blockchain-backend

# Start with env file
pm2 start server.js --name blockchain-backend --env production

# Monitor
pm2 monit

# Auto-restart on reboot
pm2 startup
pm2 save
```

### Option 2: Docker Health Checks

Already configured in docker-compose.yml:
- Backend: http://localhost:5000/health
- Frontend: http://localhost:80/health

### Option 3: External Monitoring

1. **UptimeRobot** (Free): https://uptimerobot.com
   - Monitor /health endpoints
   - Email alerts on downtime

2. **Sentry** (Error Tracking): https://sentry.io
   - Add to backend: npm install @sentry/node
   - Configure DSN in .env.production

3. **New Relic** (Performance): https://newrelic.com
   - Full application monitoring
   - Real-time analytics

## Backup Strategy

### MongoDB Backups

```bash
# Manual backup
mongodump --uri="$MONGODB_URI" --out=/backups/$(date +%Y%m%d)

# Automated daily backups (cron)
0 2 * * * mongodump --uri="$MONGODB_URI" --out=/backups/$(date +\%Y\%m\%d)

# MongoDB Atlas Automated Backups (Recommended)
# Enable in Atlas console: Backup > Configure
```

### Smart Contract Backups

```bash
# Contract source code: Version control (Git)
# ABI and artifacts: Already in deployments/ directory
# Deployment info: deployments/sepolia-*.json
```

## Performance Optimization

### 1. Enable Redis Caching (Optional)

```bash
# Install Redis
docker run -d -p 6379:6379 redis:alpine

# Update backend to use Redis for caching
# See backend/utils/cache.js (if implemented)
```

### 2. CDN for Static Assets

- Use Cloudflare or AWS CloudFront
- Configure in nginx or Vercel

### 3. Database Indexing

```javascript
// Add to backend/models/Document.js
documentSchema.index({ fileHash: 1 });
documentSchema.index({ uploadedBy: 1 });
documentSchema.index({ createdAt: -1 });
```

## Security Checklist

- [ ] Changed default private keys
- [ ] MongoDB uses strong password
- [ ] IP whitelist enabled on MongoDB Atlas
- [ ] SSL/TLS certificates installed
- [ ] Environment variables secured (not in code)
- [ ] Rate limiting enabled (already configured)
- [ ] CORS properly configured
- [ ] Security headers enabled (already configured)
- [ ] Regular dependency updates (npm audit)
- [ ] Firewall configured
- [ ] Backup strategy in place
- [ ] Monitoring and alerts set up
- [ ] Secrets stored securely (use secrets manager)

## Cost Estimates

### Free Tier (Good for Testing/MVP):
- MongoDB Atlas: Free (512MB storage)
- Vercel: Free (100GB bandwidth)
- Render: Free (750 hours/month)
- Infura: Free (100k requests/day)
- **Total: $0/month**

### Production Tier:
- MongoDB Atlas: $9/month (2GB)
- Render: $7/month (backend)
- Vercel: $20/month (pro)
- Infura: $50/month (growth)
- Domain: $12/year
- **Total: ~$86/month + $12/year**

### Enterprise Tier:
- AWS ECS/RDS: $100-500/month
- MongoDB Atlas: $57+/month
- CloudFlare Pro: $20/month
- New Relic: $99/month
- **Total: $276-676/month**

## Support

For production deployment issues:
- Check logs: `docker-compose logs -f`
- Health check: `curl https://your-domain.com/health`
- GitHub Issues: Create an issue with logs
- Documentation: See DEPLOYMENT.md

---

**Remember:** Always test in staging environment before deploying to production!
