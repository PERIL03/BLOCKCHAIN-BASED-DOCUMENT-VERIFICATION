# 🚀 DEPLOYMENT CHECKLIST

## ⚠️ CRITICAL - Do This First!

### 1. **REMOVE .env FROM GIT IMMEDIATELY** (If committed)
```bash
# Remove .env from git history
git rm --cached .env
git commit -m "Remove .env from repository"
git push

# Then add to .gitignore (already done)
```

### 2. **Generate New Secrets**
```bash
# Run the secret generation script
npm run generate:secrets

# Or manually:
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

### 3. **Create Production Environment File**
```bash
cp .env.production.example .env.production
# Edit .env.production with your actual production values
```

## 📋 Pre-Deployment Steps

### Step 1: MongoDB Setup (REQUIRED)
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster
3. Create database user with password
4. Whitelist IP address (or use 0.0.0.0/0 for all IPs)
5. Get connection string:
   ```
   mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/document-verification?retryWrites=true&w=majority
   ```
6. Update `MONGODB_URI` in production environment

### Step 2: Blockchain Setup (REQUIRED)
1. **Generate NEW Ethereum Wallet** (NEVER use Hardhat default!)
   ```bash
   # Option 1: Using Node.js
   node -e "const wallet = require('ethers').Wallet.createRandom(); console.log('Address:', wallet.address); console.log('Private Key:', wallet.privateKey);"
   
   # Option 2: Use MyEtherWallet or MetaMask
   ```

2. **Get RPC Provider** (Choose one):
   - [Infura](https://infura.io) - Sign up and create project
   - [Alchemy](https://alchemy.com) - Sign up and create app
   - Get your RPC URL: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`

3. **Fund Your Wallet** (For testnet):
   - Sepolia Faucet: https://sepoliafaucet.com
   - Get at least 0.5 ETH for deployment

4. **Deploy Smart Contract**:
   ```bash
   # Update .env with your credentials
   PRIVATE_KEY=your_new_private_key
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
   BLOCKCHAIN_NETWORK=sepolia
   
   # Deploy
   npm run deploy:sepolia
   ```

5. **Verify Contract** (Optional but recommended):
   ```bash
   # Get Etherscan API key from: https://etherscan.io/myapikey
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
   ```

### Step 3: Update Configuration Files

#### Backend Configuration
Update `backend/config/contract.json` with deployed contract address:
```json
{
  "networks": {
    "11155111": {
      "contractAddress": "0xYOUR_DEPLOYED_CONTRACT_ADDRESS",
      "deploymentBlock": 123456
    }
  },
  "defaultNetwork": "11155111",
  "contractABI": "DocumentRegistry"
}
```

### Step 4: Environment Variables Setup

#### For Render (Backend):
```bash
MONGODB_URI=mongodb+srv://...
BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/...
BLOCKCHAIN_NETWORK=sepolia
PRIVATE_KEY=0x...
CLIENT_URL=https://your-frontend.vercel.app
SESSION_SECRET=<generated-secret>
JWT_SECRET=<generated-secret>
NODE_ENV=production
```

#### For Vercel (Frontend):
```bash
REACT_APP_API_URL=https://your-backend.onrender.com
```

#### For Railway (Backend):
Same as Render, add in Railway dashboard

## 🎯 Deployment Options

### Option A: Vercel (Frontend) + Render (Backend)

#### Deploy Frontend to Vercel:
```bash
cd client
npm install -g vercel
vercel login
vercel --prod

# Set environment variable:
# REACT_APP_API_URL=https://your-backend.onrender.com
```

#### Deploy Backend to Render:
1. Connect GitHub repository
2. Create new Web Service
3. Root Directory: `backend`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add environment variables from above
7. Deploy

### Option B: Railway (Full Stack)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy backend
cd backend
railway init
railway up

# Deploy frontend
cd ../client
railway init
railway up
```

### Option C: Docker Production

```bash
# Create production .env
cp .env.production.example .env.production
# Edit with your values

# Build and deploy
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

## ✅ Post-Deployment Verification

### 1. Test Backend Health
```bash
curl https://your-backend-url.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "mongodb": "connected",
  "environment": "production"
}
```

### 2. Test Frontend
- Visit your frontend URL
- Check browser console for errors
- Test document upload
- Test document verification

### 3. Test Blockchain Connection
```bash
curl https://your-backend-url.onrender.com/api
```

Should show API information

### 4. Upload Test Document
Use the frontend or:
```bash
curl -X POST https://your-backend-url.onrender.com/api/documents/upload \
  -F "file=@test.pdf" \
  -F "uploadedBy=test-user" \
  -F "description=test document"
```

## 🔒 Security Checklist

- [ ] `.env` file is NOT in git repository
- [ ] Using NEW private key (not Hardhat default)
- [ ] MongoDB password is strong and unique
- [ ] SESSION_SECRET and JWT_SECRET are randomly generated
- [ ] CORS is configured with actual frontend URL
- [ ] Rate limiting is enabled
- [ ] Helmet security headers are active
- [ ] Input validation middleware is in place
- [ ] File upload size is limited
- [ ] MongoDB Atlas IP whitelist configured

## 🐛 Troubleshooting

### Backend won't start:
1. Check logs for MongoDB connection errors
2. Verify MONGODB_URI is correct
3. Check if blockchain RPC URL is accessible
4. Verify contract.json exists and is valid

### Frontend can't connect to backend:
1. Check REACT_APP_API_URL is correct
2. Verify CORS settings in backend
3. Check backend is actually running
4. Look for CORS errors in browser console

### Contract deployment fails:
1. Check wallet has enough ETH
2. Verify RPC URL is correct
3. Check PRIVATE_KEY format (must start with 0x)
4. Try increasing gas limit in hardhat.config.js

### MongoDB connection fails:
1. Check IP whitelist in MongoDB Atlas
2. Verify username/password are correct
3. Check network connectivity
4. Try connection string in MongoDB Compass first

## 📚 Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [MongoDB Atlas Guide](https://docs.atlas.mongodb.com)
- [Vercel Deployment](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Infura Documentation](https://docs.infura.io)

## 🎉 Success!

Once everything is deployed:
1. Update repository README with live URLs
2. Document the deployment process
3. Set up monitoring (consider UptimeRobot)
4. Set up error tracking (consider Sentry)
5. Back up MongoDB regularly

---

**Need Help?** Check the logs:
- Render: Service → Logs tab
- Vercel: Deployment → Function Logs
- Railway: Project → Logs
- Docker: `docker-compose logs -f`
