import axios from 'axios';

// Ambil dari .env file
const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`;

/**
 * Upload gambar ke Cloudinary
 * @param {File} file - File gambar yang akan diupload
 * @param {Object} options - Opsi tambahan untuk upload
 * @returns {Promise<Object>} Response dari Cloudinary dengan URL gambar
 */
export const uploadToCloudinary = async (file, options = {}) => {
  try {
    // Validasi environment variables
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      throw new Error(
        'Cloudinary belum dikonfigurasi. Pastikan REACT_APP_CLOUDINARY_CLOUD_NAME dan REACT_APP_CLOUDINARY_UPLOAD_PRESET ada di .env file'
      );
    }

    // Validasi file
    if (!file) {
      throw new Error('File tidak boleh kosong');
    }

    // Validasi tipe file
    if (!file.type.startsWith('image/')) {
      throw new Error('File harus berupa gambar (JPG, PNG, WebP, dll)');
    }

    // Validasi ukuran file (max 5MB default, bisa diubah via options)
    const maxSize = options.maxSize || 5 * 1024 * 1024; // 5MB default
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / 1024 / 1024).toFixed(0);
      throw new Error(`Ukuran file maksimal ${maxSizeMB}MB`);
    }

    console.log('🚀 Starting upload to Cloudinary...');
    console.log('File:', file.name, 'Size:', (file.size / 1024).toFixed(2), 'KB');

    // Buat FormData untuk upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    
    // Tambahkan folder jika ada
    if (options.folder) {
      formData.append('folder', options.folder);
    }

    // Tambahkan tags jika ada (untuk organisasi)
    if (options.tags) {
      const tags = Array.isArray(options.tags) ? options.tags.join(',') : options.tags;
      formData.append('tags', tags);
    }

    // Upload ke Cloudinary
    const response = await axios.post(CLOUDINARY_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`Upload progress: ${percentCompleted}%`);
        if (options.onProgress) {
          options.onProgress(percentCompleted);
        }
      }
    });

    console.log('✅ Upload successful!');
    console.log('URL:', response.data.secure_url);

    return {
      success: true,
      data: {
        url: response.data.secure_url,
        publicId: response.data.public_id,
        width: response.data.width,
        height: response.data.height,
        format: response.data.format,
        size: response.data.bytes,
        thumbnail: response.data.eager?.[0]?.secure_url || response.data.secure_url
      }
    };
  } catch (error) {
    console.error('❌ Error uploading to Cloudinary:', error);
    
    if (error.response) {
      // Error dari Cloudinary API
      const errorMsg = error.response.data?.error?.message || 'Gagal mengupload ke Cloudinary';
      throw new Error(errorMsg);
    } else if (error.request) {
      // Request dibuat tapi tidak ada response
      throw new Error('Tidak dapat terhubung ke Cloudinary. Periksa koneksi internet Anda.');
    } else {
      // Error lainnya
      throw new Error(error.message || 'Terjadi kesalahan saat upload');
    }
  }
};

/**
 * Generate optimized URL untuk gambar dengan transformasi
 * @param {string} url - URL gambar dari Cloudinary
 * @param {Object} options - Opsi transformasi
 * @returns {string} URL gambar yang sudah ditransformasi
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto'
  } = options;

  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;

  const transforms = [];
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  transforms.push(`c_${crop}`);
  transforms.push(`q_${quality}`);
  transforms.push(`f_${format}`);

  return `${parts[0]}/upload/${transforms.join(',')}/${parts[1]}`;
};

/**
 * Validasi apakah file adalah gambar yang valid
 * @param {File} file - File yang akan divalidasi
 * @param {Object} options - Opsi validasi
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateImageFile = (file, options = {}) => {
  const maxSize = options.maxSize || 5 * 1024 * 1024; // 5MB default
  const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  if (!file) {
    return { valid: false, error: 'File tidak boleh kosong' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `Tipe file tidak didukung. Gunakan: ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}` 
    };
  }

  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / 1024 / 1024).toFixed(0);
    return { valid: false, error: `Ukuran file maksimal ${maxSizeMB}MB` };
  }

  return { valid: true, error: null };
};

export default {
  uploadToCloudinary,
  getOptimizedImageUrl,
  validateImageFile
};