import { useState, useCallback } from 'react';
import { apiFetch } from '../lib/api';

export const useChain = (getAdminHeaders) => {
  const [chainData, setChainData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadChain = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch('/api/chain', {
        headers: getAdminHeaders()
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Unauthorized');
      }

      setChainData(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [getAdminHeaders]);

  const validateChain = useCallback(async () => {
    try {
      const res = await apiFetch('/api/chain/validate', {
        headers: getAdminHeaders()
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Validation failed');
      }

      return data;
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [getAdminHeaders]);

  const issueCertificate = useCallback(async (certData) => {
    try {
      const res = await apiFetch('/api/issue', {
        method: 'POST',
        headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(certData)
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to issue certificate');
      }

      return { success: true, data };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [getAdminHeaders]);

  const verifyCertificate = useCallback(async (hash) => {
    try {
      const res = await apiFetch(`/api/verify/${hash}`);
      const data = await res.json();
      return data;
    } catch (e) {
      return { valid: false, error: e.message };
    }
  }, []);

  const deleteBlock = useCallback(async (hash) => {
    try {
      const res = await apiFetch(`/api/chain/${hash}`, {
        method: 'DELETE',
        headers: getAdminHeaders()
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete block');
      }

      return { success: true, data };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [getAdminHeaders]);

  return {
    chainData,
    loading,
    error,
    loadChain,
    validateChain,
    issueCertificate,
    verifyCertificate,
    deleteBlock
  };
};
