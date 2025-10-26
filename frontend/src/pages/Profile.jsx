import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar";
import html2canvas from 'html2canvas';
import QRCode from 'react-qr-code';
import { userService, daftarHadirService } from "../services/apiService";
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
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [ticketToRender, setTicketToRender] = useState(null);
  const [captureTicket, setCaptureTicket] = useState(false);
  const ticketRef = useRef(null);
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
        console.log("User response:", userResponse);
        const userData = userResponse.data.success ? userResponse.data.data : userResponse.data;

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

        // Fetch user registrations from API
        try {
          const registrationsResponse = await daftarHadirService.getAll();
          console.log('Registrations response:', registrationsResponse);
          
          if (registrationsResponse.data?.success) {
            const userRegistrations = registrationsResponse.data.data
              .filter(reg => {
                // Filter by user_id (primary) or email (fallback for old data)
                return reg.user_id === userData.id || reg.email === userData.email;
              })
              .map(reg => ({
                id: reg.id,
                title: reg.kegiatan?.judul_kegiatan || 'Event',
                date: reg.kegiatan?.waktu_mulai || reg.created_at,
                status: reg.status_kehadiran === 'hadir' ? 'attended' : 'registered',
                location: reg.kegiatan?.lokasi_kegiatan || 'TBA',
                certificate: reg.status_kehadiran === 'hadir',
                eventId: reg.kegiatan_id,
                token: reg.otp,
                ticketType: reg.tiket_dipilih || 'free',
                statusVerifikasi: reg.status_verifikasi,
                eventFlyer: reg.kegiatan?.flyer_url || reg.kegiatan?.flyer_kegiatan,
                eventDate: reg.kegiatan?.waktu_mulai,
                category: reg.kegiatan?.kategori?.nama_kategori || 'Kegiatan' // Extract nama_kategori from object
              }));
            
            setActivities(userRegistrations);
            setRegistrations(userRegistrations);
            console.log('User registrations:', userRegistrations);
          }
        } catch (error) {
          console.error('Error fetching registrations:', error);
        }

        // Mock certificates - will be replaced with real data from API
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

        // Only set certificates (activities and registrations already set from API above)
        setCertificates(mockCertificates);

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

  // Effect to capture ticket after render
  useEffect(() => {
    if (captureTicket && ticketRef.current) {
      const captureAndDownload = async () => {
        try {
          console.log('Capturing ticket...');
          
          // Wait a bit more for styles to apply
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const element = ticketRef.current;
          if (!element) {
            throw new Error('Ticket element not found');
          }

          console.log('Element ready, starting capture...');
          const canvas = await html2canvas(element, {
            scale: 3,
            backgroundColor: '#ffffff',
            logging: true,
            useCORS: true,
            allowTaint: true,
            foreignObjectRendering: false,
            removeContainer: true,
            imageTimeout: 0,
            onclone: (clonedDoc) => {
              // Ensure styles are applied in cloned document
              const clonedElement = clonedDoc.querySelector('[data-ticket-ref]');
              if (clonedElement) {
                clonedElement.style.display = 'block';
                clonedElement.style.visibility = 'visible';
              }
            }
          });

          console.log('Canvas created:', canvas.width, 'x', canvas.height);
          
          const link = document.createElement('a');
          const filename = `ticket-${(ticketToRender?.eventName || 'event').replace(/\s+/g, '-')}-${ticketToRender?.registrationId}.png`;
          link.download = filename;
          link.href = canvas.toDataURL('image/png');
          link.click();

          console.log('Ticket downloaded successfully');
        } catch (error) {
          console.error('Error capturing ticket:', error);
          alert('Gagal membuat tiket: ' + error.message);
        } finally {
          // Clear state
          setCaptureTicket(false);
          setTimeout(() => setTicketToRender(null), 500);
        }
      };

      captureAndDownload();
    }
  }, [captureTicket, ticketToRender]);

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
    setPreviewImage(null);
    setProfileImage(null);
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
      console.log("Starting profile update...");
      console.log("Edit form data:", editForm);
      console.log("Profile image:", profileImage);

      // Validasi frontend sebelum kirim
      if (editForm.no_handphone && editForm.no_handphone.length < 10) {
        alert("Nomor handphone minimal 10 digit");
        setLoading(false);
        return;
      }

      if (editForm.nama_lengkap && editForm.nama_lengkap.trim().length < 2) {
        alert("Nama lengkap minimal 2 karakter");
        setLoading(false);
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      
      // Only append fields that have values and are allowed to be updated
      if (editForm.nama_lengkap && editForm.nama_lengkap.trim() !== '') {
        formData.append('nama_lengkap', editForm.nama_lengkap.trim());
        console.log(`Added nama_lengkap: ${editForm.nama_lengkap}`);
      }
      
      if (editForm.no_handphone && editForm.no_handphone.trim() !== '') {
        formData.append('no_handphone', editForm.no_handphone.trim());
        console.log(`Added no_handphone: ${editForm.no_handphone}`);
      }
      
      if (editForm.alamat && editForm.alamat.trim() !== '') {
        formData.append('alamat', editForm.alamat.trim());
        console.log(`Added alamat: ${editForm.alamat}`);
      }
      
      if (editForm.pendidikan_terakhir && editForm.pendidikan_terakhir !== '') {
        formData.append('pendidikan_terakhir', editForm.pendidikan_terakhir);
        console.log(`Added pendidikan_terakhir: ${editForm.pendidikan_terakhir}`);
      }
      
      if (profileImage) {
        formData.append('profile_image', profileImage);
        console.log("Added profile image to FormData");
      }

      // Log FormData contents
      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      // Send updated data to backend
      console.log("Sending request to backend...");
      console.log("FormData type check:", formData instanceof FormData);
      
      let response;
      // Debug: Test with simple object first
      if (!profileImage) {
        console.log("No image, sending as regular object...");
        const simpleData = {};
        if (editForm.nama_lengkap && editForm.nama_lengkap.trim() !== '') {
          simpleData.nama_lengkap = editForm.nama_lengkap.trim();
        }
        if (editForm.no_handphone && editForm.no_handphone.trim() !== '') {
          simpleData.no_handphone = editForm.no_handphone.trim();
        }
        if (editForm.alamat && editForm.alamat.trim() !== '') {
          simpleData.alamat = editForm.alamat.trim();
        }
        if (editForm.pendidikan_terakhir && editForm.pendidikan_terakhir !== '') {
          simpleData.pendidikan_terakhir = editForm.pendidikan_terakhir;
        }
        console.log("Sending simple data:", simpleData);
        response = await userService.updateProfile(simpleData);
        console.log("Backend response:", response);
      } else {
        console.log("Has image, sending as FormData...");
        response = await userService.updateProfile(formData);
        console.log("Backend response:", response);
      }

      if (response.data && response.data.success) {
        // Update local state and localStorage
        const updatedUser = { ...user, ...editForm };
        if (response.data.profile_image_url) {
          updatedUser.profile_image = response.data.profile_image_url;
        }
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        setShowEditModal(false);
        setPreviewImage(null);
        setProfileImage(null);
        alert("Profil berhasil diperbarui!");
      } else {
        console.error("Update failed:", response.data);
        alert("Gagal memperbarui profil: " + (response.data?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      console.error("Error details:", error.response?.data);
      alert("Gagal memperbarui profil: " + (error.response?.data?.message || error.message || 'Unknown error'));
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
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

  const handleDownloadTicket = async (registration) => {
    try {
      // Format date helpers
      const formatDate = (dateString) => {
        if (!dateString) return 'TBA';
        try {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return 'TBA';
          return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        } catch (e) {
          return 'TBA';
        }
      };

      const formatTime = (dateString) => {
        if (!dateString) return 'TBA';
        try {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return 'TBA';
          return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
          });
        } catch (e) {
          return 'TBA';
        }
      };

      // Set ticket data untuk di-render
      setTicketToRender({
        eventName: registration.title || 'Event',
        category: registration.category || 'Kegiatan',
        registrationId: registration.id || '0',
        participantName: user?.nama_lengkap || 'N/A',
        email: user?.email || 'N/A',
        phone: user?.no_handphone || 'N/A',
        ticketType: registration.ticketType || 'free',
        eventDate: registration.date || '',
        location: registration.location || 'TBA',
        token: registration.token || 'N/A',
        eventId: registration.eventId || '',
        formatDate: formatDate(registration.date),
        formatTime: formatTime(registration.date)
      });

      // Trigger capture after component renders (useEffect will handle it)
      // Increased delay to ensure styles are fully loaded
      setTimeout(() => {
        console.log('Triggering capture...');
        setCaptureTicket(true);
      }, 1000);
    } catch (error) {
      console.error('Error generating ticket:', error);
      alert('Gagal membuat tiket. Silakan coba lagi.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative bg-gradient-to-br from-slate-100 via-blue-50/30 to-indigo-100/40 overflow-hidden">
        {/* ... */}
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
    <>
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

      <div className="min-h-screen relative">
        {/* Navbar Component */}
        <Navbar />

      {/* Hero Section with Ocean Background */}
      <div 
        className="relative h-[50vh] bg-cover bg-center bg-no-repeat pt-24"
        style={{ backgroundImage: `url(${oceanBg})` }}
      >
        {/* Overlay - No Blur */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-indigo-800/50 to-purple-900/60"></div>
        
        <div className="relative z-10 h-full flex items-center justify-center text-center px-4 pb-16">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
              Profil Saya
            </h1>
            <p className="text-lg md:text-xl text-white/95 max-w-2xl mx-auto drop-shadow-lg">
              Kelola profil, lihat aktivitas, dan sertifikat Anda
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <div className="mb-10">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border-2 border-white/60 relative overflow-hidden">
              <div className="relative z-10">
              <div className="flex items-center gap-6">
                {/* Enhanced Profile Avatar */}
                <div className="relative">
                  <div className="w-28 h-28 bg-gradient-to-br from-blue-500/80 via-indigo-600/80 to-purple-700/80 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl backdrop-blur-sm border border-white/20 transform hover:scale-105 transition-all duration-300 overflow-hidden">
                    {user?.profile_image ? (
                      <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user?.nama_lengkap?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500/80 backdrop-blur-sm rounded-full border-4 border-white/50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
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
                <div className="flex gap-4">
                  <button
                    onClick={handleEditProfile}
                    className="px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-[#0A1931] rounded-xl font-semibold hover:bg-white/30 hover:border-white/50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profil
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-red-600 rounded-xl font-semibold hover:bg-red-50/50 hover:border-red-200/50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Keluar
                  </button>
                </div>
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
            {/* Profile Data Section */}
            {activeSection === "profile" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#0A1931] mb-6">Informasi Profil</h2>
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
                      <div key={activity.id} className="bg-white backdrop-blur-xl rounded-xl overflow-hidden border-2 border-blue-100 hover:shadow-2xl hover:border-blue-300 transition-all transform hover:-translate-y-1">
                        {/* Event Flyer */}
                        {(() => {
                          let flyerSrc = null;
                          if (activity.eventFlyer) {
                            if (activity.eventFlyer.startsWith('http://') || activity.eventFlyer.startsWith('https://')) {
                              flyerSrc = activity.eventFlyer;
                            } else {
                              flyerSrc = `http://localhost:8000/storage/${activity.eventFlyer}`;
                            }
                          }
                          
                          return flyerSrc ? (
                            <div className="relative h-48 overflow-hidden">
                              <img 
                                src={flyerSrc}
                                alt={activity.title} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                              <div className="absolute top-2 right-2">
                                <div className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${
                                  activity.status === 'completed'
                                    ? 'bg-green-500/90 text-white'
                                    : 'bg-blue-500/90 text-white'
                                }`}>
                                  {activity.status === 'completed' ? 'Selesai' : 'Hadir'}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="relative h-48 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 flex items-center justify-center">
                              <svg className="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <div className="absolute top-2 right-2">
                                <div className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${
                                  activity.status === 'completed'
                                    ? 'bg-green-500/90 text-white'
                                    : 'bg-blue-500/90 text-white'
                                }`}>
                                  {activity.status === 'completed' ? 'Selesai' : 'Hadir'}
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        <div className="p-6">
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
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-2 text-green-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                              </svg>
                              <span className="text-sm font-semibold">Sertifikat tersedia</span>
                            </div>
                          </div>
                        )}
                        </div>
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
                      <div key={certificate.id} className="bg-white backdrop-blur-xl rounded-xl p-6 border-2 border-green-100 hover:shadow-2xl hover:border-green-300 transition-all transform hover:-translate-y-1">
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
                      <div key={registration.id} className="bg-white backdrop-blur-xl rounded-xl overflow-hidden border-2 border-indigo-100 hover:shadow-2xl hover:border-indigo-300 transition-all transform hover:-translate-y-1">
                        {/* Event Flyer */}
                        {(() => {
                          let flyerSrc = null;
                          if (registration.eventFlyer) {
                            if (registration.eventFlyer.startsWith('http://') || registration.eventFlyer.startsWith('https://')) {
                              flyerSrc = registration.eventFlyer;
                            } else {
                              flyerSrc = `http://localhost:8000/storage/${registration.eventFlyer}`;
                            }
                          }
                          
                          return flyerSrc ? (
                            <div className="relative h-48 overflow-hidden">
                              <img 
                                src={flyerSrc}
                                alt={registration.title} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                              <div className="absolute top-2 right-2">
                                <div className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${
                                  registration.status === 'registered'
                                    ? 'bg-green-500/90 text-white'
                                    : 'bg-yellow-500/90 text-white'
                                }`}>
                                  {registration.status === 'registered' ? 'Terdaftar' : 'Menunggu'}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="relative h-48 bg-gradient-to-br from-indigo-400/20 to-purple-500/20 flex items-center justify-center">
                              <svg className="w-16 h-16 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <div className="absolute top-2 right-2">
                                <div className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${
                                  registration.status === 'registered'
                                    ? 'bg-green-500/90 text-white'
                                    : 'bg-yellow-500/90 text-white'
                                }`}>
                                  {registration.status === 'registered' ? 'Terdaftar' : 'Menunggu'}
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        <div className="p-6">
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

                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                          <p className="text-xs text-[#4A7FA7]/70">
                            Status: <span className={`font-semibold ${
                              registration.status === 'registered' ? 'text-green-600' : 'text-yellow-600'
                            }`}>
                              {registration.status === 'registered' ? 'Pendaftaran berhasil' : 'Menunggu konfirmasi'}
                            </span>
                          </p>
                          <button
                            onClick={() => handleDownloadTicket(registration)}
                            className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-4-4m4 4l4-4m-4 4V3m6 13v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6" />
                            </svg>
                            Download Tiket
                          </button>
                        </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                {/* Profile Photo Upload */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-500/80 via-indigo-600/80 to-purple-700/80 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-2xl backdrop-blur-sm border border-white/20 overflow-hidden">
                      {previewImage ? (
                        <img src={previewImage} alt="Preview" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        user?.nama_lengkap?.charAt(0)?.toUpperCase() || 'U'
                      )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-500/80 backdrop-blur-sm rounded-full border-4 border-white/50 flex items-center justify-center cursor-pointer hover:bg-blue-600/80 transition-all">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-[#4A7FA7]">Klik ikon kamera untuk mengubah foto profil</p>
                </div>

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
                      disabled
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
                      placeholder="Email tidak dapat diubah"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah setelah registrasi</p>
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
                      <option value="SD/MI">SD/MI</option>
                      <option value="SMP/MTS">SMP/MTS</option>
                      <option value="SMA/SMK">SMA/SMK</option>
                      <option value="Diploma/Sarjana">Diploma/Sarjana</option>
                      <option value="Lainnya">Lainnya</option>
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
      
      {/* Hidden Ticket Component for Download */}
      {ticketToRender && (
        <div style={{ position: 'fixed', left: '-9999px', top: '0', zIndex: 9999 }}>
          <div ref={ticketRef} data-ticket-ref className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl overflow-hidden border-2 border-[#4A7FA7]/20 shadow-lg" style={{ width: '800px', display: 'block', visibility: 'visible' }}>
            {/* Ticket Header */}
            <div className="bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] p-6 relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                    <span className="text-white/80 text-sm font-semibold">E-TICKET</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">{ticketToRender.eventName}</h3>
                  <p className="text-white/80 text-sm">Kategori: {ticketToRender.category || 'Event'}</p>
                </div>
                <div className="text-right">
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <p className="text-white/80 text-xs mb-1">ID Tiket</p>
                    <p className="text-white font-bold text-lg">#{ticketToRender.registrationId}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dotted Line Separator */}
            <div className="relative h-8 bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="absolute top-1/2 left-0 w-full border-t-2 border-dashed border-[#4A7FA7]/30 -translate-y-1/2"></div>
              <div className="absolute top-1/2 -left-4 w-8 h-8 bg-white rounded-full -translate-y-1/2 shadow-lg"></div>
              <div className="absolute top-1/2 -right-4 w-8 h-8 bg-white rounded-full -translate-y-1/2 shadow-lg"></div>
            </div>

            {/* Ticket Body */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Left Side - Info */}
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-[#4A7FA7] font-semibold mb-1">NAMA PESERTA</p>
                    <p className="text-[#0A1931] font-bold text-lg">{ticketToRender.participantName}</p>
                  </div>

                  <div>
                    <p className="text-xs text-[#4A7FA7] font-semibold mb-1">EMAIL</p>
                    <p className="text-[#0A1931] font-medium">{ticketToRender.email}</p>
                  </div>

                  <div>
                    <p className="text-xs text-[#4A7FA7] font-semibold mb-1">NO. TELEPON</p>
                    <p className="text-[#0A1931] font-medium">{ticketToRender.phone}</p>
                  </div>

                  {ticketToRender.ticketType && (
                    <div>
                      <p className="text-xs text-[#4A7FA7] font-semibold mb-1">PAKET TIKET</p>
                      <p className="text-[#0A1931] font-bold">{ticketToRender.ticketType}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-[#4A7FA7] font-semibold mb-1">TANGGAL & WAKTU</p>
                    <p className="text-[#0A1931] font-medium">{ticketToRender.formatDate}</p>
                    <p className="text-[#0A1931] font-medium">{ticketToRender.formatTime} WIB</p>
                  </div>

                  <div>
                    <p className="text-xs text-[#4A7FA7] font-semibold mb-1">LOKASI</p>
                    <p className="text-[#0A1931] font-medium">{ticketToRender.location}</p>
                  </div>
                </div>

                {/* Right Side - QR Code */}
                <div className="flex flex-col items-center justify-center">
                  <div className="bg-white p-4 rounded-2xl shadow-lg border-2 border-[#4A7FA7]/20">
                    <QRCode
                      value={JSON.stringify({
                        registrationId: ticketToRender.registrationId,
                        token: ticketToRender.token,
                        email: ticketToRender.email,
                        eventId: ticketToRender.eventId
                      })}
                      size={180}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    />
                  </div>
                  <p className="text-xs text-[#4A7FA7] text-center mt-3 font-semibold">
                    Scan QR Code untuk Check-in
                  </p>
                  <p className="text-xs text-[#0A1931] text-center mt-1 font-mono bg-white px-3 py-1 rounded-lg">
                    {ticketToRender.token}
                  </p>
                </div>
              </div>

              {/* Important Notes */}
              <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                <div className="flex gap-2">
                  <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-bold text-yellow-800 mb-1">Catatan Penting:</p>
                    <ul className="text-xs text-yellow-700 space-y-1">
                      <li>• Simpan tiket ini dengan baik</li>
                      <li>• Tunjukkan QR Code saat check-in di lokasi event</li>
                      <li>• Datang 15 menit sebelum acara dimulai</li>
                      <li>• Tiket ini tidak dapat dipindahtangankan</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Footer */}
            <div className="bg-[#0A1931] p-4 text-center">
              <p className="text-white/60 text-xs">Powered by DYNOTIX Event Platform</p>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
