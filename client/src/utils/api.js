const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Generic API request handler
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.details || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Upload a document to the blockchain
 */
export async function uploadDocument({ file, uploadedBy, description, category, tags }) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('uploadedBy', uploadedBy);
  
  if (description) {
    formData.append('description', description);
  }
  
  if (category) {
    formData.append('category', category);
  }
  
  if (tags) {
    formData.append('tags', tags);
  }

  return apiRequest('/api/documents/upload', {
    method: 'POST',
    body: formData,
  });
}

/**
 * Verify a document
 */
export async function verifyDocument({ file, fileHash }) {
  const formData = new FormData();
  
  if (file) {
    formData.append('file', file);
  }
  
  if (fileHash) {
    formData.append('fileHash', fileHash);
  }

  return apiRequest('/api/documents/verify', {
    method: 'POST',
    body: formData,
  });
}

/**
 * Get all documents with filters and pagination
 */
export async function getDocuments(filters = {}) {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      params.append(key, value);
    }
  });

  const queryString = params.toString();
  const endpoint = `/api/documents${queryString ? `?${queryString}` : ''}`;

  return apiRequest(endpoint);
}

/**
 * Get a single document by ID
 */
export async function getDocumentById(id) {
  return apiRequest(`/api/documents/${id}`);
}

/**
 * Get a document by hash
 */
export async function getDocumentByHash(hash) {
  return apiRequest(`/api/documents/hash/${hash}`);
}

/**
 * Get statistics
 */
export async function getStatistics() {
  return apiRequest('/api/documents/stats/overview');
}

/**
 * Check API health
 */
export async function checkHealth() {
  return apiRequest('/health');
}

/**
 * Get API information
 */
export async function getApiInfo() {
  return apiRequest('/api');
}
