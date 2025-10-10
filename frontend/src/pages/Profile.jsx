import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import AssistiveTouchNav from "../components/AssistiveTouchNav";
import { userService } from "../services/apiService";
import oceanBg from "../assets/ocean.jpg";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [activeSection, setActiveSection] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editForm, setEditForm] = useState({
    nama_lengkap: '',
    email: '',
    no_handphone: '',
    alamat: '',
    pendidikan_terakhir: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if user has valid token
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // Fetch user data from API
        const userResponse = await userService.getCurrentUser();
        const userData = userResponse.data;

        setUser(userData);
        setEditForm({
          nama_lengkap: userData.nama_lengkap || '',
          email: userData.email || '',
          no_handphone: userData.no_handphone || '',
          alamat: userData.alamat || '',
          pendidikan_terakhir: userData.pendidikan_terakhir || ''
        });

        // Save to localStorage for offline access
        localStorage.setItem("user", JSON.stringify(userData));

        // Initialize mock data for activities, certificates, and registrations
        // In real implementation, these would come from dedicated API endpoints
        const mockActivities = [
          {
            id: 1,
            title: "Workshop Digital Marketing",
            date: "2024-01-15",
            status: "completed",
            location: "Jakarta",
            certificate: true
          },
          {
            id: 2,
            title: "Seminar Teknologi AI",
            date: "2024-02-20",
            status: "completed",
            location: "Bandung",
            certificate: true
          },
          {
            id: 3,
            title: "Konser Musik Akustik",
            date: "2024-03-10",
            status: "attended",
            location: "Surabaya",
            certificate: false
          }
        ];

        const mockCertificates = [
          {
            id: 1,
            title: "Sertifikat Workshop Digital Marketing",
            event: "Workshop Digital Marketing",
            date: "2024-01-15",
            fileUrl: "#"
          },
          {
            id: 2,
            title: "Sertifikat Seminar Teknologi AI",
            event: "Seminar Teknologi AI",
            date: "2024-02-20",
            fileUrl: "#"
          }
        ];

        const mockRegistrations = [
          {
            id: 1,
            title: "Konferensi Startup Indonesia 2024",
            date: "2024-12-15",
            status: "registered",
            location: "Jakarta"
          },
          {
            id: 2,
            title: "Webinar Blockchain Technology",
            date: "2024-12-20",
            status: "pending",
            location: "Online"
          }
        ];

        setActivities(mockActivities);
        setCertificates(mockCertificates);
        setRegistrations(mockRegistrations);

      } catch (error) {
        console.error("Error fetching user data:", error);

        // If API fails, try to use localStorage data
        const localUserData = localStorage.getItem("user");
        if (localUserData) {
          try {
            const userInfo = JSON.parse(localUserData);
            setUser(userInfo);
            setEditForm({
              nama_lengkap: userInfo.nama_lengkap || '',
              email: userInfo.email || '',
              no_handphone: userInfo.no_handphone || '',
              alamat: userInfo.alamat || '',
              pendidikan_terakhir: userInfo.pendidikan_terakhir || ''
            });

            // Set mock data
            setActivities([]);
            setCertificates([]);
            setRegistrations([]);
          } catch (parseError) {
            console.error("Error parsing localStorage data:", parseError);
            setError("Gagal memuat data pengguna");
          }
        } else {
          setError("Tidak dapat mengakses data pengguna. Silakan login kembali.");
          setTimeout(() => navigate("/login"), 3000);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await userService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    // Reset form to original values
    if (user) {
      setEditForm({
        nama_lengkap: user.nama_lengkap || '',
        email: user.email || '',
        no_handphone: user.no_handphone || '',
        alamat: user.alamat || '',
        pendidikan_terakhir: user.pendidikan_terakhir || ''
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);

      // Send updated data to backend
      const response = await userService.updateProfile(editForm);

      if (response.data.success) {
        // Update local state and localStorage
        const updatedUser = { ...user, ...editForm };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        setShowEditModal(false);
        alert("Profil berhasil diperbarui!");
      } else {
        alert("Gagal memperbarui profil: " + response.data.message);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Gagal memperbarui profil. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleSavePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Password baru dan konfirmasi password tidak cocok!");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert("Password baru minimal 6 karakter!");
      return;
    }

    // Here you would typically send the data to your backend API
    // For now, we'll just simulate success
    setShowPasswordModal(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    alert("Password berhasil diubah!");
  };

  const handleDownloadCertificate = (certificate) => {
    // Here you would typically download the certificate file
    // For now, we'll just show an alert
    alert(`Mengunduh sertifikat: ${certificate.title}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen relative bg-gradient-to-br from-slate-100 via-blue-50/30 to-indigo-100/40 overflow-hidden">
        <Navbar />
        <div className="pt-24 pb-12 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative bg-gradient-to-br from-slate-100 via-blue-50/30 to-indigo-100/40 overflow-hidden">
        <Navbar />
        <div className="pt-24 pb-12 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Terjadi Kesalahan</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-slate-100 via-blue-50/30 to-indigo-100/40 overflow-hidden">
      {/* Animated Background Accent - Glassmorphism Theme with Bubbles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Large Blur Blobs - Gradient Theme */}
        <div className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-blue-400/25 to-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/20 to-pink-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-[450px] h-[450px] bg-gradient-to-br from-cyan-400/20 to-blue-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

        {/* Floating Transparent Bubbles - Gradient Theme */}
        <div className="absolute top-32 left-[15%] w-24 h-24 border-2 border-blue-400/50 rounded-full animate-float bg-gradient-to-br from-blue-200/20 to-indigo-300/15"></div>
        <div className="absolute top-64 right-[20%] w-32 h-32 border-2 border-purple-400/45 rounded-full animate-float bg-gradient-to-br from-purple-200/20 to-pink-300/15" style={{ animationDelay: '1.5s', animationDuration: '8s' }}></div>
        <div className="absolute bottom-40 left-[25%] w-20 h-20 border-2 border-cyan-400/50 rounded-full animate-float bg-gradient-to-br from-cyan-200/20 to-blue-300/15" style={{ animationDelay: '3s', animationDuration: '10s' }}></div>
      </div>

      {/* Animation Keyframes */}
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

      {/* Navbar Component */}
      <Navbar />

      {/* Main Content */}
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <div className="mb-8">
            <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20">
              <div className="flex items-center gap-6">
                {/* Profile Avatar */}
                <div className="w-24 h-24 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {user?.nama_lengkap?.charAt(0)?.toUpperCase() || 'U'}
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-[#0A1931] mb-2">
                    {user?.nama_lengkap || 'Nama Pengguna'}
                  </h1>
                  <p className="text-[#4A7FA7] text-lg mb-3">
                    {user?.email || 'email@example.com'}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-[#4A7FA7]">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {user?.email || 'email@example.com'}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {user?.no_handphone || '08123456789'}
                    </span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleEditProfile}
                    className="px-6 py-3 bg-[#4A7FA7] text-white rounded-full font-semibold hover:bg-[#4A7FA7]/80 transition-all shadow-lg hover:shadow-xl"
                  >
                    Edit Profil
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/30 text-[#0A1931] rounded-full font-semibold hover:bg-white/20 transition-all"
                  >
                    Keluar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-8">
            <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20">
              <div className="flex flex-wrap gap-2 p-4">
                {[
                  { id: "profile", label: "Profil", icon: "user" },
                  { id: "activities", label: "Riwayat Kegiatan", icon: "calendar" },
                  { id: "certificates", label: "Sertifikat", icon: "award" },
                  { id: "registrations", label: "Pendaftaran", icon: "clipboard" },
                  { id: "token", label: "Token Hadir", icon: "key" },
                  { id: "password", label: "Ubah Password", icon: "lock" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                      activeSection === tab.id
                        ? "bg-[#4A7FA7] text-white shadow-lg"
                        : "text-[#4A7FA7] hover:bg-[#4A7FA7]/10 hover:text-[#4A7FA7]"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {tab.icon === "user" && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      )}
                      {tab.icon === "calendar" && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      )}
                      {tab.icon === "award" && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                      )}
                      {tab.icon === "clipboard" && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      )}
                      {tab.icon === "key" && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      )}
                      {tab.icon === "lock" && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      )}
                    </svg>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8">
            {/* Header with Back Button */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/")}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/30 rounded-full text-[#4A7FA7] hover:bg-white/20 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Kembali ke Beranda
                </button>
                <h2 className="text-2xl font-bold text-[#0A1931]">Informasi Profil</h2>
              </div>
            </div>

            {/* Profile Data Section */}
            {activeSection === "profile" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#4A7FA7] mb-2">Nama Lengkap</label>
                      <div className="bg-white/50 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-3 text-[#0A1931]">
                        {user?.nama_lengkap || 'Belum diisi'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#4A7FA7] mb-2">Email</label>
                      <div className="bg-white/50 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-3 text-[#0A1931]">
                        {user?.email || 'Belum diisi'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#4A7FA7] mb-2">Nomor Handphone</label>
                      <div className="bg-white/50 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-3 text-[#0A1931]">
                        {user?.no_handphone || 'Belum diisi'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#4A7FA7] mb-2">Alamat</label>
                      <div className="bg-white/50 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-3 text-[#0A1931]">
                        {user?.alamat || 'Belum diisi'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#4A7FA7] mb-2">Pendidikan Terakhir</label>
                      <div className="bg-white/50 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-3 text-[#0A1931]">
                        {user?.pendidikan_terakhir || 'Belum diisi'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Activity History Section */}
            {activeSection === "activities" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#0A1931] mb-6">Riwayat Kegiatan</h2>

                {activities.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-[#4A7FA7] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-[#4A7FA7] text-lg">Belum ada riwayat kegiatan</p>
                    <p className="text-[#4A7FA7]/70 text-sm mt-2">Kegiatan yang pernah Anda ikuti akan muncul di sini</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activities.map((activity) => (
                      <div key={activity.id} className="bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl p-6 hover:shadow-lg transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            activity.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {activity.status === 'completed' ? 'Selesai' : 'Hadir'}
                          </div>
                        </div>

                        <h3 className="font-bold text-[#0A1931] mb-2">{activity.title}</h3>
                        <div className="space-y-2 text-sm text-[#4A7FA7]">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {activity.location}
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(activity.date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </div>
                        </div>

                        {activity.certificate && (
                          <div className="mt-4 pt-4 border-t border-white/30">
                            <div className="flex items-center gap-2 text-green-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                              </svg>
                              <span className="text-sm font-semibold">Sertifikat tersedia</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Certificates Section */}
            {activeSection === "certificates" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#0A1931] mb-6">Sertifikat</h2>

                {certificates.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-[#4A7FA7] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <p className="text-[#4A7FA7] text-lg">Belum ada sertifikat</p>
                    <p className="text-[#4A7FA7]/70 text-sm mt-2">Sertifikat dari kegiatan yang Anda ikuti akan muncul di sini</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certificates.map((certificate) => (
                      <div key={certificate.id} className="bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl p-6 hover:shadow-lg transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                          </div>
                          <button
                            onClick={() => handleDownloadCertificate(certificate)}
                            className="px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition-all flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l4-4m-4 4l-4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Download
                          </button>
                        </div>

                        <h3 className="font-bold text-[#0A1931] mb-2">{certificate.title}</h3>
                        <p className="text-sm text-[#4A7FA7] mb-3">{certificate.event}</p>
                        <div className="text-xs text-[#4A7FA7]/70">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(certificate.date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Registration Status Section */}
            {activeSection === "registrations" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#0A1931] mb-6">Status Pendaftaran</h2>

                {registrations.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-[#4A7FA7] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-[#4A7FA7] text-lg">Belum ada pendaftaran aktif</p>
                    <p className="text-[#4A7FA7]/70 text-sm mt-2">Status pendaftaran kegiatan Anda akan muncul di sini</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {registrations.map((registration) => (
                      <div key={registration.id} className="bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl p-6 hover:shadow-lg transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            registration.status === 'registered'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {registration.status === 'registered' ? 'Terdaftar' : 'Menunggu'}
                          </div>
                        </div>

                        <h3 className="font-bold text-[#0A1931] mb-2">{registration.title}</h3>
                        <div className="space-y-2 text-sm text-[#4A7FA7]">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {registration.location}
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(registration.date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/30">
                          <p className="text-xs text-[#4A7FA7]/70">
                            Status: <span className={`font-semibold ${
                              registration.status === 'registered' ? 'text-green-600' : 'text-yellow-600'
                            }`}>
                              {registration.status === 'registered' ? 'Pendaftaran berhasil' : 'Menunggu konfirmasi'}
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Attendance Token Section */}
            {activeSection === "token" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#0A1931] mb-6">Token Kehadiran</h2>
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-[#4A7FA7] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  <p className="text-[#4A7FA7] text-lg">Token Kehadiran</p>
                  <div className="mt-4 p-6 bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg">
                    <p className="text-2xl font-mono font-bold text-[#0A1931]">
                      {user?.token_kehadiran || 'TOKEN-123456'}
                    </p>
                    <p className="text-[#4A7FA7]/70 text-sm mt-2">Tunjukkan token ini saat daftar hadir</p>
                  </div>
                </div>
              </div>
            )}

            {/* Change Password Section */}
            {activeSection === "password" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#0A1931] mb-6">Ubah Password</h2>
                <div className="max-w-md mx-auto">
                  <div className="text-center py-8">
                    <p className="text-[#4A7FA7] mb-6">Ubah password akun Anda untuk menjaga keamanan</p>
                    <button
                      onClick={handleChangePassword}
                      className="px-8 py-4 bg-[#4A7FA7] text-white rounded-full font-semibold hover:bg-[#4A7FA7]/80 transition-all shadow-lg text-lg"
                    >
                      Ubah Password
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assistive Touch Navigation */}
      <AssistiveTouchNav />

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#F6FAFD]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#0A1931]">Edit Profil</h2>
                <button
                  onClick={handleCloseModal}
                  className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-[#0A1931] hover:bg-white/30 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#4A7FA7] mb-2">Nama Lengkap</label>
                    <input
                      type="text"
                      name="nama_lengkap"
                      value={editForm.nama_lengkap}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/30 rounded-lg text-[#0A1931] focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-transparent"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#4A7FA7] mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/30 rounded-lg text-[#0A1931] focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-transparent"
                      placeholder="Masukkan email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#4A7FA7] mb-2">Nomor Handphone</label>
                    <input
                      type="tel"
                      name="no_handphone"
                      value={editForm.no_handphone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/30 rounded-lg text-[#0A1931] focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-transparent"
                      placeholder="Masukkan nomor handphone"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#4A7FA7] mb-2">Pendidikan Terakhir</label>
                    <select
                      name="pendidikan_terakhir"
                      value={editForm.pendidikan_terakhir}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/30 rounded-lg text-[#0A1931] focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-transparent"
                    >
                      <option value="">Pilih pendidikan terakhir</option>
                      <option value="SMA">SMA/SMK</option>
                      <option value="D3">Diploma 3</option>
                      <option value="S1">Strata 1</option>
                      <option value="S2">Strata 2</option>
                      <option value="S3">Strata 3</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#4A7FA7] mb-2">Alamat</label>
                  <textarea
                    name="alamat"
                    value={editForm.alamat}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/30 rounded-lg text-[#0A1931] focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-transparent resize-none"
                    placeholder="Masukkan alamat lengkap"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleSaveProfile}
                    className="flex-1 px-6 py-3 bg-[#4A7FA7] text-white rounded-full font-semibold hover:bg-[#4A7FA7]/80 transition-all shadow-lg"
                  >
                    Simpan Perubahan
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/30 text-[#0A1931] rounded-full font-semibold hover:bg-white/20 transition-all"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#F6FAFD]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 w-full max-w-md">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#0A1931]">Ubah Password</h2>
                <button
                  onClick={handleClosePasswordModal}
                  className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-[#0A1931] hover:bg-white/30 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-[#4A7FA7] mb-2">Password Saat Ini</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordInputChange}
                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/30 rounded-lg text-[#0A1931] focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-transparent"
                    placeholder="Masukkan password saat ini"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#4A7FA7] mb-2">Password Baru</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordInputChange}
                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/30 rounded-lg text-[#0A1931] focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-transparent"
                    placeholder="Masukkan password baru (min. 6 karakter)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#4A7FA7] mb-2">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordInputChange}
                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/30 rounded-lg text-[#0A1931] focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-transparent"
                    placeholder="Konfirmasi password baru"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleSavePassword}
                    className="flex-1 px-6 py-3 bg-[#4A7FA7] text-white rounded-full font-semibold hover:bg-[#4A7FA7]/80 transition-all shadow-lg"
                  >
                    Ubah Password
                  </button>
                  <button
                    onClick={handleClosePasswordModal}
                    className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/30 text-[#0A1931] rounded-full font-semibold hover:bg-white/20 transition-all"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
