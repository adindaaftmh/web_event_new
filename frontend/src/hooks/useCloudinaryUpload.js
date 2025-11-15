import { useState } from 'react';
import { uploadToCloudinary } from '../services/cloudinaryService';

export const useCloudinaryUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [error, setError] = useState(null);

  const uploadImage = async (file, options = {}) => {
    try {
      setUploading(true);
      setError(null);
      setUploadProgress(0);

      const result = await uploadToCloudinary(file, {
        ...options,
        onProgress: (progress) => {
          setUploadProgress(progress);
          if (options.onProgress) {
            options.onProgress(progress);
          }
        }
      });

      setUploadedUrl(result.data.url);
      setUploadProgress(100);
      return result.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setUploading(false);
    setUploadProgress(0);
    setUploadedUrl(null);
    setError(null);
  };

  return {
    uploading,
    uploadProgress,
    uploadedUrl,
    error,
    uploadImage,
    resetUpload
  };
};

export default useCloudinaryUpload;