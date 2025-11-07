import React from 'react';

function Dashboard({ stats, isLoading, onRefresh }) {
  if (isLoading) {
    return (
      <div className="card">
        <h2>📊 Dashboard</h2>
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="card">
        <h2>📊 Dashboard</h2>
        <div className="alert alert-error">
          <p>Failed to load statistics. Please try again.</p>
          <button className="btn btn-secondary mt-2" onClick={onRefresh}>
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

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
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
  };

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>📊 Dashboard</h2>
          <button className="btn btn-secondary" onClick={onRefresh}>
            🔄 Refresh
          </button>
        </div>

        {}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Documents</h3>
            <div className="stat-value">{stats.totalDocuments || 0}</div>
            <p style={{ marginTop: '0.5rem', opacity: 0.9, fontSize: '0.9rem' }}>
              Registered on blockchain
            </p>
          </div>

          <div className="stat-card">
            <h3>Verified Documents</h3>
            <div className="stat-value">{stats.verifiedDocuments || 0}</div>
            <p style={{ marginTop: '0.5rem', opacity: 0.9, fontSize: '0.9rem' }}>
              {stats.totalDocuments > 0 
                ? `${Math.round((stats.verifiedDocuments / stats.totalDocuments) * 100)}% of total`
                : 'No documents yet'
              }
            </p>
          </div>

          <div className="stat-card">
            <h3>Total Verifications</h3>
            <div className="stat-value">{stats.totalVerifications || 0}</div>
            <p style={{ marginTop: '0.5rem', opacity: 0.9, fontSize: '0.9rem' }}>
              Document checks performed
            </p>
          </div>

          <div className="stat-card">
            <h3>Networks</h3>
            <div className="stat-value">{stats.byNetwork?.length || 0}</div>
            <p style={{ marginTop: '0.5rem', opacity: 0.9, fontSize: '0.9rem' }}>
              Blockchain networks used
            </p>
          </div>
        </div>
      </div>

      {}
      <div className="card">
        <h3>📂 Documents by Category</h3>
        {stats.byCategory && stats.byCategory.length > 0 ? (
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              {stats.byCategory.map((cat) => (
                <div
                  key={cat._id}
                  style={{
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '8px',
                    color: 'white',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {getCategoryIcon(cat._id)}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{cat.count}</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '0.25rem', textTransform: 'capitalize' }}>
                    {cat._id}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p style={{ color: '#666', marginTop: '1rem' }}>No documents registered yet.</p>
        )}
      </div>

      {}
      {stats.byNetwork && stats.byNetwork.length > 0 && (
        <div className="card">
          <h3>🌐 Documents by Network</h3>
          <div style={{ marginTop: '1.5rem' }}>
            {stats.byNetwork.map((network) => (
              <div
                key={network._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  background: '#f8f9ff',
                  borderRadius: '8px',
                  marginBottom: '0.5rem',
                }}
              >
                <div>
                  <strong style={{ color: '#667eea' }}>{network._id}</strong>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{network.count} documents</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {}
      {stats.byStatus && stats.byStatus.length > 0 && (
        <div className="card">
          <h3>📈 Documents by Status</h3>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {stats.byStatus.map((status) => (
              <div
                key={status._id}
                style={{
                  flex: '1 1 200px',
                  padding: '1.5rem',
                  background: getStatusColor(status._id),
                  borderRadius: '8px',
                  color: 'white',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                  {getStatusIcon(status._id)}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{status.count}</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '0.25rem', textTransform: 'capitalize' }}>
                  {status._id}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {}
      {stats.recentDocuments && stats.recentDocuments.length > 0 && (
        <div className="card">
          <h3>🕒 Recent Documents</h3>
          <div style={{ marginTop: '1.5rem', overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>File Hash</th>
                  <th>Uploaded By</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentDocuments.map((doc) => (
                  <tr key={doc._id}>
                    <td>
                      <div style={{ maxWidth: '200px' }} className="truncate">
                        📄 {doc.fileName}
                      </div>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.85rem' }}>{formatHash(doc.fileHash)}</code>
                    </td>
                    <td>
                      <div style={{ maxWidth: '150px' }} className="truncate">
                        {doc.uploadedBy}
                      </div>
                    </td>
                    <td>
                      {doc.verified ? (
                        <span className="badge badge-success">✓ Verified</span>
                      ) : (
                        <span className="badge badge-warning">⏳ Pending</span>
                      )}
                    </td>
                    <td>{formatDate(doc.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {}
      <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <h3 style={{ color: 'white' }}>ℹ️ System Information</h3>
        <div style={{ marginTop: '1rem', opacity: 0.9 }}>
          <p>🔗 Blockchain-powered document verification system</p>
          <p>🔐 Immutable and transparent document registry</p>
          <p>✅ Cryptographic proof of document existence</p>
          <p>⚡ Fast and efficient verification</p>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
            All documents are hashed using SHA-256 and stored on the blockchain,
            ensuring tamper-proof verification and permanent record keeping.
          </p>
        </div>
      </div>
    </div>
  );
}

function getCategoryIcon(category) {
  const icons = {
    legal: '⚖️',
    academic: '🎓',
    medical: '🏥',
    property: '🏠',
    insurance: '🛡️',
    employment: '💼',
    tax: '💰',
    identity: '🪪',
    vehicle: '🚗',
    education: '📚',
    other: '📄',
  };
  return icons[category] || '📄';
}

function getStatusColor(status) {
  const colors = {
    confirmed: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
    pending: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
    failed: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
  };
  return colors[status] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
}

function getStatusIcon(status) {
  const icons = {
    confirmed: '✅',
    pending: '⏳',
    failed: '❌',
  };
  return icons[status] || '📄';
}

export default Dashboard;
