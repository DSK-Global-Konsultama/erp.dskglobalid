import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

const getApiBase = (): string => {
  const envBase = (import.meta.env.VITE_API_BASE_URL || '').toString().trim();
  const base = envBase || 'http://localhost:3000';
  // normalisasi: hilangkan trailing slash
  return base.replace(/\/+$/, '');
};

const TOKEN_KEY = 'erp_auth_token';
const SESSION_KEY = 'erp_user_session';
const SESSION_EXPIRY_KEY = 'erp_session_expiry';

const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY) || null;
};

// Create axios instance with default configuration
const api: AxiosInstance = axios.create({
  baseURL: getApiBase(),
  headers: {
    'Content-Type': 'application/json',
  },
  // keep cookies support for future SSO flows; harmless for JWT routes
  withCredentials: true,
  timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const normalizeAxiosErrorMessage = (error: unknown): string => {
  const err = error as AxiosError<any> & { code?: string };

  if (err?.code === 'ECONNABORTED') {
    return 'Request timeout. Coba lagi.';
  }

  if (err?.code === 'ERR_NETWORK' || !err?.response) {
    return 'Tidak dapat terhubung ke server. Periksa koneksi Anda.';
  }

  const data = err.response?.data;
  return (
    data?.message ||
    data?.error ||
    err.message ||
    'Terjadi kesalahan'
  );
};

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized, clear token + session so UI doesn't keep retrying with invalid token
    if (error?.response?.status === 401) {
      try {
        const oldValue = localStorage.getItem(SESSION_KEY);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(SESSION_EXPIRY_KEY);

        // Notify current tab (and any listeners) immediately
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: SESSION_KEY,
            oldValue,
            newValue: null,
            url: window.location.href,
            storageArea: localStorage,
          })
        );
      } catch {
        // ignore storage errors
      }
    }

    return Promise.reject(new Error(normalizeAxiosErrorMessage(error)));
  }
);

export default api;

