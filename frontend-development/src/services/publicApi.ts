import axios from 'axios';

const baseURL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000';

// Axios instance WITHOUT auth interceptors.
export const publicApi = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

publicApi.interceptors.response.use(
  (r) => r,
  (error) => {
    const message = error?.response?.data?.message || error?.message || 'Request gagal';
    return Promise.reject(new Error(message));
  }
);
