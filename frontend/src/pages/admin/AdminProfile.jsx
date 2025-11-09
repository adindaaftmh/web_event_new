import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { User, Mail, Lock, Camera, Save, X, Eye, EyeOff, Calendar, Activity, Phone } from 'lucide-react';
import apiClient from '../../config/api';

export default function AdminProfile() {
  const [admin, setAdmin] = useState({
    id: null,
    nama_lengkap: '',
    email: '',
    role: '',
    profile_image: null,
    no_handphone: '',
    alamat: '',
    pendidikan_terakhir: '',
    status_akun: '',
    created_at: '',
    updated_at: ''
  });

  const [editMode, setEditMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    email: '',
    no_handphone: '',
    alamat: '',
    pendidikan_terakhir: '',
    profile_image: null
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [notification, setNotification] = useState({
    show: false,
    type: '', // 'success' or 'error'
    message: ''
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    if (editMode) {
      setFormData({
        nama_lengkap: admin.nama_lengkap,
        email: admin.email,
        no_handphone: admin.no_handphone,
        alamat: admin.alamat,
        pendidikan_terakhir: admin.pendidikan_terakhir,
        profile_image: null
      });
    }
  }, [editMode, admin]);

  const fetchAdminData = async () => {
    try {
      const response = await apiClient.get('/user');
      if (response.data.success) {
        const userData = response.data.data;
        setAdmin({
          id: userData.id,
          nama_lengkap: userData.nama_lengkap,
          email: userData.email,
          role: userData.role || 'user',
          profile_image: userData.profile_image,
          no_handphone: userData.no_handphone,
          alamat: userData.alamat,
          pendidikan_terakhir: userData.pendidikan_terakhir,
          status_akun: userData.status_akun,
          created_at: userData.created_at || new Date().toISOString(),
          updated_at: userData.updated_at || new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      showNotification('error', 'Gagal memuat data admin');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, profile_image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nama_lengkap', formData.nama_lengkap);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('no_handphone', formData.no_handphone);
      formDataToSend.append('alamat', formData.alamat);
      formDataToSend.append('pendidikan_terakhir', formData.pendidikan_terakhir);
      
      if (formData.profile_image) {
        formDataToSend.append('profile_image', formData.profile_image);
      }

      const response = await apiClient.post('/update-profile', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        // Update state dengan data terbaru
        await fetchAdminData();
        setEditMode(false);
        setPreviewImage(null);
        setLoading(false);
        showNotification('success', 'Profile berhasil diperbarui!');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'Gagal memperbarui profile';
      showNotification('error', errorMessage);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Validasi konfirmasi password
    if (passwordData.new_password !== passwordData.confirm_password) {
      showNotification('error', 'Password baru dan konfirmasi password tidak cocok!');
      return;
    }
    
    // Validasi panjang password
    if (passwordData.new_password.length < 6) {
      showNotification('error', 'Password minimal 6 karakter!');
      return;
    }

    setLoading(true);
    try {
      // Kirim request ke backend untuk ubah password
      const response = await apiClient.put('/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        confirm_password: passwordData.confirm_password
      });

      if (response.data.success) {
        // Reset form dan tutup modal
        setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
        setChangePasswordMode(false);
        setLoading(false);
        showNotification('success', 'Password berhasil diubah! Silakan gunakan password baru untuk login selanjutnya.');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error changing password:', error);
      
      // Tampilkan pesan error dari backend atau pesan default
      const errorMessage = error.response?.data?.message || 'Gagal mengubah password. Pastikan password lama Anda benar.';
      showNotification('error', errorMessage);
    }
  };

  const getInitials = (name) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <AdminLayout>
      <div className="min-h-screen relative bg-gradient-to-br from-slate-100 via-blue-50/30 to-indigo-100/40 overflow-hidden">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-blue-400/25 to-indigo-500/20 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-10 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/20 to-pink-500/15 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-2xl flex items-center justify-center shadow-xl">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-[#0A1931]">Profile Admin</h1>
              <p className="text-[#4A7FA7] text-lg mt-1">Kelola Informasi Akun & Identitas Anda</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-[#4A7FA7]/30 overflow-hidden">
              <div className="bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] px-8 py-5">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <User className="w-6 h-6" />
                  Informasi Akun & Identitas
                </h2>
              </div>
              <div className="p-8">
                <div className="flex items-start gap-6 mb-6">
                  <div>{admin.profile_image ? <img src={admin.profile_image} alt={admin.nama_lengkap} className="w-32 h-32 rounded-full object-cover border-4 border-[#4A7FA7]/30 shadow-lg" /> : <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white">{getInitials(admin.nama_lengkap)}</div>}</div>
                  <div className="flex-1"><h3 className="text-2xl font-bold text-[#0A1931] mb-1">{admin.nama_lengkap}</h3><p className="text-[#4A7FA7] font-semibold mb-4">{admin.role === 'admin' ? 'Administrator' : 'User'}</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-[#4A7FA7]" /><span className="text-gray-700">{admin.email}</span></div>
                      <div className="flex items-center gap-3"><Phone className="w-5 h-5 text-[#4A7FA7]" /><span className="text-gray-700">{admin.no_handphone}</span></div>
                      <div className="flex items-center gap-3"><Calendar className="w-5 h-5 text-[#4A7FA7]" /><span className="text-gray-700">Terdaftar: {admin.created_at ? new Date(admin.created_at).toLocaleDateString('id-ID') : '-'}</span></div>
                      <div className="flex items-center gap-3"><Activity className="w-5 h-5 text-[#4A7FA7]" /><span className="text-gray-700">Update terakhir: {admin.updated_at ? new Date(admin.updated_at).toLocaleString('id-ID') : '-'}</span></div>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <button onClick={() => setEditMode(true)} className="w-full px-6 py-3 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-semibold rounded-xl hover:from-[#4A7FA7]/90 hover:to-[#0A1931] transition-all shadow-lg flex items-center justify-center gap-2"><User className="w-5 h-5" />Edit Profile</button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-[#4A7FA7]/30 overflow-hidden">
              <div className="bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] px-8 py-5">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Lock className="w-6 h-6" />
                  Keamanan Akun
                </h2>
              </div>
              <div className="p-6">
                <div className="text-center py-8">
                  <Lock className="w-16 h-16 mx-auto text-[#4A7FA7]/30 mb-4" />
                  <p className="text-gray-600 mb-6">Klik tombol untuk mengubah password</p>
                  <button onClick={() => setChangePasswordMode(true)} className="w-full px-6 py-3 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-semibold rounded-xl hover:from-[#4A7FA7]/90 hover:to-[#0A1931] transition-all shadow-lg">Ubah Password</button>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Edit Profile */}
          {editMode && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] px-8 py-5 flex items-center justify-between sticky top-0">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <User className="w-6 h-6" />
                    Edit Profile
                  </h2>
                  <button onClick={() => { setEditMode(false); setPreviewImage(null); }} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleUpdateProfile} className="p-8">
                  <div className="mb-6 flex flex-col items-center">
                    <div className="relative mb-4">
                      {previewImage || admin.profile_image ? (
                        <img src={previewImage || admin.profile_image} alt="Preview" className="w-32 h-32 rounded-full object-cover border-4 border-[#4A7FA7]/30 shadow-lg" />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                          {getInitials(formData.nama_lengkap || admin.nama_lengkap)}
                        </div>
                      )}
                      <label className="absolute bottom-0 right-0 w-10 h-10 bg-[#4A7FA7] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#1A3D63] transition-colors shadow-lg">
                        <Camera className="w-5 h-5 text-white" />
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      </label>
                    </div>
                    <p className="text-sm text-gray-500">Klik icon kamera untuk mengubah foto</p>
                  </div>
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-[#0A1931] mb-2">Nama Lengkap</label>
                      <input type="text" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleInputChange} required className="w-full px-4 py-3 bg-white border-2 border-[#4A7FA7]/20 rounded-lg focus:border-[#4A7FA7] focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0A1931] mb-2">Email</label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-4 py-3 bg-white border-2 border-[#4A7FA7]/20 rounded-lg focus:border-[#4A7FA7] focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0A1931] mb-2">No. Handphone</label>
                      <input type="tel" name="no_handphone" value={formData.no_handphone} onChange={handleInputChange} required className="w-full px-4 py-3 bg-white border-2 border-[#4A7FA7]/20 rounded-lg focus:border-[#4A7FA7] focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0A1931] mb-2">Alamat</label>
                      <textarea name="alamat" value={formData.alamat} onChange={handleInputChange} required rows="3" className="w-full px-4 py-3 bg-white border-2 border-[#4A7FA7]/20 rounded-lg focus:border-[#4A7FA7] focus:outline-none resize-none"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0A1931] mb-2">Pendidikan Terakhir</label>
                      <select name="pendidikan_terakhir" value={formData.pendidikan_terakhir} onChange={handleInputChange} required className="w-full px-4 py-3 bg-white border-2 border-[#4A7FA7]/20 rounded-lg focus:border-[#4A7FA7] focus:outline-none">
                        <option value="">Pilih Pendidikan</option>
                        <option value="SD/MI">SD/MI</option>
                        <option value="SMP/MTS">SMP/MTS</option>
                        <option value="SMA/SMK">SMA/SMK</option>
                        <option value="Diploma/Sarjana">Diploma/Sarjana</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" disabled={loading} className="flex-1 px-6 py-3 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-semibold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
                      <Save className="w-5 h-5" />
                      {loading ? 'Menyimpan...' : 'Simpan'}
                    </button>
                    <button type="button" onClick={() => { setEditMode(false); setPreviewImage(null); }} disabled={loading} className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all shadow-lg flex items-center justify-center gap-2">
                      <X className="w-5 h-5" />
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Notification Toast */}
          {notification.show && (
            <div className="fixed top-4 right-4 z-[60] animate-slide-in">
              <div className={`rounded-xl shadow-2xl p-4 min-w-[300px] max-w-md backdrop-blur-xl border-2 ${
                notification.type === 'success' 
                  ? 'bg-green-500/90 border-green-400' 
                  : 'bg-red-500/90 border-red-400'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {notification.type === 'success' ? (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-sm mb-1">
                      {notification.type === 'success' ? 'Berhasil!' : 'Gagal!'}
                    </h3>
                    <p className="text-white/90 text-sm">
                      {notification.message}
                    </p>
                  </div>
                  <button 
                    onClick={() => setNotification({ show: false, type: '', message: '' })}
                    className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Ubah Password */}
          {changePasswordMode && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] px-8 py-5 flex items-center justify-between sticky top-0">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Lock className="w-6 h-6" />
                    Ubah Password
                  </h2>
                  <button onClick={() => { setChangePasswordMode(false); setPasswordData({ current_password: '', new_password: '', confirm_password: '' }); }} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleChangePassword} className="p-8">
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-[#0A1931] mb-2">Password Lama</label>
                      <div className="relative">
                        <input type={showPasswords.current ? 'text' : 'password'} name="current_password" value={passwordData.current_password} onChange={handlePasswordChange} required className="w-full px-4 py-3 pr-12 bg-white border-2 border-[#4A7FA7]/20 rounded-lg focus:border-[#4A7FA7] focus:outline-none" />
                        <button type="button" onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#4A7FA7]">
                          {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0A1931] mb-2">Password Baru</label>
                      <div className="relative">
                        <input type={showPasswords.new ? 'text' : 'password'} name="new_password" value={passwordData.new_password} onChange={handlePasswordChange} required minLength={6} className="w-full px-4 py-3 pr-12 bg-white border-2 border-[#4A7FA7]/20 rounded-lg focus:border-[#4A7FA7] focus:outline-none" />
                        <button type="button" onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#4A7FA7]">
                          {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0A1931] mb-2">Konfirmasi Password</label>
                      <div className="relative">
                        <input type={showPasswords.confirm ? 'text' : 'password'} name="confirm_password" value={passwordData.confirm_password} onChange={handlePasswordChange} required minLength={6} className="w-full px-4 py-3 pr-12 bg-white border-2 border-[#4A7FA7]/20 rounded-lg focus:border-[#4A7FA7] focus:outline-none" />
                        <button type="button" onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#4A7FA7]">
                          {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <button type="submit" disabled={loading} className="w-full px-6 py-3 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-semibold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
                      <Save className="w-5 h-5" />
                      {loading ? 'Menyimpan...' : 'Ubah Password'}
                    </button>
                    <button type="button" onClick={() => { setChangePasswordMode(false); setPasswordData({ current_password: '', new_password: '', confirm_password: '' }); }} disabled={loading} className="w-full px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all shadow-lg flex items-center justify-center gap-2">
                      <X className="w-5 h-5" />
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}