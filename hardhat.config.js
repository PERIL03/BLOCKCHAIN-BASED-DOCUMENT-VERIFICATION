require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "";


module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: false,
    },
  },
  
  networks: {
    hardhat: {
      chainId: 31337,
      allowUnlimitedContractSize: false,
      gas: "auto",
      gasPrice: "auto",
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
        passphrase: "",
      },
    },
    
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      timeout: 60000,
    },
    
    sepolia: {
      url: SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/",
      accounts: PRIVATE_KEY !== "0x0000000000000000000000000000000000000000000000000000000000000000" 
        ? [PRIVATE_KEY] 
        : [],
      chainId: 11155111,
      gasPrice: "auto",
      gas: "auto",
      timeout: 60000,
    },
  },

  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: COINMARKETCAP_API_KEY,
    outputFile: process.env.REPORT_GAS_FILE || undefined,
    noColors: process.env.REPORT_GAS_FILE !== undefined,
    showTimeSpent: true,
    showMethodSig: true,
    token: "ETH",
    gasPriceApi: "https://api.etherscan.io/api",
    excludeContracts: [],
  },

  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
    },
  },

  paths: {
    sources: "./contracts",
    tests: "./backend/test",
    cache: "./cache",
    artifacts: "./artifacts",
  },

  mocha: {
    timeout: 40000,
    color: true,
    reporter: "spec",
  },

  warnings: {
    "contracts*": {
      "code-size": true,
      "unused-param": "warn",
      "unused-var": "warn",
    },
  },
};
