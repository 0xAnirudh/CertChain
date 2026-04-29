import React, { useState, useEffect } from 'react';
import { useToast } from './Toast';
import './ChainExplorer.css';

export const ChainExplorer = ({
  isAdmin,
  onLoadChain,
  onDeleteBlock,
  onSwitchTab,
  chainData,
  loading,
  error,
  isActive
}) => {
  const { addToast } = useToast();
  const [deletingHash, setDeletingHash] = useState('');
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    if (isActive && isAdmin) {
      onLoadChain();
    }
  }, [isActive, isAdmin, onLoadChain]);

  const closeDeleteModal = () => {
    if (deletingHash) {
      return;
    }
    setDeleteCandidate(null);
    setDeleteConfirmText('');
  };

  const handleDeleteRequest = (block) => {
    setDeleteCandidate(block);
    setDeleteConfirmText('');
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) {
      return;
    }

    if (deleteConfirmText !== 'CONFIRM') {
      addToast('Type exactly CONFIRM to proceed.', 'error');
      return;
    }

    setDeletingHash(deleteCandidate.hash);
    try {
      const result = await onDeleteBlock(deleteCandidate.hash);
      if (result.success) {
        addToast(`Block #${deleteCandidate.index} deleted successfully.`, 'success');
        setDeleteCandidate(null);
        setDeleteConfirmText('');
      } else {
        addToast(result.error || 'Could not delete block.', 'error');
      }
    } finally {
      setDeletingHash('');
    }
  };

  if (!isAdmin) {
    return (
      <div className={`panel explorer-panel ${isActive ? 'active' : ''}`}>
        <div className="section-title">Chain Explorer</div>
        <p className="section-desc">Explorer blocks are admin-only. Login to access explorer blocks.</p>
        <div className="chain-list">
          <div className="empty">
            <span className="empty-icon">🔒</span>
            You need to login as admin to open explorer.
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`panel explorer-panel ${isActive ? 'active' : ''}`}>
        <div className="section-title">Chain Explorer</div>
        <p className="section-desc">Explorer blocks are admin-only. Login to access explorer blocks.</p>

      {chainData && chainData.stats && (
        <div className="stats-row">
          <div className="stat-chip">
            <div className="s-num">{chainData.stats.totalBlocks}</div>
            <div className="s-label">Total Blocks</div>
          </div>
          <div className="stat-chip">
            <div className="s-num">{chainData.stats.totalCertificates}</div>
            <div className="s-label">Certificates</div>
          </div>
          <div className="stat-chip">
            <div className="s-num" style={{ color: chainData.stats.isValid ? 'var(--green)' : 'var(--red)' }}>
              {chainData.stats.isValid ? '✓ VALID' : '✗ INVALID'}
            </div>
            <div className="s-label">Chain Integrity</div>
          </div>
        </div>
      )}

        <div className="chain-list">
          {loading ? (
            <div className="empty">
              <span className="empty-icon">⛓</span>
              Loading blockchain…
            </div>
          ) : error ? (
            <div className="empty">
              <span className="empty-icon">⚠️</span>
              Could not load chain — is the server running?
            </div>
          ) : chainData && chainData.chain && chainData.chain.length > 0 ? (
            <>
              {chainData.chain.length <= 1 && (
                <div className="empty" style={{ marginBottom: '12px' }}>
                  <span className="empty-icon">ℹ️</span>
                  Delete appears on certificate blocks. Issue at least one certificate to enable deletion.
                </div>
              )}
              <ChainBlocks
                blocks={chainData.chain}
                deletingHash={deletingHash}
                onDeleteRequest={handleDeleteRequest}
                onSwitchTab={onSwitchTab}
              />
            </>
          ) : (
            <div className="empty">
              <span className="empty-icon">⛓</span>
              No blocks yet.
            </div>
          )}
        </div>
      </div>

      {deleteCandidate && (
        <div className="delete-modal-overlay" onClick={closeDeleteModal}>
          <div className="delete-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-title">Delete Block #{deleteCandidate.index}</div>
            <p className="delete-modal-desc">
              This will permanently remove the certificate and rebuild all subsequent block hashes.
            </p>
            <label htmlFor="deleteConfirmInput" className="delete-modal-label">
              Type CONFIRM to continue
            </label>
            <input
              id="deleteConfirmInput"
              type="text"
              className="delete-modal-input"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="CONFIRM"
              autoFocus
              disabled={deletingHash === deleteCandidate.hash}
            />
            <div className="delete-modal-actions">
              <button
                className="btn btn-ghost"
                onClick={closeDeleteModal}
                disabled={deletingHash === deleteCandidate.hash}
              >
                Cancel
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleConfirmDelete}
                disabled={deletingHash === deleteCandidate.hash}
              >
                {deletingHash === deleteCandidate.hash ? 'Deleting...' : 'Delete Block'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ChainBlocks = ({ blocks, deletingHash, onDeleteRequest, onSwitchTab }) => {
  const reversed = [...blocks].reverse();

  return (
    <div className="chain-container">
      {reversed.map((block, idx) => {
        const isGenesis = block.index === 0;
        const certData = block.certificateData;

        return (
          <React.Fragment key={block.index}>
            <div className={`chain-block ${isGenesis ? 'genesis' : ''}`}>
              <div className="block-header">
                <span className={`block-index ${isGenesis ? 'genesis-badge' : ''}`}>
                  {isGenesis ? 'GENESIS' : `Block #${block.index}`}
                </span>
                <span className="block-time">{new Date(block.timestamp).toLocaleString()}</span>
              </div>
              <div className="block-fields">
                {!isGenesis ? (
                  <>
                    <div className="block-field">
                      <div className="f-label">Student</div>
                      <div className="f-val">{certData.studentName}</div>
                    </div>
                    <div className="block-field">
                      <div className="f-label">Course</div>
                      <div className="f-val">{certData.course}</div>
                    </div>
                    <div className="block-field">
                      <div className="f-label">Issuer</div>
                      <div className="f-val">{certData.issuer}</div>
                    </div>
                    <div className="block-field">
                      <div className="f-label">Grade</div>
                      <div className="f-val">{certData.grade}</div>
                    </div>
                  </>
                ) : (
                  <div className="block-field">
                    <div className="f-label">Type</div>
                    <div className="f-val">Genesis Block — Chain Origin</div>
                  </div>
                )}
                <div className="block-field hash-full">
                  <div className="f-label">Current Hash (SHA-256)</div>
                  <div className="f-hash">{block.hash}</div>
                </div>
                <div className="block-field hash-full">
                  <div className="f-label">Previous Hash</div>
                  <div className="f-hash prev">{block.previousHash}</div>
                </div>
              </div>

              {!isGenesis && (
                <div style={{ marginTop: '14px' }}>
                  <button
                    className="btn btn-ghost"
                    style={{ fontSize: '0.7rem', padding: '7px 14px' }}
                    onClick={() => {
                      onSwitchTab('verify');
                      setTimeout(() => {
                        document.getElementById('verifyHash').value = block.hash;
                        document.querySelector('.verify-form').dispatchEvent(new Event('submit'));
                      }, 100);
                    }}
                  >
                    ◎ Verify this certificate
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: '0.7rem', padding: '7px 14px', marginLeft: '10px' }}
                    onClick={() => onDeleteRequest(block)}
                    disabled={deletingHash === block.hash}
                  >
                    {deletingHash === block.hash ? 'Deleting...' : 'Delete Block'}
                  </button>
                </div>
              )}

              {isGenesis && (
                <div style={{ marginTop: '14px' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: '0.7rem', padding: '7px 14px', opacity: 0.6, cursor: 'not-allowed' }}
                    disabled
                    title="Genesis block cannot be deleted"
                  >
                    Delete Block (disabled for genesis)
                  </button>
                </div>
              )}
            </div>

            {idx < reversed.length - 1 && (
              <div className="chain-connector">
                <div className="chain-connector-line"></div>
                <div className="chain-connector-arrow"></div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
