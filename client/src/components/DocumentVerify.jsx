import React, { useState } from 'react';
import { calculateFileHash } from '../utils/crypto';
import { verifyDocument } from '../utils/api';

function DocumentVerify({ onDocumentVerified }) {
  const [file, setFile] = useState(null);
  const [fileHash, setFileHash] = useState('');
  const [verifyMethod, setVerifyMethod] = useState('file');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    if (verifyMethod === 'file' && !file) {
      setError('Please select a file to verify');
      return;
    }

    if (verifyMethod === 'hash' && !fileHash) {
      setError('Please enter a file hash to verify');
      return;
    }

    if (verifyMethod === 'hash' && !/^[a-f0-9]{64}$/i.test(fileHash)) {
      setError('Invalid hash format. Must be 64 hexadecimal characters');
      return;
    }

    setIsVerifying(true);
    setError(null);
    setResult(null);

    try {
      let verificationData;

      if (verifyMethod === 'file') {
        const calculatedHash = await calculateFileHash(file);
        verificationData = await verifyDocument({ file });
        verificationData.calculatedHash = calculatedHash;
      } else {
        verificationData = await verifyDocument({ fileHash: fileHash.toLowerCase() });
      }

      setResult(verificationData);

      if (onDocumentVerified && verificationData.verified) {
        onDocumentVerified(verificationData.document);
      }
    } catch (err) {
      setError(err.message || 'Verification failed');
      setResult({ verified: false, message: err.message });
    } finally {
      setIsVerifying(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatHash = (hash) => {
    if (!hash) return '';
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 10)}`;
  };

  return (
    <div className="card">
      <h2>✅ Verify Document</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Verify if a document exists in the blockchain registry by uploading the file or providing its hash.
      </p>

      {error && !result && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <button
            className={`btn ${verifyMethod === 'file' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              setVerifyMethod('file');
              setFileHash('');
              setResult(null);
              setError(null);
            }}
            disabled={isVerifying}
          >
            📄 Verify by File
          </button>
          <button
            className={`btn ${verifyMethod === 'hash' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              setVerifyMethod('hash');
              setFile(null);
              setResult(null);
              setError(null);
            }}
            disabled={isVerifying}
          >
            #️⃣ Verify by Hash
          </button>
        </div>
      </div>

      <form onSubmit={handleVerify}>
        {verifyMethod === 'file' ? (
          <div
            className="file-upload"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById('verify-file-input').click()}
          >
            <input
              id="verify-file-input"
              type="file"
              onChange={handleFileChange}
              disabled={isVerifying}
            />
            {file ? (
              <div className="file-info">
                <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</p>
                <p><strong>{file.name}</strong></p>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                  {(file.size / 1024).toFixed(2)} KB | {file.type || 'Unknown type'}
                </p>
                <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#667eea' }}>
                  Click to change file
                </p>
              </div>
            ) : (
              <>
                <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</p>
                <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  <strong>Click to upload</strong> or drag and drop
                </p>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                  Upload the document you want to verify
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="form-group">
            <label htmlFor="fileHash">File Hash (SHA-256)</label>
            <input
              id="fileHash"
              type="text"
              value={fileHash}
              onChange={(e) => setFileHash(e.target.value)}
              placeholder="Enter 64-character hexadecimal hash..."
              pattern="[a-fA-F0-9]{64}"
              disabled={isVerifying}
              style={{ fontFamily: 'monospace' }}
            />
            <small style={{ color: '#666' }}>
              Enter the SHA-256 hash of the document (64 hexadecimal characters)
            </small>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isVerifying || (verifyMethod === 'file' && !file) || (verifyMethod === 'hash' && !fileHash)}
          style={{ marginTop: '1rem' }}
        >
          {isVerifying ? (
            <>
              <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
              Verifying...
            </>
          ) : (
            <>
              🔍 Verify Document
            </>
          )}
        </button>
      </form>

      {result && (
        <div className={`alert ${result.verified ? 'alert-success' : 'alert-error'}`} style={{ marginTop: '2rem' }}>
          {result.verified ? (
            <>
              <h3 style={{ color: '#155724', marginBottom: '1rem' }}>
                ✅ Document Verified Successfully!
              </h3>
              <div style={{ fontSize: '0.95rem' }}>
                <p><strong>Status:</strong> <span style={{ color: '#28a745', fontWeight: 'bold' }}>VERIFIED ✓</span></p>
                <p><strong>File Name:</strong> {result.document.fileName}</p>
                <p><strong>File Hash:</strong> <code>{formatHash(result.document.fileHash)}</code></p>
                {result.calculatedHash && (
                  <p><strong>Calculated Hash:</strong> <code>{formatHash(result.calculatedHash)}</code></p>
                )}
                <p><strong>Blockchain Hash:</strong> <code>{formatHash(result.document.blockchainHash)}</code></p>
                <p><strong>Uploaded By:</strong> {result.document.uploadedBy}</p>
                <p><strong>Registered On:</strong> {formatDate(result.document.registeredAt)}</p>
                <p><strong>Network:</strong> {result.document.network}</p>
                <p><strong>Block Number:</strong> {result.document.blockNumber}</p>
                <p><strong>Transaction:</strong> <code>{formatHash(result.document.transactionHash)}</code></p>
                <p><strong>Verification Count:</strong> {result.document.verificationCount}</p>
                {result.document.lastVerifiedAt && (
                  <p><strong>Last Verified:</strong> {formatDate(result.document.lastVerifiedAt)}</p>
                )}
                {result.document.metadata && (
                  <>
                    <p><strong>Category:</strong> {result.document.metadata.category}</p>
                    {result.document.metadata.description && (
                      <p><strong>Description:</strong> {result.document.metadata.description}</p>
                    )}
                  </>
                )}
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#d4edda', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>🔒 Blockchain Verification</p>
                  <p style={{ fontSize: '0.9rem' }}>
                    This document's authenticity has been verified against the blockchain.
                    The document was registered on block {result.document.blockNumber} and has been
                    verified {result.document.verificationCount} time{result.document.verificationCount !== 1 ? 's' : ''}.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <h3 style={{ color: '#721c24', marginBottom: '1rem' }}>
                ❌ Document Not Found
              </h3>
              <div style={{ fontSize: '0.95rem' }}>
                <p><strong>Status:</strong> <span style={{ color: '#dc3545', fontWeight: 'bold' }}>NOT VERIFIED ✗</span></p>
                <p style={{ marginTop: '1rem' }}>
                  This document is not registered in the blockchain. The document hash was not found in our registry.
                </p>
                {verifyMethod === 'file' && result.calculatedHash && (
                  <p><strong>Calculated Hash:</strong> <code>{formatHash(result.calculatedHash)}</code></p>
                )}
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8d7da', borderRadius: '8px', border: '1px solid #f5c6cb' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>⚠️ What this means:</p>
                  <ul style={{ marginLeft: '1.5rem', fontSize: '0.9rem' }}>
                    <li>The document has not been registered on the blockchain</li>
                    <li>The document may have been modified since registration</li>
                    <li>You may need to upload this document first</li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {isVerifying && (
        <div className="alert alert-info" style={{ marginTop: '1rem' }}>
          <p><strong>Verifying document...</strong></p>
          <p style={{ fontSize: '0.9rem' }}>
            1. {verifyMethod === 'file' ? 'Calculating file hash...' : 'Using provided hash...'}<br />
            2. Checking database...<br />
            3. Verifying on blockchain...<br />
            Please wait...
          </p>
        </div>
      )}
    </div>
  );
}

export default DocumentVerify;
