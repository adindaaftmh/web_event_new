import axios from 'axios';

// Konfigurasi base URL untuk backend Laravel
const API_BASE_URL = 'http://localhost:8000/api';

// Membuat instance axios dengan konfigurasi default
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
});

// Interceptor untuk request
apiClient.interceptors.request.use(
  (config) => {
    // Tambahkan token jika ada (untuk authenticated endpoints)
    const token = localStorage.getItem('token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk response
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle error response
    if (error.response?.status === 401) {
      // Unauthorized - hapus token jika ada
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

// Instance terpisah untuk file uploads tanpa auth token
const publicApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
});

export default apiClient;
export { publicApiClient };
