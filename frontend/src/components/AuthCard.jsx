import React, { useState } from 'react';
import { useToast } from './Toast';
import './AuthCard.css';

export const AuthCard = ({ isAdmin, onLogin, onLogout, visible, onToggle }) => {
  const { addToast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      addToast('Enter admin username and password', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await onLogin(username, password);
      if (result.success) {
        setPassword('');
        setUsername('');
        addToast('Admin login successful', 'success');
      } else {
        addToast(result.error || 'Login failed', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await onLogout();
    addToast('Logged out from admin account', 'success');
  };

  if (!visible) return null;

  return (
    <div className="auth-card card">
      <div className="auth-meta">
        <div className="auth-title">Admin Access</div>
        <div className="auth-state">
          {isAdmin
            ? 'Logged in as admin. You can issue certificates and open chain explorer.'
            : 'Not logged in. Verify is public; Issue and Explorer require admin login.'}
        </div>
      </div>

      {!isAdmin ? (
        <form className="auth-controls" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Admin username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin(e)}
          />
          <button 
            type="submit" 
            className={`btn btn-primary ${loading ? 'loading' : ''}`}
            style={{ padding: '10px 18px', fontSize: '0.72rem' }}
            disabled={loading}
          >
            <span className="spinner"></span>
            <span className="btn-label">Sign In</span>
          </button>
        </form>
      ) : (
        <div className="auth-controls">
          <button 
            className="btn btn-ghost"
            style={{ padding: '10px 18px', fontSize: '0.72rem' }}
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};
