const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

let contractConfig;
let contractABI;
let provider;
let signer;
let contract;

/**
 * Initialize blockchain connection
 */
async function initializeBlockchain() {
  try {
    const configPath = path.join(__dirname, "../config/contract.json");
    if (!fs.existsSync(configPath)) {
      console.warn("⚠️  Contract configuration not found. Please deploy the contract first.");
      console.warn("   Run: npm run deploy");
      throw new Error("Contract configuration not found. Please deploy the contract first.");
    }
    
    contractConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));

    const abiPath = path.join(__dirname, "../config/DocumentRegistry.json");
    if (!fs.existsSync(abiPath)) {
      console.warn("⚠️  Contract ABI not found. Please deploy the contract first.");
      console.warn("   Run: npm run deploy");
      throw new Error("Contract ABI not found. Please deploy the contract first.");
    }
    
    const abiData = JSON.parse(fs.readFileSync(abiPath, "utf8"));
    contractABI = abiData.abi;

    const networkUrl = process.env.BLOCKCHAIN_RPC_URL || "http:
    provider = new ethers.JsonRpcProvider(networkUrl);

    try {
      await provider.getBlockNumber();
    } catch (error) {
      console.warn("⚠️  Cannot connect to blockchain network at:", networkUrl);
      console.warn("   Make sure the blockchain node is running.");
      console.warn("   For local development, run: npm run node");
      throw new Error(`Cannot connect to blockchain network: ${error.message}`);
    }

    const privateKey = process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    signer = new ethers.Wallet(privateKey, provider);

    const network = await provider.getNetwork();
    const chainId = network.chainId.toString();
    
    const networkConfig = contractConfig.networks[chainId];
    if (!networkConfig) {
      console.warn(`⚠️  No contract deployed on network ${chainId}`);
      console.warn("   Available networks:", Object.keys(contractConfig.networks).join(", "));
      throw new Error(`No contract deployed on network ${chainId}`);
    }

    contract = new ethers.Contract(networkConfig.contractAddress, contractABI, signer);

    console.log(`✅ Blockchain initialized on network ${chainId}`);
    console.log(`📝 Contract address: ${networkConfig.contractAddress}`);

    return true;
  } catch (error) {
    console.error("❌ Failed to initialize blockchain:", error.message);
    throw error;
  }
}

/**
 * Register a document on the blockchain
 * @param {string} fileHash - SHA-256 hash of the file
 * @param {string} metadata - JSON string with document metadata
 * @returns {Promise<Object>} Transaction result with blockchain hash
 */
async function registerDocumentOnBlockchain(fileHash, metadata) {
  try {
    if (!contract) {
      await initializeBlockchain();
    }

    const documentHash = "0x" + fileHash;

    if (documentHash.length !== 66) {
      throw new Error("Invalid file hash length. Must be 64 hex characters.");
    }

    let truncatedMetadata = metadata;
    if (metadata.length > 256) {
      truncatedMetadata = metadata.substring(0, 253) + "...";
    }

    const exists = await contract.documentExistsView(documentHash);
    if (exists) {
      throw new Error("Document already registered on blockchain");
    }

    console.log(`📝 Registering document on blockchain: ${documentHash.substring(0, 10)}...`);
    const tx = await contract.registerDocument(documentHash, truncatedMetadata);

    console.log(`⏳ Waiting for transaction confirmation: ${tx.hash}`);
    const receipt = await tx.wait();

    console.log(`✅ Document registered in block ${receipt.blockNumber}`);

    const network = await provider.getNetwork();

    return {
      success: true,
      documentHash: documentHash,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      network: network.chainId.toString(),
    };
  } catch (error) {
    console.error("❌ Error registering document on blockchain:", error.message);
    
    if (error.message.includes("DocumentAlreadyExists")) {
      throw new Error("Document already exists on blockchain");
    } else if (error.message.includes("InvalidDocumentHash")) {
      throw new Error("Invalid document hash format");
    } else if (error.message.includes("MetadataTooLong")) {
      throw new Error("Metadata exceeds maximum length");
    }
    
    throw error;
  }
}

/**
 * Verify a document on the blockchain
 * @param {string} blockchainHash - The blockchain hash (0x prefixed)
 * @returns {Promise<Object>} Verification result
 */
