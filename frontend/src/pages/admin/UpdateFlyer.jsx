import React, { useState, useEffect } from "react";
import { useSidebar } from "../../contexts/SidebarContext";
import AdminLayout from "../../components/AdminLayout";
import { Upload, Eye, Edit3, Trash2, Plus, Save, X, Image as ImageIcon, ArrowUp, ArrowDown, Loader, CheckCircle, AlertCircle } from "lucide-react";
import axios from "axios";
import { useCloudinaryUpload } from "../../hooks/useCloudinaryUpload";

const API_URL = "https://dynotix-production.up.railway.app/api";

export default function UpdateFlyer() {
  const { isExpanded } = useSidebar();
  const [flyers, setFlyers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingFlyer, setEditingFlyer] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    order: 1,
    is_active: true,
    link_url: "",
    image_url: ""
  });
  const { uploadImage } = useCloudinaryUpload();

  // Fetch flyers from backend
  useEffect(() => {
    fetchFlyers();
  }, []);

  const fetchFlyers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
      
      if (!token) {
        showMessage('error', 'Token tidak ditemukan. Silakan login kembali');
        setTimeout(() => {
          window.location.href = '/admin/login';
        }, 2000);
        return;
      }

      const response = await axios.get(`${API_URL}/flyers`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setFlyers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching flyers:', error);
      if (error.response?.status === 401) {
        showMessage('error', 'Sesi Anda telah berakhir. Mengalihkan ke halaman login...');
        setTimeout(() => {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('authToken');
          window.location.href = '/admin/login';
        }, 2000);
      } else if (error.code === 'ERR_NETWORK') {
        showMessage('error', '⚠️ Backend server belum berjalan. Jalankan: php artisan serve');
      } else {
        showMessage('error', error.response?.data?.message || 'Gagal memuat data flyers');
      }
      setFlyers([]);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleAdd = () => {
    setEditingFlyer(null);
    setFormData({ 
      title: "", 
      order: flyers.length + 1, 
      is_active: true,
      link_url: "",
      image_url: ""
    });
    setPreviewImage(null);
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleEdit = (flyer) => {
    setEditingFlyer(flyer);
    setFormData({
      title: flyer.title,
      order: flyer.order,
      is_active: flyer.is_active,
      link_url: flyer.link_url || "",
      image_url: flyer.image_url || ""
    });
    setPreviewImage(flyer.image_url);
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus flyer ini?")) return;
    
    const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
    if (!token) {
      showMessage('error', 'Token tidak ditemukan. Silakan login kembali');
      setTimeout(() => window.location.href = '/admin/login', 2000);
      return;
    }

    try {
      await axios.delete(`${API_URL}/flyers/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showMessage('success', 'Flyer berhasil dihapus');
      fetchFlyers();
    } catch (error) {
      console.error('Error deleting flyer:', error);
      if (error.response?.status === 401) {
        showMessage('error', 'Sesi berakhir. Silakan login kembali');
        setTimeout(() => window.location.href = '/admin/login', 2000);
      } else {
        showMessage('error', 'Gagal menghapus flyer');
      }
    }
  };

  const handleSave = async () => {
    console.log('=== SAVING FLYER ===');
    console.log('Form Data:', formData);
    console.log('Selected File:', selectedFile);
    console.log('Editing Flyer:', editingFlyer);

    if (!formData.title.trim()) {
      showMessage('error', 'Judul flyer harus diisi');
      return;
    }

    if (!editingFlyer && !selectedFile) {
      showMessage('error', 'Gambar harus dipilih saat menambah flyer baru');
      return;
    }

    const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
    if (!token) {
      showMessage('error', 'Token tidak ditemukan. Silakan login kembali');
      setTimeout(() => window.location.href = '/admin/login', 2000);
      return;
    }

    setUploading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('order', formData.order);
      formDataToSend.append('is_active', formData.is_active ? '1' : '0');
      if (formData.link_url) {
        formDataToSend.append('link_url', formData.link_url);
      }
      if (formData.image_url) {
        formDataToSend.append('image_url', formData.image_url);
      }
      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
        console.log('Image file attached:', selectedFile.name, selectedFile.size);
      }

      console.log('Sending to API:', editingFlyer ? 'UPDATE' : 'CREATE');

      if (editingFlyer) {
        const response = await axios.post(`${API_URL}/flyers/${editingFlyer.id}?_method=PUT`, formDataToSend, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log('Update response:', response.data);
        showMessage('success', '✓ Flyer berhasil diupdate');
      } else {
        const response = await axios.post(`${API_URL}/flyers`, formDataToSend, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log('Create response:', response.data);
        showMessage('success', '✓ Flyer berhasil ditambahkan');
      }

      setShowModal(false);
      setPreviewImage(null);
      setSelectedFile(null);
      fetchFlyers();
    } catch (error) {
      console.error('=== ERROR SAVING FLYER ===');
      console.error('Error object:', error);
      console.error('Response:', error.response);
      console.error('Response data:', error.response?.data);
      
      if (error.code === 'ERR_NETWORK') {
        showMessage('error', '❌ Backend server tidak berjalan. Jalankan: php artisan serve');
      } else if (error.response?.status === 401) {
        showMessage('error', '❌ Sesi berakhir. Silakan login kembali');
        setTimeout(() => window.location.href = '/admin/login', 2000);
      } else if (error.response?.status === 422) {
        const errors = error.response?.data?.errors;
        const errorMsg = errors ? Object.values(errors).flat().join(', ') : 'Validasi gagal';
        showMessage('error', `❌ ${errorMsg}`);
      } else {
        showMessage('error', `❌ ${error.response?.data?.message || 'Gagal menyimpan flyer. Cek console untuk detail.'}`);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const processImageFile = async (file) => {
    if (!file.type.startsWith('image/')) {
      showMessage('error', 'File harus berupa gambar');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'Ukuran file maksimal 5MB');
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewImage(localPreview);

    try {
      const result = await uploadImage(file, {
        folder: "homepage/flyers",
      });

      setFormData((prev) => ({
        ...prev,
        image_url: result.url,
      }));

      setSelectedFile(file);
      showMessage('success', 'Gambar berhasil diupload!');
    } catch (error) {
      console.error('Cloudinary Upload Error:', error);
      showMessage('error', error?.message || 'Gagal upload ke Cloudinary. Silakan coba lagi.');
      setPreviewImage(null);
      setSelectedFile(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showMessage('error', 'File harus berupa gambar');
        return;
      }
      processImageFile(file);
    }
  };

  const toggleActive = async (id) => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
    if (!token) {
      showMessage('error', 'Token tidak ditemukan. Silakan login kembali');
      setTimeout(() => window.location.href = '/admin/login', 2000);
      return;
    }

    try {
      await axios.patch(`${API_URL}/flyers/${id}/toggle-active`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showMessage('success', 'Status flyer berhasil diubah');
      fetchFlyers();
    } catch (error) {
      console.error('Error toggling active:', error);
      if (error.response?.status === 401) {
        showMessage('error', 'Sesi berakhir. Silakan login kembali');
        setTimeout(() => window.location.href = '/admin/login', 2000);
      } else {
        showMessage('error', 'Gagal mengubah status flyer');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="flex-1">
        {/* CSS Animation */}
        <style>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0) translateX(0) scale(1);
              opacity: 0.6;
            }
            25% {
              transform: translateY(-30px) translateX(15px) scale(1.1);
              opacity: 0.8;
            }
            50% {
              transform: translateY(-50px) translateX(-15px) scale(0.9);
              opacity: 1;
            }
            75% {
              transform: translateY(-30px) translateX(8px) scale(1.05);
              opacity: 0.7;
            }
          }
          .animate-float {
            animation: float 8s ease-in-out infinite;
          }
        `}</style>

        {/* Animated Background Bubbles */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-blue-400/25 to-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/20 to-pink-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/3 w-[450px] h-[450px] bg-gradient-to-br from-cyan-400/20 to-blue-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-32 left-[15%] w-24 h-24 border-2 border-blue-400/50 rounded-full animate-float bg-gradient-to-br from-blue-200/20 to-indigo-300/15"></div>
          <div className="absolute top-64 right-[20%] w-32 h-32 border-2 border-purple-400/45 rounded-full animate-float bg-gradient-to-br from-purple-200/20 to-pink-300/15" style={{ animationDelay: '1.5s', animationDuration: '8s' }}></div>
        </div>

        {/* Content dengan z-index lebih tinggi */}
        <div className="relative z-10">
          {/* Header */}
          <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-xl flex items-center justify-center shadow-lg">
              <ImageIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#0A1931]">Update Flyer Hero Carousel</h1>
              <p className="text-[#4A7FA7]">Kelola flyer event yang ditampilkan di hero carousel halaman utama</p>
            </div>
          </div>
          <div className="h-1 w-32 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] rounded-full animate-pulse"></div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-fade-in-up ${
            message.type === 'success' ? 'bg-green-50 border-2 border-green-200 text-green-800' : 'bg-red-50 border-2 border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-[#4A7FA7]/20 p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#0A1931] flex items-center gap-2">
                <ImageIcon className="w-6 h-6 text-[#4A7FA7]" />
                Daftar Flyer
              </h2>
              <p className="text-sm text-[#4A7FA7] mt-1.5">Total: <span className="font-semibold">{flyers.length} flyer</span> aktif ditampilkan di homepage</p>
            </div>
            <button
              onClick={handleAdd}
              disabled={loading}
              className="px-6 py-3.5 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white rounded-xl font-semibold hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Tambah Flyer Baru
            </button>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader className="w-8 h-8 animate-spin text-[#4A7FA7]" />
            </div>
          ) : flyers.length === 0 ? (
            <div className="text-center py-24 border-2 border-dashed border-[#4A7FA7]/40 rounded-2xl bg-gradient-to-br from-blue-50/50 to-indigo-50/30">
              <div className="w-24 h-24 bg-gradient-to-br from-[#4A7FA7]/20 to-[#1A3D63]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <ImageIcon className="w-12 h-12 text-[#4A7FA7]" />
              </div>
              <p className="text-[#0A1931] text-xl font-bold mb-2">Belum ada flyer</p>
              <p className="text-[#4A7FA7] text-sm max-w-md mx-auto">
                Klik tombol <span className="font-semibold">"Tambah Flyer Baru"</span> di atas untuk menambahkan flyer pertama Anda
              </p>
              <p className="text-xs text-[#4A7FA7]/70 mt-4">
                💡 Tip: Flyer yang aktif akan otomatis tampil di hero carousel homepage
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flyers.sort((a, b) => a.order - b.order).map((flyer, index) => (
                <div key={flyer.id} className="relative bg-white border-2 border-[#4A7FA7]/20 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group hover:border-[#4A7FA7]/50">
                  {/* Image Preview */}
                  <div className="relative h-56 bg-gradient-to-br from-[#4A7FA7]/10 to-[#1A3D63]/10 overflow-hidden">
                    <img 
                      src={flyer.image_url} 
                      alt={flyer.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      <div className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${
                        flyer.is_active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                      }`}>
                        {flyer.is_active ? '✓ Aktif' : '✕ Nonaktif'}
                      </div>
                    </div>
                    <div className="absolute top-3 left-3">
                      <div className="px-3 py-1.5 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white rounded-full text-xs font-bold shadow-lg">
                        #{flyer.order}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 bg-white">
                    <h3 className="font-bold text-[#0A1931] text-lg mb-4 line-clamp-2 group-hover:text-[#4A7FA7] transition-colors">
                      {flyer.title}
                    </h3>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(flyer)}
                        className="flex-1 px-3 py-2.5 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white rounded-lg font-semibold hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        title="Edit Flyer"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span className="hidden sm:inline text-sm">Edit</span>
                      </button>
                      <button
                        onClick={() => toggleActive(flyer.id)}
                        className={`flex-1 px-3 py-2.5 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
                          flyer.is_active 
                            ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                        title={flyer.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline text-sm">{flyer.is_active ? 'Off' : 'On'}</span>
                      </button>
                      <button
                        onClick={() => handleDelete(flyer.id)}
                        className="px-3 py-2.5 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
                        title="Hapus Flyer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Form dengan Preview */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white p-5 rounded-t-2xl z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                      {editingFlyer ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">
                        {editingFlyer ? 'Edit Flyer' : 'Tambah Flyer Baru'}
                      </h2>
                      <p className="text-xs text-white/80">Isi form di bawah untuk {editingFlyer ? 'mengubah' : 'menambahkan'} flyer</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Form Fields */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-[#0A1931] mb-2">
                      Judul Flyer <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-transparent transition-all ${
                        formData.title.trim() ? 'border-green-300 bg-green-50/30' : 'border-gray-200'
                      }`}
                      placeholder="Contoh: Music Festival 2024"
                      required
                    />
                    <p className="text-xs text-[#4A7FA7] mt-1">
                      {formData.title.trim() ? '✓ Judul sudah diisi' : 'Judul akan ditampilkan di hero carousel homepage'}
                    </p>
                  </div>

                  {/* Image Upload & Preview */}
                  <div>
                    <label className="block text-sm font-bold text-[#0A1931] mb-2 flex items-center justify-between">
                      <span>Upload Gambar Flyer {!editingFlyer && <span className="text-red-500">*</span>}</span>
                      {(selectedFile || previewImage) && (
                        <span className="text-xs text-green-600 font-semibold">✓ Gambar siap</span>
                      )}
                    </label>
                    
                    {/* Drag & Drop Area */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${
                        dragOver 
                          ? 'border-[#4A7FA7] bg-[#4A7FA7]/10' 
                          : 'border-gray-300 hover:border-[#4A7FA7]/50 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="file"
                        onChange={handleImageChange}
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      
                      {previewImage ? (
                        <div className="relative group">
                          <img 
                            src={previewImage} 
                            alt="Preview" 
                            className="w-full h-48 object-cover rounded-lg shadow-md"
                          />
                          <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="text-white text-center">
                              <Upload className="w-6 h-6 mx-auto mb-1" />
                              <p className="text-xs font-semibold">Klik untuk mengubah</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-8">
                          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                          <p className="text-sm text-gray-600 font-semibold mb-1">
                            Klik atau drag & drop gambar
                          </p>
                          <p className="text-xs text-gray-500">
                            JPG, PNG, GIF, WebP (Max 5MB)
                          </p>
                        </div>
                      )}
                    </div>

                    {selectedFile && (
                      <div className="mt-3 bg-[#4A7FA7]/10 border border-[#4A7FA7]/30 rounded-lg p-2.5 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[#4A7FA7]" />
                        <div className="flex-1 text-xs">
                          <p className="font-semibold text-[#0A1931]">{selectedFile.name}</p>
                          <p className="text-[#4A7FA7]">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Urutan & Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-[#0A1931] mb-2">
                        Urutan <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-transparent transition-all text-sm"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0A1931] mb-2">
                        Status
                      </label>
                      <label className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-all">
                        <input
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                          className="w-4 h-4 text-[#4A7FA7] rounded focus:ring-2 focus:ring-[#4A7FA7]"
                        />
                        <span className="text-sm font-semibold text-[#0A1931]">Aktif</span>
                      </label>
                    </div>
                  </div>

                  {/* Link URL */}
                  <div>
                    <label className="block text-sm font-bold text-[#0A1931] mb-2">
                      Link URL (Opsional)
                    </label>
                    <input
                      type="url"
                      value={formData.link_url}
                      onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                      className="w-full px-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-transparent transition-all text-sm"
                      placeholder="https://example.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">Jika diisi, flyer bisa diklik untuk membuka link ini</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6 pt-5 border-t border-gray-200">
                  <button
                    onClick={() => setShowModal(false)}
                    disabled={uploading}
                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    <span className="text-sm">Batal</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={uploading || !formData.title.trim() || (!editingFlyer && !selectedFile)}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-semibold rounded-lg hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span className="text-sm">{editingFlyer ? 'Update' : 'Tambah'} Flyer</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </AdminLayout>
  );
}
