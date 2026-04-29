import React, { useState, useEffect } from 'react';
import { useToast } from './Toast';
import './VerifyCertificate.css';

export const VerifyCertificate = ({ onVerifyCertificate, isActive }) => {
  const { addToast } = useToast();
  const [hash, setHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Handle URL parameters for QR scans
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/^\/verify\/([a-f0-9]{64})$/i);
    if (match) {
      const hashFromUrl = match[1];
      setHash(hashFromUrl);
      handleVerify(hashFromUrl);
    }
  }, []);

  const handleVerify = async (hashValue = hash) => {
    if (!hashValue.trim()) {
      addToast('Please enter a certificate hash', 'error');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const verifyResult = await onVerifyCertificate(hashValue);
      setResult(verifyResult);

      if (!verifyResult.valid) {
        const msg =
          verifyResult.status === 'NOT_FOUND'
            ? 'No certificate with this hash exists on the blockchain.'
            : verifyResult.status === 'CHAIN_COMPROMISED'
            ? 'Blockchain integrity compromised. Results unreliable.'
            : verifyResult.error || 'Certificate is invalid.';
        addToast(msg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleVerify();
  };

  return (
    <div className={`panel verify-panel ${isActive ? 'active' : ''}`}>
      <div className="section-title">Verify Certificate</div>
      <p className="section-desc">
        Enter a SHA-256 block hash or scan a QR code to verify certificate authenticity against the blockchain.
      </p>

      <div className="card">
        <form className="verify-form" onSubmit={handleSubmit}>
          <div className="verify-input-row">
            <div className="form-group">
              <label htmlFor="verifyHash">Certificate Hash (SHA-256)</label>
              <input
                type="text"
                id="verifyHash"
                placeholder="64-character hex hash…"
                value={hash}
                onChange={(e) => setHash(e.target.value)}
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
              disabled={loading}
              style={{ height: 'fit-content' }}
            >
              <span className="spinner"></span>
              <span className="btn-label">◎ &nbsp;Verify</span>
            </button>
          </div>
        </form>
      </div>

      {result && <VerifyResult result={result} />}
    </div>
  );
};

const VerifyResult = ({ result }) => {
  if (result.valid) {
    const c = result.certificate;
    const formattedDate = new Date(c.date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const timestamp = new Date(c.timestamp).toLocaleString();

    return (
      <div className="verify-result" style={{ marginTop: '28px' }}>
        <div className="status-banner valid">
          <div className="status-icon">✅</div>
          <div className="status-text valid">
            <h3>CERTIFICATE VERIFIED</h3>
            <p>This certificate is authentic and recorded on the blockchain. Chain integrity: {result.chainIntegrity}</p>
          </div>
        </div>
        <div className="cert-detail-grid">
          <div className="detail-item">
            <div className="d-label">Student Name</div>
            <div className="d-value">{c.studentName}</div>
          </div>
          <div className="detail-item">
            <div className="d-label">Course</div>
            <div className="d-value">{c.course}</div>
          </div>
          <div className="detail-item">
            <div className="d-label">Issuer</div>
            <div className="d-value">{c.issuer}</div>
          </div>
          <div className="detail-item">
            <div className="d-label">Date</div>
            <div className="d-value">{formattedDate}</div>
          </div>
          <div className="detail-item">
            <div className="d-label">Grade</div>
            <div className="d-value">{c.grade}</div>
          </div>
          <div className="detail-item">
            <div className="d-label">Block Index</div>
            <div className="d-value">#{c.blockIndex}</div>
          </div>
          <div className="detail-item">
            <div className="d-label">Timestamp</div>
            <div className="d-value">{timestamp}</div>
          </div>
          <div className="detail-item full">
            <div className="d-label">SHA-256 Block Hash</div>
            <div className="d-value hash-value">{c.blockHash}</div>
          </div>
          <div className="detail-item full">
            <div className="d-label">Previous Block Hash</div>
            <div className="d-value hash-value prev-hash">{c.previousHash}</div>
          </div>
        </div>
      </div>
    );
  }

  const msg =
    result.status === 'NOT_FOUND'
      ? 'No certificate with this hash exists on the blockchain.'
      : result.status === 'CHAIN_COMPROMISED'
      ? 'Blockchain integrity compromised. Results unreliable.'
      : result.error || 'Certificate is invalid.';

  return (
    <div className="verify-result" style={{ marginTop: '28px' }}>
      <div className="status-banner invalid">
        <div className="status-icon">❌</div>
        <div className="status-text invalid">
          <h3>INVALID CERTIFICATE</h3>
          <p>{msg}</p>
        </div>
      </div>
    </div>
  );
};