async function verifyDocumentOnBlockchain(blockchainHash) {
  try {
    if (!contract) {
      await initializeBlockchain();
    }

    if (!blockchainHash.startsWith("0x") || blockchainHash.length !== 66) {
      throw new Error("Invalid blockchain hash format");
    }

    console.log(`🔍 Verifying document on blockchain: ${blockchainHash.substring(0, 10)}...`);

    const tx = await contract.verifyDocument(blockchainHash);
    const receipt = await tx.wait();

    let documentDetails = null;
    if (tx) {
      try {
        const doc = await contract.getDocument(blockchainHash);
        documentDetails = {
          documentHash: doc[0],
          owner: doc[1],
          timestamp: Number(doc[2]),
          metadata: doc[3],
          exists: doc[4],
        };
      } catch (error) {
        console.log("Document not found on blockchain");
      }
    }

    return {
      success: true,
      exists: tx !== null && documentDetails !== null,
      transactionHash: receipt?.hash,
      document: documentDetails,
    };
  } catch (error) {
    console.error("❌ Error verifying document on blockchain:", error.message);
    
    if (error.message.includes("DocumentNotFound")) {
      return {
        success: true,
        exists: false,
        document: null,
      };
    }
    
    throw error;
  }
}

/**
 * Get document details from blockchain
 * @param {string} blockchainHash - The blockchain hash
 * @returns {Promise<Object>} Document details
 */
async function getDocumentFromBlockchain(blockchainHash) {
  try {
    if (!contract) {
      await initializeBlockchain();
    }

    console.log(`📄 Fetching document from blockchain: ${blockchainHash.substring(0, 10)}...`);

    const doc = await contract.getDocument(blockchainHash);

    return {
      success: true,
      document: {
        documentHash: doc[0],
        owner: doc[1],
        timestamp: Number(doc[2]),
        timestampDate: new Date(Number(doc[2]) * 1000).toISOString(),
        metadata: doc[3],
        exists: doc[4],
      },
    };
  } catch (error) {
    console.error("❌ Error fetching document from blockchain:", error.message);
    
    if (error.message.includes("DocumentNotFound")) {
      return {
        success: false,
        error: "Document not found on blockchain",
      };
    }
    
    throw error;
  }
}

/**
 * Get all documents from blockchain (paginated)
 * @param {number} offset - Starting index
 * @param {number} limit - Number of documents to fetch
 * @returns {Promise<Object>} List of document hashes
 */
async function getAllDocumentsFromBlockchain(offset = 0, limit = 10) {
  try {
    if (!contract) {
      await initializeBlockchain();
    }

    const totalDocuments = await contract.getTotalDocuments();
    const documentHashes = await contract.getAllDocuments(offset, limit);

    return {
      success: true,
      totalDocuments: Number(totalDocuments),
      documents: documentHashes,
      offset: offset,
      limit: limit,
    };
  } catch (error) {
    console.error("❌ Error fetching documents from blockchain:", error.message);
    throw error;
  }
}

/**
 * Get blockchain statistics
 * @returns {Promise<Object>} Blockchain statistics
 */
async function getBlockchainStats() {
  try {
    if (!contract) {
      await initializeBlockchain();
    }

    const totalDocuments = await contract.getTotalDocuments();
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();

    return {
      success: true,
      totalDocuments: Number(totalDocuments),
      network: {
        chainId: network.chainId.toString(),
        name: network.name,
      },
      blockNumber: blockNumber,
      contractAddress: await contract.getAddress(),
    };
  } catch (error) {
    console.error("❌ Error fetching blockchain stats:", error.message);
    throw error;
  }
}

/**
 * Get documents by owner address
 * @param {string} ownerAddress - Ethereum address
 * @returns {Promise<Object>} List of document hashes owned by the address
 */
async function getDocumentsByOwner(ownerAddress) {
  try {
    if (!contract) {
      await initializeBlockchain();
    }

    const documentHashes = await contract.getDocumentsByOwner(ownerAddress);
    const count = await contract.getOwnerDocumentCount(ownerAddress);

    return {
      success: true,
      owner: ownerAddress,
      count: Number(count),
      documents: documentHashes,
    };
  } catch (error) {
    console.error("❌ Error fetching documents by owner:", error.message);
    throw error;
  }
}

module.exports = {
  initializeBlockchain,
  registerDocumentOnBlockchain,
  verifyDocumentOnBlockchain,
  getDocumentFromBlockchain,
  getAllDocumentsFromBlockchain,
  getBlockchainStats,
  getDocumentsByOwner,
};
