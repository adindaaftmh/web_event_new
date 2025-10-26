import apiClient, { publicApiClient } from '../config/api';
import axios from 'axios';

// Konfigurasi base URL untuk backend Laravel
const API_BASE_URL = 'http://localhost:8000/api';

// Membuat instance axios untuk file uploads (tanpa interceptors default)
export const fileUploadClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Longer timeout for file uploads
});

// Interceptor untuk file upload requests
fileUploadClient.interceptors.request.use(
  (config) => {
    // Tambahkan token jika ada
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Service untuk Kategori Kegiatan
export const kategoriKegiatanService = {
  // Mendapatkan semua kategori kegiatan
  getAll: () => apiClient.get('/kategori-kegiatan'),

  // Mendapatkan kategori kegiatan by ID
  getById: (id) => apiClient.get(`/kategori-kegiatan/${id}`),

  // Membuat kategori kegiatan baru
  create: (data) => apiClient.post('/kategori-kegiatan', data),

  // Update kategori kegiatan
  update: (id, data) => apiClient.put(`/kategori-kegiatan/${id}`, data),

  // Hapus kategori kegiatan
  delete: (id) => apiClient.delete(`/kategori-kegiatan/${id}`),
};

// Service untuk Kegiatan (dengan support file upload)
export const kegiatanService = {
  // Mendapatkan semua kegiatan (public)
  getAll: () => publicApiClient.get('/kegiatan'),

  // Mendapatkan kegiatan by ID (public)
  getById: (id) => publicApiClient.get(`/kegiatan/${id}`),

  // Mendapatkan kegiatan by kategori (public)
  getByKategori: (kategoriId) => publicApiClient.get(`/kegiatan-by-kategori/${kategoriId}`),

  // Pencarian kegiatan (public)
  search: (keyword) => publicApiClient.get(`/kegiatan-search?q=${encodeURIComponent(keyword)}`),

  // Membuat kegiatan baru (dengan file upload) - menggunakan authenticated client
  create: async (data) => {
    try {
      console.log('Creating event with data:', data);

      const formData = new FormData();

      // Handle file upload
      if (data.flyer_kegiatan && data.flyer_kegiatan instanceof File) {
        formData.append('flyer_kegiatan', data.flyer_kegiatan);
        console.log('File appended:', data.flyer_kegiatan.name);
      } else {
        console.log('No file or invalid file:', data.flyer_kegiatan);
      }

      // Add other fields
      Object.keys(data).forEach(key => {
        if (key !== 'flyer_kegiatan' && data[key] !== null && data[key] !== undefined) {
          // Handle array/object fields (like tickets) - convert to JSON string
          if (typeof data[key] === 'object' && !Array.isArray(data[key])) {
            formData.append(key, data[key]);
          } else if (Array.isArray(data[key])) {
            formData.append(key, JSON.stringify(data[key]));
          } else {
            formData.append(key, data[key]);
          }
          console.log(`Appended ${key}:`, data[key]);
        }
      });

      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const response = await fileUploadClient.post('/kegiatan', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('API Response:', response);
      return response;
    } catch (error) {
      console.error('API Error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Update kegiatan (dengan file upload) - menggunakan authenticated client
  update: async (id, data) => {
    const formData = new FormData();

    // Handle file upload
    if (data.flyer_kegiatan && data.flyer_kegiatan instanceof File) {
      formData.append('flyer_kegiatan', data.flyer_kegiatan);
    }

    // Add other fields
    Object.keys(data).forEach(key => {
      if (key !== 'flyer_kegiatan' && data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    return fileUploadClient.post(`/kegiatan/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Hapus kegiatan - menggunakan authenticated client
  delete: (id) => apiClient.delete(`/kegiatan/${id}`),
};

// Service untuk Daftar Hadir
export const daftarHadirService = {
  // Mendapatkan semua daftar hadir
  getAll: () => apiClient.get('/daftar-hadir'),

  // Mendapatkan daftar hadir by ID
  getById: (id) => apiClient.get(`/daftar-hadir/${id}`),

  // Mendapatkan daftar hadir by kegiatan
  getByKegiatan: (kegiatanId) => apiClient.get(`/daftar-hadir-by-kegiatan/${kegiatanId}`),

  // Mendapatkan daftar hadir by user
  getByUser: (userId) => apiClient.get(`/daftar-hadir-by-user/${userId}`),

  // Membuat daftar hadir baru
  create: (data) => apiClient.post('/daftar-hadir', data),

  // Update daftar hadir
  update: (id, data) => apiClient.put(`/daftar-hadir/${id}`, data),

  // Hapus daftar hadir
  delete: (id) => apiClient.delete(`/daftar-hadir/${id}`),

  // Absen
  absen: (data) => apiClient.post('/daftar-hadir/absen', data),

  // Export data peserta
  export: (kegiatanId) => apiClient.get(`/daftar-hadir-export/${kegiatanId}`, {
    responseType: 'blob' // For file download
  }),
};

// Service untuk OTP dan Authentication
export const otpService = {
  // Generate OTP
  generateOtp: (email) => apiClient.post('/otp/generate', { email }),

  // Verify OTP dan register
  verifyOtpAndRegister: (data) => apiClient.post('/otp/verify-register', data),

  // Resend OTP
  resendOtp: (email) => apiClient.post('/otp/resend', { email }),
};

// Service untuk User (jika diperlukan)
export const userService = {
  // Mendapatkan data user yang sedang login
  getCurrentUser: () => apiClient.get('/user'),

  // Login
  login: (credentials) => apiClient.post('/login', credentials),

  // Logout
  logout: () => apiClient.post('/logout'),

  // Update profile (dengan support file upload)
  updateProfile: async (data) => {
    try {
      // Jika data adalah FormData (untuk file upload)
      if (data instanceof FormData) {
        // Jangan set Content-Type manual untuk FormData, biarkan browser set boundary
        return await fileUploadClient.post('/update-profile', data);
      } else {
        // Jika data biasa (tanpa file)
        return await apiClient.post('/update-profile', data);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
};

// Service untuk Testimonial
export const testimonialService = {
  // Mendapatkan semua testimonials (public)
  getAll: (params = {}) => apiClient.get('/testimonials', { params }),

  // Mendapatkan testimonial by ID
  getById: (id) => apiClient.get(`/testimonials/${id}`),

  // Membuat testimonial baru (authenticated)
  create: (data) => apiClient.post('/testimonials', data),

  // Update testimonial (authenticated)
  update: (id, data) => apiClient.put(`/testimonials/${id}`, data),

  // Hapus testimonial (authenticated)
  delete: (id) => apiClient.delete(`/testimonials/${id}`),

  // Approve testimonial (admin only)
  approve: (id) => apiClient.patch(`/testimonials/${id}/approve`),

  // Reject testimonial (admin only)
  reject: (id) => apiClient.patch(`/testimonials/${id}/reject`),
};
