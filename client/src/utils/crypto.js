/**
 * Calculate SHA-256 hash of a file
 * @param {File} file - The file to hash
 * @returns {Promise<string>} - Hex string of the hash
 */
export async function calculateFileHash(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target.result;
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        resolve(hashHex);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Verify that two hashes match
 * @param {string} hash1 - First hash
 * @param {string} hash2 - Second hash
 * @returns {boolean} - True if hashes match
 */
export function compareHashes(hash1, hash2) {
  return hash1.toLowerCase() === hash2.toLowerCase();
}

/**
 * Validate hash format (64 hexadecimal characters)
 * @param {string} hash - Hash to validate
 * @returns {boolean} - True if valid
 */
export function isValidHash(hash) {
  return /^[a-f0-9]{64}$/i.test(hash);
}

/**
 * Generate a mock blockchain hash (for demo purposes)
 * @param {string} fileHash - File hash
 * @returns {string} - Mock blockchain hash with 0x prefix
 */
export function generateBlockchainHash(fileHash) {
  return '0x' + fileHash;
}
