import axios from 'axios';

// Konfigurasi base URL untuk backend Laravel
const API_BASE_URL = 'https://dynotix-production.up.railway.app/api';

// Membuat instance axios dengan konfigurasi default
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // Increased from 10000 to 30000 (30 seconds)
});

// Interceptor untuk request
apiClient.interceptors.request.use(
  (config) => {
    // Tambahkan token jika ada (untuk authenticated endpoints)
    // Cek adminToken dulu, kemudian token biasa
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
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
      localStorage.removeItem('adminToken');
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

// Helper function untuk mendapatkan storage URL
export const getStorageUrl = (path) => {
  if (!path) return null;
  
  // Jika sudah full URL, return langsung
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Hapus /api dari base URL untuk storage
  const baseUrl = API_BASE_URL.replace('/api', '');
  
  // Pastikan path tidak dimulai dengan /
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  return `${baseUrl}/storage/${cleanPath}`;
};

export default apiClient;
export { publicApiClient };
