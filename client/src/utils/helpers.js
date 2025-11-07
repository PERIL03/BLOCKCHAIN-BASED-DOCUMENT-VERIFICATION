/**
 * Format a date string to a readable format
 */
export function formatDate(dateString, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };

  return new Date(dateString).toLocaleDateString('en-US', defaultOptions);
}

/**
 * Format a hash to show beginning and end
 */
export function formatHash(hash, startChars = 10, endChars = 10) {
  if (!hash) return '';
  if (hash.length <= startChars + endChars) return hash;
  return `${hash.substring(0, startChars)}...${hash.substring(hash.length - endChars)}`;
}

/**
 * Format file size in bytes to human-readable format
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Truncate text to a maximum length
 */
export function truncateText(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category) {
  const categoryNames = {
    legal: 'Legal',
    academic: 'Academic',
    medical: 'Medical',
    property: 'Property',
    insurance: 'Insurance',
    employment: 'Employment',
    tax: 'Tax',
    identity: 'Identity',
    vehicle: 'Vehicle',
    education: 'Education',
    other: 'Other',
  };
  
  return categoryNames[category] || category;
}

/**
 * Get network display name
 */
export function getNetworkDisplayName(network) {
  const networkNames = {
    localhost: 'Local Network',
    sepolia: 'Sepolia Testnet',
    mainnet: 'Ethereum Mainnet',
    goerli: 'Goerli Testnet',
    polygon: 'Polygon',
    mumbai: 'Mumbai Testnet',
  };
  
  return networkNames[network] || network;
}

/**
 * Calculate time ago
 */
export function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
    }
  }

  return 'just now';
}

/**
 * Download data as JSON file
 */
export function downloadJSON(data, filename = 'data.json') {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parse error message
 */
export function parseErrorMessage(error) {
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  if (error.error) return error.error;
  return 'An unexpected error occurred';
}
