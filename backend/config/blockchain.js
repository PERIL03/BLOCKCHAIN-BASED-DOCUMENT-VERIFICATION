const fs = require('fs');
const path = require('path');

// Load contract configuration dynamically
function loadContractConfig() {
  const configPath = path.join(__dirname, 'contract.json');
  
  if (!fs.existsSync(configPath)) {
    console.warn('⚠️  Contract configuration not found. Using default.');
    return {
      networks: {
        "31337": {
          contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
          deploymentBlock: 1
        }
      },
      defaultNetwork: "31337",
      contractABI: "DocumentRegistry"
    };
  }
  
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

module.exports = loadContractConfig();
