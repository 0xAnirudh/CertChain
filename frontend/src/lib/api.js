const stripTrailingSlash = (value) => value.replace(/\/+$/, '');

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const API_BASE = rawBaseUrl ? stripTrailingSlash(rawBaseUrl) : '';

export const apiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
};

export const apiFetch = (path, options = {}) => {
  return fetch(apiUrl(path), options);
};
