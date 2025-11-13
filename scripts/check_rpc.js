require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');

(async () => {
  try {
    const url = process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545';
    console.log('Using RPC URL:', url);
    const provider = new ethers.JsonRpcProvider(url);
    const block = await provider.getBlockNumber();
    console.log('Block number:', block);
    const network = await provider.getNetwork();
    console.log('Network:', network);
    process.exit(0);
  } catch (err) {
    console.error('RPC check failed:', err.message);
    process.exit(1);
  }
})();
