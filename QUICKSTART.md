# Blockchain Document Verification System
# Quick Reference Guide

## 🚀 Quick Start Commands

### First Time Setup
```bash
# 1. Copy environment file
cp .env.example .env

# 2. Install all dependencies
npm run install:all

# 3. Run automated setup
npm run setup
```

### Development Workflow
```bash
# Terminal 1: Start blockchain
npm run node

# Terminal 2: Deploy contracts (after blockchain is running)
npm run deploy

# Terminal 3: Start backend
npm run backend:dev

# Terminal 4: Start frontend
npm run client
```

### Docker (Easiest)
```bash
# Start everything with one command
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down
```

## 📋 Available Scripts

### Root Level
- `npm run install:all` - Install all dependencies
- `npm run compile` - Compile smart contracts
- `npm test` - Test smart contracts
- `npm run node` - Start Hardhat blockchain
- `npm run deploy` - Deploy to localhost
- `npm run dev` - Start all services
- `npm run setup` - Automated setup script

### Backend
- `cd backend && npm start` - Start production server
- `cd backend && npm run dev` - Start with nodemon
- `cd backend && npm test` - Run API tests

### Frontend
- `cd client && npm start` - Start development server
- `cd client && npm run build` - Build for production
- `cd client && npm test` - Run component tests

## 🔗 Access Points

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| API Docs | http://localhost:5000/api |
| Health Check | http://localhost:5000/health |
| Hardhat Node | http://localhost:8545 |
| MongoDB | mongodb://localhost:27017 |

## 📁 Important Files

### Configuration
- `.env` - Environment variables
- `hardhat.config.js` - Blockchain configuration
- `package.json` - Dependencies and scripts

### Smart Contracts
- `contracts/DocumentRegistry.sol` - Main contract
- `scripts/deploy.js` - Deployment script

### Backend
- `backend/server.js` - Express server
- `backend/routes/documents.js` - API routes
- `backend/models/Document.js` - MongoDB schema
- `backend/utils/blockchain.js` - Blockchain utilities

### Frontend
- `client/src/App.js` - Main React component
- `client/src/components/` - UI components
- `client/src/utils/` - Helper functions

### Documentation
- `README.md` - Main documentation
- `API_DOCUMENTATION.md` - Complete API reference
- `DEPLOYMENT.md` - Deployment guide

## 🧪 Testing

```bash
# Test everything
npm run test:all

# Test smart contracts
npm test

# Test backend API
npm run test:backend

# Test frontend
npm run test:client
```

## 🐳 Docker Commands

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs (all services)
docker-compose logs -f

# View logs (specific service)
docker-compose logs -f backend

# Restart a service
docker-compose restart backend

# Stop all services
docker-compose down

# Remove volumes (fresh start)
docker-compose down -v
```

## 🔧 Troubleshooting

### "Contract not deployed" Error
```bash
# Restart blockchain and redeploy
npm run node
npm run deploy
```

### "Cannot connect to MongoDB" Error
```bash
# Check if MongoDB is running
docker-compose ps mongodb

# Or start MongoDB separately
docker-compose up -d mongodb
```

### Port Already in Use
```bash
# Find process using port 3000/5000/8545
lsof -ti:3000
lsof -ti:5000
lsof -ti:8545

# Kill process
kill -9 <PID>
```

### Clear Everything and Start Fresh
```bash
# Stop all services
docker-compose down -v

# Remove node_modules
npm run clean

# Reinstall
npm run install:all

# Run setup again
npm run setup
```

## 📦 Deployment Checklist

- [ ] Update `.env` with production values
- [ ] Set secure `PRIVATE_KEY` (not default)
- [ ] Configure production `MONGODB_URI`
- [ ] Set `BLOCKCHAIN_RPC_URL` (Infura/Alchemy)
- [ ] Update `CLIENT_URL` to production domain
- [ ] Enable HTTPS/SSL
- [ ] Setup monitoring (Sentry, New Relic)
- [ ] Configure backups
- [ ] Review security settings

## 🆘 Getting Help

- **Documentation**: Check README.md, API_DOCUMENTATION.md, DEPLOYMENT.md
- **Issues**: https://github.com/yourusername/blockchain-doc-verify/issues
- **Email**: support@example.com

## 📝 Common Tasks

### Add a New Document Category
Edit `backend/models/Document.js` and `client/src/components/DocumentUpload.jsx`

### Change Network
Update `BLOCKCHAIN_NETWORK` and `BLOCKCHAIN_RPC_URL` in `.env`

### Customize UI
Edit files in `client/src/components/` and `client/src/App.css`

### Add API Endpoint
1. Add route in `backend/routes/documents.js`
2. Add validation in `backend/middleware/validation.js`
3. Update API documentation

## 🎯 Project Status

✅ All features implemented
✅ Complete test coverage
✅ Production-ready
✅ Docker support
✅ Full documentation
✅ Security best practices
✅ Error handling
✅ Input validation

---

**Ready to deploy!** Follow the DEPLOYMENT.md guide for production deployment.
