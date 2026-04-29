import { useState, useCallback, useEffect } from 'react';
import { apiFetch } from '../lib/api';

export const useAuth = () => {
  const [adminToken, setAdminToken] = useState(() => 
    localStorage.getItem('certchainAdminToken') || ''
  );
  const [isAdmin, setIsAdmin] = useState(false);

  const getAdminHeaders = useCallback((extra = {}) => {
    const headers = { ...extra };
    if (adminToken) headers['x-admin-token'] = adminToken;
    return headers;
  }, [adminToken]);

  const refreshAuthStatus = useCallback(async () => {
    try {
      const res = await apiFetch('/api/auth/status', {
        headers: getAdminHeaders()
      });
      const data = await res.json();
      const admin = Boolean(data.isAdmin);
      setIsAdmin(admin);
      if (!admin) {
        setAdminToken('');
        localStorage.removeItem('certchainAdminToken');
      }
    } catch (e) {
      setIsAdmin(false);
    }
  }, [getAdminHeaders]);

  useEffect(() => {
    refreshAuthStatus();
  }, [refreshAuthStatus]);

  const adminLogin = useCallback(async (username, password) => {
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (!data.success || !data.token) {
        throw new Error(data.error || 'Login failed');
      }

      setAdminToken(data.token);
      localStorage.setItem('certchainAdminToken', data.token);
      setIsAdmin(true);
      
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, []);

  const adminLogout = useCallback(async () => {
    try {
      await apiFetch('/api/auth/logout', {
        method: 'POST',
        headers: getAdminHeaders()
      });
    } catch (e) {
      // no-op
    }

    setAdminToken('');
    setIsAdmin(false);
    localStorage.removeItem('certchainAdminToken');
  }, [getAdminHeaders]);

  return {
    adminToken,
    isAdmin,
    getAdminHeaders,
    adminLogin,
    adminLogout,
    refreshAuthStatus
  };
};
