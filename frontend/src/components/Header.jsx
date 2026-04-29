import React, { useState, useEffect } from 'react';
import { useToast } from './Toast';
import './Header.css';

export const Header = ({ isAdmin, onChainStatusClick, chainStatus }) => {
  const { addToast } = useToast();
  const [statusText, setStatusText] = useState('CHAIN VALID');
  const [statusBlocks, setStatusBlocks] = useState('0 blocks');
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    if (chainStatus) {
      setStatusText(chainStatus.valid ? 'CHAIN VALID' : 'CHAIN INVALID');
      setStatusBlocks(`${chainStatus.stats?.totalBlocks || 0} blocks`);
      setIsValid(chainStatus.valid);
    } else if (!isAdmin) {
      setStatusText('ADMIN LOGIN REQUIRED');
      setStatusBlocks('locked');
      setIsValid(false);
    }
  }, [chainStatus, isAdmin]);

  return (
    <header className="header">
      <div className="logo">
        <div className="logo-icon">🔗</div>
        <div>
          <div className="logo-text">
            Cert<span>Chain</span>
          </div>
          <div className="logo-sub">Blockchain Certificate Authority</div>
        </div>
      </div>

      <div className="header-right">
        <div
          id="chain-status"
          className="chain-status"
          onClick={onChainStatusClick}
          title="Click to validate chain"
        >
          <span className={`status-dot ${isValid ? '' : 'invalid'}`}></span>
          <span className="status-text">{statusText}</span>
          <span className="status-separator">·</span>
          <span className="status-blocks">{statusBlocks}</span>
        </div>
      </div>
    </header>
  );
};
