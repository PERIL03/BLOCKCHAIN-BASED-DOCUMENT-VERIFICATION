# 🔐 Blockchain Document Verification System

A complete, production-ready blockchain-based document verification system using Ethereum smart contracts, React, Express, and MongoDB.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [Testing](#testing)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- **Blockchain Integration**: Ethereum smart contracts for immutable document registry
- **Document Upload**: Register documents on the blockchain with cryptographic hashing
- **Document Verification**: Verify document authenticity against blockchain records
- **Full-Text Search**: Search and filter documents by category, uploader, and status
- **Real-time Dashboard**: View statistics and recent document activity
- **Production-Ready**: Complete with Docker, tests, and deployment configurations
- **Security**: Input validation, rate limiting, and secure hash verification
- **Responsive UI**: Modern React interface with beautiful gradient design

## 🛠 Tech Stack

### Smart Contracts
- **Solidity** ^0.8.20 - Smart contract programming
- **Hardhat** - Development environment
- **Ethers.js** v6 - Blockchain interaction

### Backend
- **Node.js** 18+ - Runtime environment
- **Express.js** - REST API framework
- **MongoDB** - Document database
- **Mongoose** - ODM for MongoDB

### Frontend
- **React** 18 - UI framework
- **CSS3** - Styling with gradients
- **Fetch API** - HTTP requests

### DevOps
- **Docker** & **Docker Compose** - Containerization
- **Mocha** & **Chai** - Testing framework
- **ESLint** & **Prettier** - Code quality

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MongoDB** (v7.0 or higher) - Optional if using Docker
- **Docker** & **Docker Compose** - Optional for containerized deployment

Check your versions:

```bash
node --version
npm --version
docker --version
docker-compose --version
```

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd blockchain-doc-verify

# Run the automated setup script
npm run setup
```

The setup script will:
1. Install all dependencies
2. Compile smart contracts
3. Start a local Hardhat blockchain
4. Deploy contracts
5. Optionally seed the database

### Option 2: Manual Setup

#### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install client dependencies
cd client
npm install
cd ..
```

#### 2. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration (use default values for local development)
```

#### 3. Compile Smart Contracts

```bash
npm run compile
```

#### 4. Start Local Blockchain

```bash
# In a separate terminal
npm run node
```

#### 5. Deploy Smart Contracts

```bash
# In another terminal
npm run deploy
```

#### 6. Start Backend Server

```bash
# In another terminal
npm run backend
```

#### 7. Start Frontend Application

```bash
# In another terminal
npm run client
```

### Option 3: Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## 📁 Project Structure

```
blockchain-doc-verify/
├── contracts/                  # Smart contracts
│   └── DocumentRegistry.sol    # Main registry contract
├── scripts/                    # Deployment and utility scripts
│   ├── deploy.js              # Contract deployment
│   ├── setup.sh               # Automated setup
│   └── seed-database.js       # Database seeding
├── backend/                    # Express API server
│   ├── server.js              # Main server file
│   ├── models/                # MongoDB models
│   ├── routes/                # API routes
│   ├── middleware/            # Express middleware
│   ├── utils/                 # Utility functions
│   ├── config/                # Configuration files
│   └── test/                  # Backend tests
├── client/                     # React frontend
│   ├── src/
│   │   ├── App.js             # Main application
│   │   ├── components/        # React components
│   │   ├── utils/             # Frontend utilities
│   │   └── __tests__/         # Frontend tests
│   └── public/                # Static files
├── deployments/                # Contract deployment info
├── artifacts/                  # Compiled contracts
├── docker-compose.yml         # Docker orchestration
├── hardhat.config.js          # Hardhat configuration
├── package.json               # Root dependencies
├── .env.example               # Environment template
├── README.md                  # This file
├── API_DOCUMENTATION.md       # API reference
└── DEPLOYMENT.md              # Deployment guide
```

## 💻 Usage

### Accessing the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

### Uploading a Document

1. Navigate to the "Upload Document" tab
2. Drag and drop a file or click to browse
3. Enter your name or email
4. Select a category (optional)
5. Add a description and tags (optional)
6. Click "Upload & Register"
7. The document will be hashed and registered on the blockchain

### Verifying a Document

1. Navigate to the "Verify Document" tab
2. Choose verification method:
   - **By File**: Upload the document to verify
   - **By Hash**: Enter the document's SHA-256 hash
3. Click "Verify Document"
4. View verification results and blockchain details

### Browsing Documents

1. Navigate to the "Document Registry" tab
2. Use filters to search by category, status, or uploader
3. View document details by clicking the "View" button
4. Click on hashes to copy them to clipboard

### Dashboard

View real-time statistics including:
- Total documents registered
- Verified documents count
- Total verifications performed
- Documents by category and network
- Recent document activity

## 🧪 Testing

### Run All Tests

```bash
npm run test:all
```

### Test Smart Contracts

```bash
npm test
```

### Test Backend API

```bash
npm run test:backend
```

### Test Frontend

```bash
npm run test:client
```

### Test Coverage

```bash
# Backend test coverage
cd backend
npm run test:coverage
```

## 🚢 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions for:

- **Vercel** (Frontend)
- **Render** (Backend)
- **Railway** (Full Stack)
- **AWS** (Production)
- **Custom VPS** (Self-hosted)

### Quick Deploy with Docker

```bash
# Production build
docker-compose -f docker-compose.yml up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 📚 API Documentation

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete API reference.

### Quick API Reference

#### Upload Document
```http
POST /api/documents/upload
Content-Type: multipart/form-data

file: <file>
uploadedBy: string
category: string (optional)
description: string (optional)
tags: string (optional)
```

#### Verify Document
```http
POST /api/documents/verify
Content-Type: multipart/form-data

file: <file>
OR
fileHash: string (64 hex characters)
```

#### Get All Documents
```http
GET /api/documents?page=1&limit=10&category=legal&verified=true
```

#### Get Document by ID
```http
GET /api/documents/:id
```

#### Get Statistics
```http
GET /api/documents/stats/overview
```

## 🔧 Configuration

### Environment Variables

Key configuration options in `.env`:

```bash
# Blockchain
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545

# Database
MONGODB_URI=mongodb://localhost:27017/document-verification

# Server
PORT=5000
CLIENT_URL=http://localhost:3000

# Frontend
REACT_APP_API_URL=http://localhost:5000
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenZeppelin for smart contract best practices
- Hardhat team for the excellent development environment
- Ethereum community for blockchain infrastructure
- React team for the amazing UI framework

## 📞 Support

For issues and questions:

- **GitHub Issues**: [Create an issue](https://github.com/yourusername/blockchain-doc-verify/issues)
- **Email**: support@example.com
- **Documentation**: [Full documentation](https://docs.example.com)

## 🎯 Roadmap

- [ ] Multi-signature document approval
- [ ] Document revocation functionality
- [ ] IPFS integration for document storage
- [ ] Mobile application (React Native)
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] User authentication with MetaMask
- [ ] Support for multiple blockchain networks
- [ ] Document sharing and permissions
- [ ] Audit trail and versioning

---

**Made with ❤️ using Blockchain Technology**
