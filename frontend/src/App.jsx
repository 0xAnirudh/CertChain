import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useChain } from './hooks/useChain';
import { ToastProvider, useToast } from './components/Toast';
import { Header } from './components/Header';
import { AuthCard } from './components/AuthCard';
import { TabNavigation } from './components/TabNavigation';
import { IssueCertificate } from './components/IssueCertificate';
import { VerifyCertificate } from './components/VerifyCertificate';
import { ChainExplorer } from './components/ChainExplorer';
import './styles/globals.css';
import './styles/common.css';
import './App.css';

const AppContent = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('verify');
  const [authCardVisible, setAuthCardVisible] = useState(true);
  const [chainStatus, setChainStatus] = useState(null);

  const {
    adminToken,
    isAdmin,
    getAdminHeaders,
    adminLogin,
    adminLogout,
    refreshAuthStatus
  } = useAuth();

  const {
    chainData,
    loading: chainLoading,
    error: chainError,
    loadChain,
    validateChain,
    issueCertificate,
    verifyCertificate,
    deleteBlock
  } = useChain(getAdminHeaders);

  // Check chain status periodically
  useEffect(() => {
    const checkStatus = async () => {
      if (isAdmin) {
        const result = await validateChain();
        if (result.success) {
          setChainStatus(result);
        }
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000);

    return () => clearInterval(interval);
  }, [isAdmin, validateChain]);

  useEffect(() => {
    if (isAdmin) {
      setAuthCardVisible(false);
    } else {
      setAuthCardVisible(true);
    }
  }, [isAdmin]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  const handleChainStatusClick = async () => {
    if (isAdmin) {
      const result = await validateChain();
      if (result.success) {
        setChainStatus(result);
      } else {
        addToast('Failed to validate chain', 'error');
      }
    } else {
      addToast('Admin login required to validate the chain', 'info');
    }
  };

  const handleIssueCertificate = async (certData) => {
    const result = await issueCertificate(certData);
    if (result.success) {
      // Refresh chain status after issuing
      const statusResult = await validateChain();
      if (statusResult.success) {
        setChainStatus(statusResult);
      }
    }
    return result;
  };

  const handleDeleteBlock = async (hash) => {
    const result = await deleteBlock(hash);
    if (result.success) {
      await loadChain();
      const statusResult = await validateChain();
      if (statusResult.success) {
        setChainStatus(statusResult);
      }
    }
    return result;
  };

  return (
    <div className="app-container">
      <Header
        isAdmin={isAdmin}
        onChainStatusClick={handleChainStatusClick}
        chainStatus={chainStatus}
      />

      <AuthCard
        isAdmin={isAdmin}
        onLogin={adminLogin}
        onLogout={adminLogout}
        visible={authCardVisible}
        onToggle={() => setAuthCardVisible(!authCardVisible)}
      />

      <button
        className="btn btn-secondary auth-toggle-btn"
        onClick={() => setAuthCardVisible(!authCardVisible)}
        style={{ fontSize: '0.7rem', padding: '8px 14px', marginBottom: '20px' }}
      >
        {isAdmin ? 'Admin Logged In' : 'Admin Login'}
      </button>

      <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

      <IssueCertificate
        isAdmin={isAdmin}
        onIssueCertificate={handleIssueCertificate}
        isActive={activeTab === 'issue'}
      />

      <VerifyCertificate
        onVerifyCertificate={verifyCertificate}
        isActive={activeTab === 'verify'}
      />

      <ChainExplorer
        isAdmin={isAdmin}
        onLoadChain={loadChain}
        onDeleteBlock={handleDeleteBlock}
        onSwitchTab={handleTabChange}
        chainData={chainData}
        loading={chainLoading}
        error={chainError}
        isActive={activeTab === 'explorer'}
      />
    </div>
  );
};

export const App = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;
