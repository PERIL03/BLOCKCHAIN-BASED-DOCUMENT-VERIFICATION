import React, { useState, useEffect } from 'react';
import { getDocuments } from '../utils/api';

function DocumentRegistry() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    verified: '',
    uploadedBy: '',
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    loadDocuments();
  }, [filters]);

  const loadDocuments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getDocuments(filters);
      setDocuments(response.documents);
      setPagination(response.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatHash = (hash) => {
    if (!hash) return '';
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 6)}`;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="card">
      <h2>📋 Document Registry</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Browse all registered documents in the blockchain registry.
      </p>

      {}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f8f9ff', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>🔍 Filters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="category-filter">Category</label>
            <select
              id="category-filter"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="legal">Legal</option>
              <option value="academic">Academic</option>
              <option value="medical">Medical</option>
              <option value="property">Property</option>
              <option value="insurance">Insurance</option>
              <option value="employment">Employment</option>
              <option value="tax">Tax</option>
              <option value="identity">Identity</option>
              <option value="vehicle">Vehicle</option>
              <option value="education">Education</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="verified-filter">Verification Status</label>
            <select
              id="verified-filter"
              value={filters.verified}
              onChange={(e) => handleFilterChange('verified', e.target.value)}
            >
              <option value="">All</option>
              <option value="true">Verified</option>
              <option value="false">Not Verified</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="uploader-filter">Uploader</label>
            <input
              id="uploader-filter"
              type="text"
              value={filters.uploadedBy}
              onChange={(e) => handleFilterChange('uploadedBy', e.target.value)}
              placeholder="Search by uploader..."
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="limit-filter">Items per page</label>
            <select
              id="limit-filter"
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => setFilters({ category: '', verified: '', uploadedBy: '', page: 1, limit: 10 })}
          style={{ marginTop: '1rem' }}
        >
          🔄 Reset Filters
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {isLoading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : documents.length === 0 ? (
        <div className="alert alert-info">
          <p>No documents found matching your criteria.</p>
          {(filters.category || filters.verified || filters.uploadedBy) && (
            <p style={{ marginTop: '0.5rem' }}>Try adjusting your filters.</p>
          )}
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Category</th>
                  <th>Uploaded By</th>
                  <th>File Hash</th>
                  <th>Size</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc._id}>
                    <td>
                      <div style={{ maxWidth: '200px' }} className="truncate">
                        📄 {doc.fileName}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-success">
                        {doc.metadata?.category || 'other'}
                      </span>
                    </td>
                    <td>
                      <div style={{ maxWidth: '150px' }} className="truncate">
                        {doc.uploadedBy}
                      </div>
                    </td>
                    <td>
                      <code
                        style={{ cursor: 'pointer', fontSize: '0.85rem' }}
                        onClick={() => copyToClipboard(doc.fileHash)}
                        title="Click to copy full hash"
                      >
                        {formatHash(doc.fileHash)}
                      </code>
                    </td>
                    <td>{formatFileSize(doc.fileSize)}</td>
                    <td>
                      {doc.verified ? (
                        <span className="badge badge-success">✓ Verified</span>
                      ) : (
                        <span className="badge badge-warning">⏳ Pending</span>
                      )}
                    </td>
                    <td>{formatDate(doc.createdAt)}</td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                        onClick={() => {
                          const details = `
Document Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
File Name: ${doc.fileName}
File Hash: ${doc.fileHash}
Blockchain Hash: ${doc.blockchainHash}
Transaction: ${doc.transactionHash}
Block Number: ${doc.blockNumber}
Network: ${doc.blockchainNetwork}
Uploaded By: ${doc.uploadedBy}
Category: ${doc.metadata?.category || 'N/A'}
Description: ${doc.metadata?.description || 'N/A'}
Size: ${formatFileSize(doc.fileSize)}
Type: ${doc.fileType}
Registered: ${formatDate(doc.createdAt)}
Verifications: ${doc.verificationCount || 0}
Status: ${doc.verified ? 'Verified' : 'Pending'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                          `.trim();
                          alert(details);
                        }}
                      >
                        👁️ View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {}
          {pagination && pagination.totalPages > 1 && (
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ color: '#666' }}>
                Showing {((pagination.currentPage - 1) * filters.limit) + 1} to{' '}
                {Math.min(pagination.currentPage * filters.limit, pagination.totalDocuments)} of{' '}
                {pagination.totalDocuments} documents
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  style={{ padding: '0.5rem 1rem' }}
                >
                  ← Previous
                </button>

                <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                  {[...Array(Math.min(pagination.totalPages, 5))].map((_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        className={`btn ${pagination.currentPage === pageNum ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => handlePageChange(pageNum)}
                        style={{ padding: '0.5rem 1rem', minWidth: '40px' }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  className="btn btn-secondary"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  style={{ padding: '0.5rem 1rem' }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default DocumentRegistry;
