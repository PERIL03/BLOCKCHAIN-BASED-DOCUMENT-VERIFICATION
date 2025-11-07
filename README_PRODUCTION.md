# 🔐 Blockchain Document Verification System

A production-ready, full-stack decentralized application for registering and verifying documents on the Ethereum blockchain.

## 🌟 Features

- **Immutable Document Registry**: Register documents on blockchain with SHA-256 hashing
- **Document Verification**: Verify document authenticity against blockchain records
- **Metadata Storage**: Store document metadata in MongoDB for quick access
- **RESTful API**: Complete backend API with Express.js
- **Modern React UI**: User-friendly interface for document management
- **Smart Contract Security**: Gas-optimized Solidity contract with comprehensive tests
- **Production Ready**: Docker support, deployment scripts, and comprehensive documentation

## 🏗️ Architecture

```
Frontend (React)  →  Backend (Express.js)  →  Blockchain (Ethereum)
                  →  Database (MongoDB)
```

- **Frontend**: React 18, Material-UI inspired design
- **Backend**: Node.js, Express.js, MongoDB, Ethers.js
- **Blockchain**: Ethereum, Hardhat, Solidity 0.8.20
- **Database**: MongoDB (local/Atlas)

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB (local or Atlas account)
- Ethereum wallet (for deployment)
- RPC provider (Infura/Alchemy for production)

## 🚀 Quick Start (Local Development)

### 1. Clone and Install

```bash
git clone <repository-url>
cd FINAL_FULLSTACK
npm run install:all
```

### 2. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your local settings
# Default values work for local development
```

### 3. Start Local Blockchain

```bash
# Terminal 1
npm run node
```

### 4. Deploy Smart Contract

```bash
# Terminal 2
npm run deploy
```

### 5. Start Backend

```bash
# Terminal 3
npm run backend:dev
```

### 6. Start Frontend

```bash
# Terminal 4
npm run client
```

Visit: http://localhost:3000

## 🔧 Configuration

### Environment Variables

See `.env.example` for all available options.

**Critical Variables for Production:**
- `MONGODB_URI` - MongoDB connection string
- `BLOCKCHAIN_RPC_URL` - Ethereum node RPC URL
- `PRIVATE_KEY` - Wallet private key (NEVER use default!)
- `CLIENT_URL` - Frontend URL for CORS
- `SESSION_SECRET` - Random secret for sessions
- `JWT_SECRET` - Random secret for JWT

### Generate Secrets

```bash
npm run generate:secrets
```

## 📦 Deployment

### ⚠️ CRITICAL: Pre-Deployment Security

**FIRST, check if .env is in git:**
```bash
npm run security:fix
```

If `.env` was committed, you MUST:
1. Remove it from git history
2. Change ALL secrets immediately
3. Generate new wallet
4. Update MongoDB password

### Deployment Options

#### Option 1: Vercel (Frontend) + Render (Backend)

**Detailed steps in:** [`DEPLOYMENT_CHECKLIST.md`](./DEPLOYMENT_CHECKLIST.md)

1. **Deploy Smart Contract to Testnet**
   ```bash
   # Set up .env.production with Sepolia RPC and new private key
   npm run deploy:sepolia
   ```

2. **Deploy Backend to Render**
   - Connect GitHub repository
   - Root Directory: `backend`
   - Build: `npm install`
   - Start: `npm start`
   - Add environment variables

3. **Deploy Frontend to Vercel**
   ```bash
   cd client
   vercel --prod
   ```
   - Set `REACT_APP_API_URL` to your Render backend URL

#### Option 2: Railway (Full Stack)

```bash
# Deploy backend
cd backend
railway up

# Deploy frontend  
cd ../client
railway up
```

#### Option 3: Docker Production

```bash
# Configure .env.production
cp .env.production.example .env.production
# Edit with production values

# Deploy
npm run docker:prod:build
npm run docker:prod
```

## 🧪 Testing

```bash
# Run all tests
npm run test:all

# Smart contract tests only
npm test

# Backend API tests
npm run test:backend

