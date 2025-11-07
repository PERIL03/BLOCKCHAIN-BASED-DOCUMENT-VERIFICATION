import React, { useState, useEffect } from 'react';
import './App.css';
import DocumentUpload from './components/DocumentUpload';
import DocumentVerify from './components/DocumentVerify';
import DocumentRegistry from './components/DocumentRegistry';
import Dashboard from './components/Dashboard';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http:
      const data = await response.json();
      if (data.success) {
        setStats(data.statistics);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentUploaded = () => {
    loadStats();
  };

  const handleDocumentVerified = () => {
    loadStats();
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="container">
          <div className="header-content">
            <h1>🔐 Blockchain Document Verification</h1>
            <p className="subtitle">Secure, transparent, and immutable document registry</p>
          </div>
        </div>
      </header>

      <nav className="nav-tabs">
        <div className="container">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              📊 Dashboard
            </button>
            <button
              className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              📤 Upload Document
            </button>
            <button
              className={`tab ${activeTab === 'verify' ? 'active' : ''}`}
              onClick={() => setActiveTab('verify')}
            >
              ✅ Verify Document
            </button>
            <button
              className={`tab ${activeTab === 'registry' ? 'active' : ''}`}
              onClick={() => setActiveTab('registry')}
            >
              📋 Document Registry
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="container">
          {activeTab === 'dashboard' && (
            <Dashboard stats={stats} isLoading={isLoading} onRefresh={loadStats} />
          )}
          {activeTab === 'upload' && (
            <DocumentUpload onDocumentUploaded={handleDocumentUploaded} />
          )}
          {activeTab === 'verify' && (
            <DocumentVerify onDocumentVerified={handleDocumentVerified} />
          )}
          {activeTab === 'registry' && <DocumentRegistry />}
        </div>
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>
            © 2024 Blockchain Document Verification System | Powered by Ethereum Smart Contracts
          </p>
          <div className="footer-links">
            <a href="#api-docs">API Documentation</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
