import React, { useState } from 'react';
import { calculateFileHash } from '../utils/crypto';
import { uploadDocument } from '../utils/api';

const CATEGORIES = [
  'legal', 'academic', 'medical', 'property', 'insurance',
  'employment', 'tax', 'identity', 'vehicle', 'education', 'other'
];

function DocumentUpload({ onDocumentUploaded }) {
  const [file, setFile] = useState(null);
  const [uploadedBy, setUploadedBy] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [tags, setTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size exceeds 10MB limit');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.size > 10 * 1024 * 1024) {
        setError('File size exceeds 10MB limit');
        return;
      }
      setFile(droppedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    if (!uploadedBy || uploadedBy.trim().length < 3) {
      setError('Please enter your name or email (at least 3 characters)');
      return;
    }

    setIsUploading(true);
    setError(null);
    setResult(null);

    try {
      const fileHash = await calculateFileHash(file);

      const response = await uploadDocument({
        file,
        uploadedBy: uploadedBy.trim(),
        description: description.trim(),
        category,
        tags: tags.trim()
      });

      setResult({
        ...response.document,
        localFileHash: fileHash
      });

      if (onDocumentUploaded) {
        onDocumentUploaded(response.document);
      }

      setFile(null);
      setDescription('');
      setTags('');
    } catch (err) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatHash = (hash) => {
    if (!hash) return '';
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 10)}`;
  };

  return (
    <div className="card">
      <h2>📤 Upload Document</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Upload a document to register it on the blockchain. This creates an immutable proof of existence.
      </p>

      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="alert alert-success">
          <h3 style={{ color: '#155724', marginBottom: '1rem' }}>✅ Document Successfully Registered!</h3>
          <div style={{ fontSize: '0.95rem' }}>
            <p><strong>File Name:</strong> {result.fileName}</p>
            <p><strong>File Size:</strong> {formatFileSize(result.fileSize)}</p>
            <p><strong>File Hash:</strong> <code>{formatHash(result.fileHash)}</code></p>
            <p><strong>Blockchain Hash:</strong> <code>{formatHash(result.blockchainHash)}</code></p>
            <p><strong>Transaction:</strong> <code>{formatHash(result.transactionHash)}</code></p>
            <p><strong>Block Number:</strong> {result.blockNumber}</p>
            <p><strong>Network:</strong> {result.network}</p>
            <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>
              Your document is now permanently recorded on the blockchain!
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div
          className="file-upload"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById('file-input').click()}
        >
          <input
            id="file-input"
            type="file"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          {file ? (
            <div className="file-info">
              <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</p>
              <p><strong>{file.name}</strong></p>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>
                {formatFileSize(file.size)} | {file.type || 'Unknown type'}
              </p>
              <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#667eea' }}>
                Click to change file
              </p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📎</p>
              <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                <strong>Click to upload</strong> or drag and drop
              </p>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>
                Any file type, up to 10MB
              </p>
            </>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="uploadedBy">Your Name or Email *</label>
          <input
            id="uploadedBy"
            type="text"
            value={uploadedBy}
            onChange={(e) => setUploadedBy(e.target.value)}
            placeholder="john.doe@example.com"
            required
            minLength={3}
            maxLength={100}
            disabled={isUploading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isUploading}
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description (Optional)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the document..."
            maxLength={1000}
            disabled={isUploading}
          />
          <small style={{ color: '#666' }}>
            {description.length}/1000 characters
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags (Optional)</label>
          <input
            id="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="contract, 2024, important (comma-separated)"
            disabled={isUploading}
          />
          <small style={{ color: '#666' }}>
            Separate tags with commas (max 10 tags)
          </small>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isUploading || !file}
        >
          {isUploading ? (
            <>
              <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
              Uploading to Blockchain...
            </>
          ) : (
            <>
              📤 Upload & Register
            </>
          )}
        </button>
      </form>

      {isUploading && (
        <div className="alert alert-info" style={{ marginTop: '1rem' }}>
          <p><strong>Processing...</strong></p>
          <p style={{ fontSize: '0.9rem' }}>
            1. Calculating document hash...<br />
            2. Submitting to blockchain...<br />
            3. Waiting for confirmation...<br />
            This may take a few moments.
          </p>
        </div>
      )}
    </div>
  );
}

export default DocumentUpload;