# Frontend tests
npm run test:client
```

## 📚 Project Structure

```
├── contracts/              # Smart contracts
│   └── DocumentRegistry.sol
├── backend/               # Express.js API
│   ├── routes/           # API routes
│   ├── models/           # MongoDB models
│   ├── utils/            # Blockchain utilities
│   └── config/           # Configuration files
├── client/               # React frontend
│   └── src/
│       ├── components/   # React components
│       └── utils/        # Frontend utilities
├── scripts/              # Deployment & utility scripts
├── deployments/          # Contract deployment info
└── artifacts/            # Compiled contracts
```

## 🔒 Security Features

- ✅ Helmet.js security headers
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Input validation & sanitization
- ✅ File upload limits
- ✅ MongoDB injection prevention
- ✅ Environment variable validation

## 📖 API Documentation

### Endpoints

**Health Check**
```
GET /health
```

**Upload Document**
```
POST /api/documents/upload
Content-Type: multipart/form-data

Body:
- file: File
- uploadedBy: string
- description: string (optional)
- category: string (optional)
```

**Verify Document**
```
POST /api/documents/verify
Content-Type: multipart/form-data

Body:
- file: File OR fileHash: string
```

**Get All Documents**
```
GET /api/documents?page=1&limit=10&category=legal
```

**Get Document by ID**
```
GET /api/documents/:id
```

**Get Statistics**
```
GET /api/documents/stats/overview
```

Full API documentation: Visit `/api` endpoint when server is running

## 🛠️ Development Scripts

```bash
npm run install:all       # Install all dependencies
npm run compile           # Compile smart contracts
npm test                  # Run smart contract tests
npm run node             # Start local blockchain
npm run deploy           # Deploy to local network
npm run deploy:sepolia   # Deploy to Sepolia testnet
npm run dev              # Start all services
npm run build:all        # Build everything
npm run prepare:deploy   # Prepare for deployment
```

## 📊 Smart Contract

**DocumentRegistry.sol**
- Gas-optimized storage patterns
- Custom errors for gas efficiency
- Comprehensive events
- Pagination support
- Owner tracking
- Metadata storage (256 char limit)

**Key Functions:**
- `registerDocument(hash, metadata)` - Register new document
- `verifyDocument(hash)` - Verify document exists
- `getDocument(hash)` - Get document details
- `getDocumentsByOwner(address)` - Get user's documents

## 🐛 Troubleshooting

### Common Issues

**MongoDB connection failed**
- Check MONGODB_URI format
- Verify IP whitelist in Atlas
- Test connection with MongoDB Compass

**Contract deployment fails**
- Ensure wallet has enough ETH
- Check RPC URL is correct
- Verify private key format (must start with 0x)

**Frontend can't connect to backend**
- Check REACT_APP_API_URL is set
- Verify CORS settings in backend
- Check browser console for errors

**Transaction fails**
- Insufficient gas
- Network congestion
- Invalid document hash format

See [`DEPLOYMENT_CHECKLIST.md`](./DEPLOYMENT_CHECKLIST.md) for detailed troubleshooting.

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📞 Support

For issues and questions:
- Check existing [GitHub Issues](../../issues)
- Review [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## ⚠️ Important Notes

1. **NEVER commit .env files** - They contain sensitive credentials
2. **Generate new private keys** for production - Don't use Hardhat defaults
3. **Use strong passwords** for MongoDB and other services
4. **Back up your wallet** and keep private keys secure
5. **Test thoroughly** on testnet before mainnet deployment
6. **Monitor gas prices** when deploying to mainnet
7. **Keep dependencies updated** for security patches

## 🎯 Production Checklist

Before going live:
- [ ] MongoDB Atlas configured
- [ ] Smart contract deployed to testnet/mainnet
- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] All environment variables set
- [ ] .env removed from git
- [ ] New private key generated and funded
- [ ] CORS configured correctly
- [ ] Rate limiting tested
- [ ] File upload limits tested
- [ ] Error monitoring set up
- [ ] Backup strategy in place

## 📈 Monitoring

**Recommended Tools:**
- Backend: [UptimeRobot](https://uptimerobot.com) for uptime monitoring
- Errors: [Sentry](https://sentry.io) for error tracking
- Blockchain: [Etherscan](https://etherscan.io) for transaction monitoring
- Database: MongoDB Atlas built-in monitoring

---

**Built with ❤️ using Ethereum, React, and Node.js**

For detailed deployment instructions, see [`DEPLOYMENT_CHECKLIST.md`](./DEPLOYMENT_CHECKLIST.md)
