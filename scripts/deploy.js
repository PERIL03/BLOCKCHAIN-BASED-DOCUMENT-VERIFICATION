const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Main deployment function for DocumentRegistry contract
 * Deploys the contract, saves the deployment info, and provides verification instructions
 */
async function main() {
  console.log("\n🚀 Starting DocumentRegistry deployment...\n");

  try {
    const network = await hre.ethers.provider.getNetwork();
    const networkName = network.name === "unknown" ? "localhost" : network.name;
    const chainId = network.chainId;

    console.log(`📡 Network: ${networkName} (Chain ID: ${chainId})`);

    const [deployer] = await hre.ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    const balance = await hre.ethers.provider.getBalance(deployerAddress);

    console.log(`👤 Deployer address: ${deployerAddress}`);
    console.log(`💰 Deployer balance: ${hre.ethers.formatEther(balance)} ETH\n`);

    if (balance === 0n) {
      throw new Error("Deployer account has no balance. Please fund the account before deploying.");
    }

    console.log("📝 Compiling contracts...");
    const DocumentRegistry = await hre.ethers.getContractFactory("DocumentRegistry");

    console.log("⏳ Deploying DocumentRegistry contract...");
    const documentRegistry = await DocumentRegistry.deploy();

    await documentRegistry.waitForDeployment();
    const contractAddress = await documentRegistry.getAddress();

    console.log(`✅ DocumentRegistry deployed to: ${contractAddress}\n`);

    const deploymentTx = documentRegistry.deploymentTransaction();
    let receipt = null;
    
    if (deploymentTx) {
      console.log(`📊 Deployment Transaction Hash: ${deploymentTx.hash}`);
      
      receipt = await deploymentTx.wait();
      
      if (receipt) {
        console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
        console.log(`💵 Gas price: ${hre.ethers.formatUnits(receipt.gasPrice || 0n, "gwei")} gwei`);
        console.log(`💸 Total cost: ${hre.ethers.formatEther((receipt.gasUsed * (receipt.gasPrice || 0n)))} ETH`);
        console.log(`📦 Block number: ${receipt.blockNumber}\n`);
      }
    }

    console.log("🔍 Verifying deployment...");
    const totalDocuments = await documentRegistry.getTotalDocuments();
    console.log(`✅ Contract verification successful! Total documents: ${totalDocuments}\n`);

    const deploymentInfo = {
      network: networkName,
      chainId: chainId.toString(),
      contractAddress: contractAddress,
      deployerAddress: deployerAddress,
      deploymentTimestamp: new Date().toISOString(),
      blockNumber: receipt ? receipt.blockNumber : null,
      transactionHash: deploymentTx ? deploymentTx.hash : null,
      contractName: "DocumentRegistry",
      solcVersion: "0.8.20",
    };

    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentFileName = `${networkName}-${chainId}.json`;
    const deploymentFilePath = path.join(deploymentsDir, deploymentFileName);

    fs.writeFileSync(
      deploymentFilePath,
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log(`💾 Deployment info saved to: ${deploymentFilePath}\n`);

    const latestDeploymentPath = path.join(deploymentsDir, "latest.json");
    fs.writeFileSync(
      latestDeploymentPath,
      JSON.stringify(deploymentInfo, null, 2)
    );

    const backendConfigDir = path.join(__dirname, "..", "backend", "config");
    if (!fs.existsSync(backendConfigDir)) {
      fs.mkdirSync(backendConfigDir, { recursive: true });
    }

    const contractConfig = {
      networks: {
        [chainId.toString()]: {
          contractAddress: contractAddress,
          deploymentBlock: receipt ? receipt.blockNumber : null,
        },
      },
      defaultNetwork: chainId.toString(),
      contractABI: "DocumentRegistry",
    };

    fs.writeFileSync(
      path.join(backendConfigDir, "contract.json"),
      JSON.stringify(contractConfig, null, 2)
    );

    console.log("📄 Contract config saved for backend\n");

    const artifactsPath = path.join(__dirname, "..", "artifacts", "contracts", "DocumentRegistry.sol", "DocumentRegistry.json");
    if (fs.existsSync(artifactsPath)) {
      const artifact = JSON.parse(fs.readFileSync(artifactsPath, "utf8"));
      const abiPath = path.join(backendConfigDir, "DocumentRegistry.json");
      fs.writeFileSync(abiPath, JSON.stringify({ abi: artifact.abi }, null, 2));
      console.log("📋 Contract ABI copied to backend\n");
    }

    console.log("═══════════════════════════════════════════════════════");
    console.log("🎉 DEPLOYMENT SUCCESSFUL!");
    console.log("═══════════════════════════════════════════════════════");
    console.log(`Contract Address: ${contractAddress}`);
    console.log(`Network: ${networkName} (${chainId})`);
    console.log(`Deployer: ${deployerAddress}`);
    console.log("═══════════════════════════════════════════════════════\n");

    if (networkName === "sepolia" && process.env.ETHERSCAN_API_KEY) {
      console.log("📝 To verify the contract on Etherscan, run:");
      console.log(`npx hardhat verify --network ${networkName} ${contractAddress}\n`);
    }

    console.log("📚 Next Steps:");
    console.log("1. Update your .env file with the contract address");
    console.log("2. Start the backend server: cd backend && npm start");
    console.log("3. Start the frontend: cd client && npm start");
    console.log("4. Test the contract: npm test\n");

    return deploymentInfo;

  } catch (error) {
    console.error("\n❌ Deployment failed!");
    console.error("Error:", error.message);
    
    if (error.message.includes("insufficient funds")) {
      console.error("\n💡 Tip: Make sure your deployer account has enough ETH for gas fees.");
    } else if (error.message.includes("network")) {
      console.error("\n💡 Tip: Check your network configuration and RPC URL.");
    }
    
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Unhandled error during deployment:");
    console.error(error);
    process.exit(1);
  });
