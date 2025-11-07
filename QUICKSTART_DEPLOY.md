# 🚀 Quick Deployment Guide

This guide will help you deploy your Blockchain Document Verification System to production in minutes.

## 📋 Pre-Deployment Checklist

Run the automated checklist:

```bash
./scripts/pre-deploy-check.sh
```

This will verify:
- ✅ Node.js version
- ✅ Dependencies installed
- ✅ Environment configuration
- ✅ Smart contracts compiled and deployed
- ✅ Tests passing
- ✅ Security checks

## 🎯 Choose Your Deployment Strategy

### Option 1: Docker (Recommended for VPS/Self-Hosted)

**Best for:** Full control, VPS deployment, on-premise hosting

```bash
# 1. Configure production environment
cp .env.example .env.production
# Edit .env.production with your production values

# 2. Run deployment script
./scripts/deploy-docker.sh
```

**Time to deploy:** ~5 minutes

---

### Option 2: Vercel (Frontend) + Render (Backend)

**Best for:** Quick deployment, free tier available, managed hosting

#### Frontend on Vercel:

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
cd client
vercel --prod
```

Configure in Vercel Dashboard:
- **Environment Variable:** `REACT_APP_API_URL` = Your backend URL

#### Backend on Render:

1. Go to [render.com](https://render.com)
2. Click "New +" → "Blueprint"
3. Connect your GitHub repo
4. Select `backend/render.yaml`
5. Configure environment variables:
   - `MONGODB_URI`
   - `BLOCKCHAIN_RPC_URL`
   - `PRIVATE_KEY`
   - `CLIENT_URL`

**Time to deploy:** ~10 minutes

---

### Option 3: Railway (Full-Stack)

**Best for:** All-in-one deployment, easy setup

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login and initialize
railway login
railway init

# 3. Deploy backend
cd backend
railway up

# 4. Deploy frontend
cd ../client
railway up

# 5. Add MongoDB
railway add mongodb
```

**Time to deploy:** ~8 minutes

---

### Option 4: AWS (Production/Enterprise)

**Best for:** Large-scale production, enterprise requirements

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed AWS setup.

**Time to deploy:** ~30-60 minutes

---

## 🔐 Environment Variables Setup

### Required for Production:

```bash
# Blockchain
PRIVATE_KEY=<your-wallet-private-key>
BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/<your-infura-key>
BLOCKCHAIN_NETWORK=sepolia

# Database
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/dbname

# Backend
PORT=5000
NODE_ENV=production
CLIENT_URL=https://your-frontend-url.com

# Frontend
REACT_APP_API_URL=https://your-backend-url.com

# Security (generate with: openssl rand -base64 32)
SESSION_SECRET=<random-string>
JWT_SECRET=<random-string>
```

---

## 🎬 Quick Start Deployment (Local Testing)

Test production build locally:

```bash
# 1. Start all services
docker-compose up -d

# 2. Check status
docker-compose ps

# 3. View logs
docker-compose logs -f

# 4. Test endpoints
curl http://localhost:5000/health
curl http://localhost:3000
```

---

## 📊 Post-Deployment Verification

### 1. Health Checks

```bash
# Backend
curl https://your-backend-url.com/health

# Frontend
curl https://your-frontend-url.com/health
```

### 2. Test Document Upload

```bash
curl -X POST https://your-backend-url.com/api/documents/upload \
  -F "file=@test.pdf" \
  -F "uploadedBy=test@example.com"
```

### 3. Monitor Logs

```bash
# Docker
docker-compose logs -f backend

# Render
Check Render dashboard

# Vercel
vercel logs
```

---

## 🔧 Common Issues & Solutions

### Issue: Contract not found

**Solution:**
```bash
npm run compile
npm run deploy:sepolia
```

### Issue: MongoDB connection failed

**Solution:**
- Verify MONGODB_URI in environment variables
- Check IP whitelist in MongoDB Atlas
- Ensure network connectivity

### Issue: CORS errors

**Solution:**
- Update CLIENT_URL in backend .env
- Verify REACT_APP_API_URL in frontend

### Issue: Gas estimation failed

**Solution:**
- Check wallet has sufficient ETH
- Verify RPC endpoint is working
- Check network configuration

---

## 📈 Scaling for Production

### Enable Auto-Scaling (Docker Swarm)

```bash
docker swarm init
docker stack deploy -c docker-compose.prod.yml blockchain-app
docker service scale blockchain-app_backend=3
```

### Enable CDN (Cloudflare)

1. Add domain to Cloudflare
2. Enable caching for static assets
3. Configure SSL/TLS
4. Enable DDoS protection

### Add Load Balancer

See `nginx-lb.conf` example in docs.

---

## 🔒 Security Hardening

1. **Enable SSL/TLS:**
   ```bash
   certbot --nginx -d your-domain.com
   ```

2. **Configure Firewall:**
   ```bash
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw enable
   ```

3. **Enable Rate Limiting:**
   Already configured in backend (100 requests/15min)

4. **Regular Updates:**
   ```bash
   npm audit fix
   docker-compose pull
   ```

---

## 📞 Support & Resources

- **Documentation:** [Full docs](./README.md)
- **API Reference:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Deployment Guide:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **GitHub Issues:** [Report issues](https://github.com/your-repo/issues)

---

## ✅ Deployment Checklist

- [ ] Environment variables configured
- [ ] Smart contracts deployed to testnet/mainnet
- [ ] MongoDB database set up (Atlas recommended)
- [ ] RPC endpoint configured (Infura/Alchemy)
- [ ] Domain name configured (optional)
- [ ] SSL certificates installed (production)
- [ ] Health checks passing
- [ ] Tests passing
- [ ] Monitoring set up
- [ ] Backup strategy in place
- [ ] Security audit completed
- [ ] Documentation updated
- [ ] Team notified

---

**Last Updated:** November 2024

**Need help?** Open an issue or contact support.
