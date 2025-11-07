#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   Blockchain Document Verification System Setup${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}\n"

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

print_success "Node.js $(node --version) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_success "npm $(npm --version) detected"

# Check if Docker is installed (optional)
if command -v docker &> /dev/null; then
    print_success "Docker $(docker --version | cut -d' ' -f3 | cut -d',' -f1) detected"
    DOCKER_AVAILABLE=true
else
    print_info "Docker not detected. Skipping Docker setup (optional)."
    DOCKER_AVAILABLE=false
fi

echo ""

# Step 1: Create .env file from .env.example if it doesn't exist
print_info "Step 1: Setting up environment variables..."
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        print_success "Created .env file from .env.example"
        print_info "Please edit .env file with your configuration before continuing"
        read -p "Press Enter when you've configured .env file..."
    else
        print_error ".env.example not found"
        exit 1
    fi
else
    print_success ".env file already exists"
fi

# Step 2: Install root dependencies
print_info "Step 2: Installing root dependencies..."
npm install
if [ $? -eq 0 ]; then
    print_success "Root dependencies installed"
else
    print_error "Failed to install root dependencies"
    exit 1
fi

# Step 3: Install backend dependencies
print_info "Step 3: Installing backend dependencies..."
cd backend
npm install
if [ $? -eq 0 ]; then
    print_success "Backend dependencies installed"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi
cd ..

# Step 4: Install client dependencies
print_info "Step 4: Installing client dependencies..."
cd client
npm install
if [ $? -eq 0 ]; then
    print_success "Client dependencies installed"
else
    print_error "Failed to install client dependencies"
    exit 1
fi
cd ..

# Step 5: Compile smart contracts
print_info "Step 5: Compiling smart contracts..."
npx hardhat compile
if [ $? -eq 0 ]; then
    print_success "Smart contracts compiled successfully"
else
    print_error "Failed to compile smart contracts"
    exit 1
fi

# Step 6: Ask if user wants to deploy to local network
echo ""
read -p "Do you want to start a local Hardhat network and deploy the contract? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Starting local Hardhat network..."
    
    # Start Hardhat node in background
    npx hardhat node > hardhat-node.log 2>&1 &
    HARDHAT_PID=$!
    
    print_info "Waiting for Hardhat network to start (PID: $HARDHAT_PID)..."
    sleep 5
    
    # Deploy contract
    print_info "Deploying contract to local network..."
    npx hardhat run scripts/deploy.js --network localhost
    
    if [ $? -eq 0 ]; then
        print_success "Contract deployed successfully"
        print_info "Hardhat node is running in background (PID: $HARDHAT_PID)"
        print_info "Logs are being written to hardhat-node.log"
        print_info "To stop: kill $HARDHAT_PID"
        echo $HARDHAT_PID > .hardhat-node.pid
    else
        print_error "Contract deployment failed"
        kill $HARDHAT_PID
        exit 1
    fi
fi

# Step 7: Setup database (if using MongoDB with Docker)
if [ "$DOCKER_AVAILABLE" = true ]; then
    echo ""
    read -p "Do you want to start MongoDB using Docker? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Starting MongoDB with Docker..."
        docker-compose up -d mongodb
        if [ $? -eq 0 ]; then
            print_success "MongoDB started successfully"
            print_info "Waiting for MongoDB to be ready..."
            sleep 5
        else
            print_error "Failed to start MongoDB"
        fi
    fi
fi

# Step 8: Seed database (optional)
echo ""
read -p "Do you want to seed the database with sample data? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Seeding database..."
    node scripts/seed-database.js
    if [ $? -eq 0 ]; then
        print_success "Database seeded successfully"
    else
        print_error "Database seeding failed (this is optional)"
    fi
fi

# Final summary
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Setup completed successfully!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Start the backend:  ${GREEN}cd backend && npm start${NC}"
echo -e "  2. Start the frontend: ${GREEN}cd client && npm start${NC}"
echo -e "  3. Run tests:          ${GREEN}npm test${NC}"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo -e "  • View Hardhat logs:   ${GREEN}tail -f hardhat-node.log${NC}"
echo -e "  • Stop Hardhat node:   ${GREEN}kill \$(cat .hardhat-node.pid)${NC}"
echo -e "  • View all services:   ${GREEN}docker-compose ps${NC}"
echo -e "  • Stop all services:   ${GREEN}docker-compose down${NC}"
echo ""
echo -e "${YELLOW}Access the application:${NC}"
echo -e "  • Frontend:  ${GREEN}http://localhost:3000${NC}"
echo -e "  • Backend:   ${GREEN}http://localhost:5000${NC}"
echo -e "  • API Docs:  ${GREEN}http://localhost:5000/api-docs${NC}"
echo ""
