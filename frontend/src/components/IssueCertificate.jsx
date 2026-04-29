import React, { useEffect, useState } from 'react';
import { useToast } from './Toast';
import './IssueCertificate.css';

export const IssueCertificate = ({ isAdmin, onIssueCertificate, isActive }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    studentName: '',
    course: '',
    issuer: '',
    date: '',
    grade: 'Pass'
  });

  useEffect(() => {
    if (!isAdmin) {
      setResult(null);
    }
  }, [isAdmin]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAdmin) {
      addToast('You need to login as admin to mint certificate on blockchain.', 'error');
      return;
    }

    const { studentName, course, issuer, date } = formData;
    const fields = { studentName, course, issuer, date };

    // Validate required fields
    let missing = false;
    Object.entries(fields).forEach(([key, value]) => {
      if (!value?.trim()) {
        missing = true;
      }
    });

    if (missing) {
      addToast('Please fill all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await onIssueCertificate(formData);
      if (result.success) {
        setResult(result.data);
        addToast('Certificate minted on the blockchain! ⛓', 'success');
        // Clear form
        setFormData({
          studentName: '',
          course: '',
          issuer: '',
          date: '',
          grade: 'Pass'
        });
      } else {
        addToast(result.error || 'Failed to issue certificate', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyHash = () => {
    if (result?.certificate?.blockHash) {
      navigator.clipboard.writeText(result.certificate.blockHash);
      addToast('Hash copied!', 'success');
    }
  };

  const copyVerifyUrl = () => {
    if (result?.verifyUrl) {
      navigator.clipboard.writeText(result.verifyUrl);
      addToast('URL copied!', 'success');
    }
  };

  const downloadQR = () => {
    if (result?.qrCode) {
      const a = document.createElement('a');
      a.href = result.qrCode;
      a.download = `certchain-${result.certificate.blockHash.slice(0, 8)}.png`;
      a.click();
    }
  };

  return (
    <div className={`panel issue-panel ${isActive ? 'active' : ''}`}>
      <div className="section-title">Issue Certificate</div>
      <p className="section-desc">
        Fill in the certificate details. Each certificate is hashed with SHA-256 and appended to the blockchain as an immutable block.
      </p>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="studentName">Student Name *</label>
              <input
                type="text"
                id="studentName"
                placeholder="e.g. Anirudh Chourey"
                value={formData.studentName}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="course">Course / Programme *</label>
              <input
                type="text"
                id="course"
                placeholder="e.g. Information Technology"
                value={formData.course}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="issuer">Issuing Organization *</label>
              <input
                type="text"
                id="issuer"
                placeholder="e.g. UIETH, PUSSGRC"
                value={formData.issuer}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="date">Completion Date *</label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="grade">Grade / Result</label>
              <select
                id="grade"
                value={formData.grade}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="Pass">Pass</option>
                <option value="Distinction">Distinction</option>
                <option value="Merit">Merit</option>
                <option value="First Class">First Class</option>
                <option value="Second Class">Second Class</option>
                <option value="A+">A+</option>
                <option value="A">A</option>
                <option value="B+">B+</option>
                <option value="B">B</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className={`btn btn-primary ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            <span className="spinner"></span>
            <span className="btn-label">⬡ &nbsp;Mint Certificate on Blockchain</span>
          </button>
        </form>
      </div>

      {isAdmin && result && (
        <IssueResult
          result={result}
          onCopyHash={copyHash}
          onCopyUrl={copyVerifyUrl}
          onDownloadQR={downloadQR}
        />
      )}
    </div>
  );
};

const IssueResult = ({ result, onCopyHash, onCopyUrl, onDownloadQR }) => {
  const cert = result.certificate;
  const formattedDate = new Date(cert.date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="issue-result">
      <div className="card">
        <div className="section-title" style={{ marginBottom: '20px' }}>
          Certificate Minted ✓
        </div>
        <div className="result-grid">
          <div className="cert-badge">
            <div className="cert-title">{cert.course}</div>
            <div className="cert-sub">Issued by {cert.issuer}</div>
            <div className="cert-fields">
              <div className="cert-field">
                <span className="cert-label">Student</span>
                <span className="cert-value">{cert.studentName}</span>
              </div>
              <div className="cert-field">
                <span className="cert-label">Course</span>
                <span className="cert-value">{cert.course}</span>
              </div>
              <div className="cert-field">
                <span className="cert-label">Issuer</span>
                <span className="cert-value">{cert.issuer}</span>
              </div>
              <div className="cert-field">
                <span className="cert-label">Date</span>
                <span className="cert-value">{formattedDate}</span>
              </div>
              <div className="cert-field">
                <span className="cert-label">Grade</span>
                <span className="cert-value">{cert.grade}</span>
              </div>
              <div className="cert-field">
                <span className="cert-label">Block</span>
                <span className="cert-value">#{cert.blockIndex}</span>
              </div>
              <div className="cert-field">
                <span className="cert-label">
                  SHA-256 Hash&nbsp;
                  <button
                    type="button"
                    className="copy-btn"
                    onClick={onCopyHash}
                  >
                    copy
                  </button>
                </span>
                <span className="cert-hash">{cert.blockHash}</span>
              </div>
            </div>
          </div>

          <div className="qr-container">
            <img src={result.qrCode} alt="QR Code" className="qr-img" />
            <div className="qr-label">Scan to verify</div>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ fontSize: '0.7rem', padding: '8px 14px' }}
              onClick={onCopyUrl}
            >
              Copy verify URL
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.7rem', padding: '8px 14px' }}
              onClick={onDownloadQR}
            >
              ↓ Save QR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
