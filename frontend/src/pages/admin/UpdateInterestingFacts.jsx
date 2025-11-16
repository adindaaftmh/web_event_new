import React, { useState } from "react";
import { useSidebar } from "../../contexts/SidebarContext";
import { useInterestingFacts } from "../../contexts/InterestingFactsContext";
import AdminLayout from "../../components/AdminLayout";
import { 
  Plus, Edit3, Trash2, X, Eye, CheckCircle, AlertCircle, 
  Sparkles, TrendingUp, BarChart3, Loader, ImageIcon 
} from "lucide-react";
import { useCloudinaryUpload } from "../../hooks/useCloudinaryUpload";

export default function UpdateInterestingFacts() {
  const { isExpanded } = useSidebar();
  const { facts, addFact, updateFact, deleteFact, toggleActive } = useInterestingFacts();
  const [showModal, setShowModal] = useState(false);
  const [editingFact, setEditingFact] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [dragOver, setDragOver] = useState(false);
  const [formData, setFormData] = useState({
    image: "",
    title: "",
    description: "",
    active: true
  });
  const { uploadImage } = useCloudinaryUpload();

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleAdd = () => {
    setEditingFact(null);
    setFormData({ image: "", title: "", description: "", active: true });
    setShowModal(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageFile(file);
    } else {
      showMessage('error', 'File harus berupa gambar');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleImageFile = (file) => {
    if (!file.type.startsWith('image/')) {
      showMessage('error', 'File harus berupa gambar');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'Ukuran file maksimal 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const localImage = reader.result;
      setFormData((prev) => ({ ...prev, image: localImage }));

      try {
        const result = await uploadImage(file, {
          folder: "homepage/facts",
        });

        setFormData((prev) => ({
          ...prev,
          image: result.url,
        }));

        showMessage('success', 'Gambar berhasil diupload!');
      } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        showMessage('error', error?.message || 'Gagal upload ke Cloudinary. Gambar lokal tetap digunakan.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEdit = (fact) => {
    setEditingFact(fact);
    setFormData(fact);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Yakin ingin menghapus fakta ini?")) {
      deleteFact(id);
      showMessage('success', 'Fakta berhasil dihapus');
    }
  };

  const handleSave = () => {
    if (!formData.image || !formData.title || !formData.description) {
      showMessage('error', 'Semua field wajib diisi');
      return;
    }
    
    if (editingFact) {
      updateFact(editingFact.id, formData);
      showMessage('success', 'Fakta berhasil diperbarui');
    } else {
      addFact(formData);
      showMessage('success', 'Fakta baru berhasil ditambahkan');
    }
    setShowModal(false);
  };

  const handleToggleActive = (id) => {
    const fact = facts.find(f => f.id === id);
    toggleActive(id);
    showMessage('success', `Fakta ${!fact.active ? 'diaktifkan' : 'dinonaktifkan'}`);
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

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#0A1931]">Update Fakta Menarik</h1>
                <p className="text-[#4A7FA7]">Kelola statistik dan fakta menarik yang ditampilkan di halaman utama</p>
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
                  <TrendingUp className="w-6 h-6 text-[#4A7FA7]" />
                  Daftar Fakta Menarik
                </h2>
                <p className="text-sm text-[#4A7FA7] mt-1.5">Total: <span className="font-semibold">{facts.length} fakta</span> | <span className="font-semibold">{facts.filter(f => f.active).length} aktif</span></p>
              </div>
              <button
                onClick={handleAdd}
                className="px-6 py-3.5 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white rounded-xl font-semibold hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                Tambah Fakta Baru
              </button>
            </div>

            {facts.length === 0 ? (
              <div className="text-center py-24 border-2 border-dashed border-[#4A7FA7]/40 rounded-2xl bg-gradient-to-br from-blue-50/50 to-indigo-50/30">
                <div className="w-24 h-24 bg-gradient-to-br from-[#4A7FA7]/20 to-[#1A3D63]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="w-12 h-12 text-[#4A7FA7]" />
                </div>
                <p className="text-[#0A1931] text-xl font-bold mb-2">Belum ada fakta menarik</p>
                <p className="text-[#4A7FA7] text-sm max-w-md mx-auto">
                  Klik tombol <span className="font-semibold">"Tambah Fakta Baru"</span> untuk menambahkan fakta pertama
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {facts.map((fact) => (
                  <div key={fact.id} className="relative bg-white border-2 border-[#4A7FA7]/20 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group hover:border-[#4A7FA7]/50">
                    {/* Badges */}
                    <div className="absolute top-3 right-3">
                      <div className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${
                        fact.active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                      }`}>
                        {fact.active ? '✓ Aktif' : '✕ Nonaktif'}
                      </div>
                    </div>

                    {/* Image */}
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={fact.image} 
                        alt={fact.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-bold text-[#0A1931] text-lg mb-2 group-hover:text-[#4A7FA7] transition-colors line-clamp-1">{fact.title}</h3>
                      <p className="text-sm text-[#4A7FA7]/80 line-clamp-3 leading-relaxed">{fact.description}</p>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleEdit(fact)}
                          className="flex-1 px-3 py-2.5 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white rounded-lg font-semibold hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                          title="Edit Fakta"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span className="hidden sm:inline text-sm">Edit</span>
                        </button>
                        <button
                          onClick={() => handleToggleActive(fact.id)}
                          className={`flex-1 px-3 py-2.5 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
                            fact.active 
                              ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                              : 'bg-green-500 text-white hover:bg-green-600'
                          }`}
                          title={fact.active ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline text-sm">{fact.active ? 'Off' : 'On'}</span>
                        </button>
                        <button
                          onClick={() => handleDelete(fact.id)}
                          className="px-3 py-2.5 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
                          title="Hapus Fakta"
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
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white p-5 rounded-t-2xl z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                      {editingFact ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">
                        {editingFact ? 'Edit Fakta Menarik' : 'Tambah Fakta Baru'}
                      </h2>
                      <p className="text-xs text-white/80">Isi form di bawah untuk {editingFact ? 'mengubah' : 'menambahkan'} fakta</p>
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
                <div className="space-y-5">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-bold text-[#0A1931] mb-2">Upload Gambar Fakta <span className="text-red-500">*</span></label>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                        dragOver 
                          ? 'border-[#4A7FA7] bg-[#4A7FA7]/10' 
                          : 'border-gray-300 hover:border-[#4A7FA7]/50 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="file"
                        onChange={handleImageChange}
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      
                      {formData.image ? (
                        <div className="relative">
                          <img 
                            src={formData.image} 
                            alt="Preview" 
                            className="max-h-48 mx-auto rounded-lg shadow-lg object-cover"
                          />
                          <div className="mt-4 text-sm text-[#4A7FA7] font-medium">
                            ✓ Gambar berhasil dipilih. Klik atau drag gambar baru untuk mengubah
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData({ ...formData, image: "" });
                            }}
                            className="mt-3 px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-all"
                          >
                            Hapus Gambar
                          </button>
                        </div>
                      ) : (
                        <div className="py-6">
                          <div className="w-16 h-16 bg-[#4A7FA7]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ImageIcon className="w-8 h-8 text-[#4A7FA7]" />
                          </div>
                          <p className="text-[#0A1931] font-semibold mb-2">
                            {dragOver ? 'Lepas gambar di sini' : 'Drag & Drop gambar di sini'}
                          </p>
                          <p className="text-sm text-[#4A7FA7] mb-3">atau</p>
                          <div className="inline-block px-4 py-2 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white rounded-lg font-semibold text-sm">
                            Pilih File
                          </div>
                          <p className="text-xs text-[#4A7FA7] mt-3">Format: JPG, PNG, WebP (Max 5MB)</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-[#0A1931] mb-2">Judul Fakta <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-transparent transition-all"
                      placeholder="10K+ Event Selesai"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-[#0A1931] mb-2">Deskripsi <span className="text-red-500">*</span></label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-transparent transition-all resize-none"
                      placeholder="Deskripsi lengkap tentang fakta menarik..."
                    />
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="w-4 h-4 text-[#4A7FA7] rounded focus:ring-2 focus:ring-[#4A7FA7]"
                      />
                      <span className="text-sm font-semibold text-[#0A1931]">Aktif (tampilkan di homepage)</span>
                    </label>
                  </div>

                  {/* Preview */}
                  <div className="border-t pt-5">
                    <label className="block text-sm font-bold text-[#0A1931] mb-3">Preview Fakta Menarik</label>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="max-w-md mx-auto bg-white border-2 border-[#4A7FA7]/20 rounded-2xl overflow-hidden shadow-lg">
                        {/* Preview Image */}
                        <div className="h-48 bg-gray-200 overflow-hidden">
                          {formData.image ? (
                            <img 
                              src={formData.image} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <div className="text-center">
                                <ImageIcon className="w-16 h-16 mx-auto mb-2" />
                                <p className="text-sm">Upload gambar</p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Preview Content */}
                        <div className="p-5">
                          <h3 className="font-bold text-[#0A1931] text-lg mb-2 line-clamp-1">
                            {formData.title || "Judul Fakta Menarik"}
                          </h3>
                          <p className="text-sm text-[#4A7FA7]/80 line-clamp-3 leading-relaxed">
                            {formData.description || "Deskripsi fakta menarik akan ditampilkan di sini. Pastikan deskripsi menarik dan informatif."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-5 border-t mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 border border-gray-300 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-semibold rounded-lg hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-all shadow-lg hover:shadow-xl"
                  >
                    {editingFact ? 'Update' : 'Tambah'} Fakta
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
