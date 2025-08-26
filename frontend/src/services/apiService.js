import apiClient from '../config/api';

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

// Service untuk Kegiatan
export const kegiatanService = {
  // Mendapatkan semua kegiatan
  getAll: () => apiClient.get('/kegiatan'),
  
  // Mendapatkan kegiatan by ID
  getById: (id) => apiClient.get(`/kegiatan/${id}`),
  
  // Mendapatkan kegiatan by kategori
  getByKategori: (kategoriId) => apiClient.get(`/kegiatan-by-kategori/${kategoriId}`),
  
  // Membuat kegiatan baru
  create: (data) => apiClient.post('/kegiatan', data),
  
  // Update kegiatan
  update: (id, data) => apiClient.put(`/kegiatan/${id}`, data),
  
  // Hapus kegiatan
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
};
