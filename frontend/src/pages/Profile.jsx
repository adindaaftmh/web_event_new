import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar";
import html2canvas from 'html2canvas';
import QRCode from 'react-qr-code';
import jsPDF from 'jspdf';
import { userService, daftarHadirService } from "../services/apiService";
import oceanBg from "../assets/ocean.jpg";
import { downloadCertificate } from "../components/CertificateGenerator";

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
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteAccountConfirmText, setDeleteAccountConfirmText] = useState('');
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
  
  // Pagination and search states
  const [currentPageActivities, setCurrentPageActivities] = useState(1);
  const [currentPageCertificates, setCurrentPageCertificates] = useState(1);
  const [currentPageRegistrations, setCurrentPageRegistrations] = useState(1);
  const [searchQueryActivities, setSearchQueryActivities] = useState('');
  const [searchQueryCertificates, setSearchQueryCertificates] = useState('');
  const [searchQueryRegistrations, setSearchQueryRegistrations] = useState('');
  const itemsPerPage = 4;

  // Helper function to filter and paginate data
  const getPaginatedData = (data, searchQuery, currentPage) => {
    // Filter by search query
    const filtered = data.filter(item =>
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.event?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate pagination
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filtered.slice(startIndex, endIndex);

    return { paginatedData, totalPages, totalItems: filtered.length };
  };

  // Get paginated data for each section
  const activitiesData = getPaginatedData(activities, searchQueryActivities, currentPageActivities);
  const certificatesData = getPaginatedData(certificates, searchQueryCertificates, currentPageCertificates);
  const registrationsData = getPaginatedData(registrations, searchQueryRegistrations, currentPageRegistrations);

  // Navigation functions for activities
  const nextActivities = () => {
    const totalPages = activitiesData.totalPages;
    if (totalPages === 0) return;
    setCurrentPageActivities((prev) => (prev + 1 > totalPages ? 1 : prev + 1));
  };

  const prevActivities = () => {
    const totalPages = activitiesData.totalPages;
    if (totalPages === 0) return;
    setCurrentPageActivities((prev) => (prev - 1 < 1 ? totalPages : prev - 1));
  };

  // Navigation functions for registrations
  const nextRegistrations = () => {
    const totalPages = registrationsData.totalPages;
    if (totalPages === 0) return;
    setCurrentPageRegistrations((prev) => (prev + 1 > totalPages ? 1 : prev + 1));
  };

  const prevRegistrations = () => {
    const totalPages = registrationsData.totalPages;
    if (totalPages === 0) return;
    setCurrentPageRegistrations((prev) => (prev - 1 < 1 ? totalPages : prev - 1));
  };

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPageActivities(1);
  }, [searchQueryActivities]);

  useEffect(() => {
    setCurrentPageCertificates(1);
  }, [searchQueryCertificates]);

  useEffect(() => {
    setCurrentPageRegistrations(1);
  }, [searchQueryRegistrations]);

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
              .map(reg => {
                // Check if event has already happened (past event)
                const eventDate = reg.kegiatan?.waktu_mulai ? new Date(reg.kegiatan.waktu_mulai) : null;
                const isPastEvent = eventDate ? eventDate < new Date() : false;
                
                // Determine status - backward compatible
                const statusKehadiran = reg.status_kehadiran || 'tidak_hadir';
                const isAttended = statusKehadiran === 'hadir';
                
                // More flexible certificate logic for backward compatibility
                // Certificate available if:
                // 1. User has been marked as attended (status_kehadiran = 'hadir'), OR
                // 2. Event is past AND registration exists (any status), OR
                // 3. Event is past AND verified (status_verifikasi = 'approved' or null/undefined for old data)
                const hasValidRegistration = reg.id && reg.kegiatan_id; // Has valid registration record
                const isVerified = !reg.status_verifikasi || reg.status_verifikasi === 'approved' || reg.status_verifikasi === 'pending';
                
                // Lenient certificate logic - if user registered for past event, allow certificate
                const canGetCertificate = isAttended || (isPastEvent && hasValidRegistration && isVerified);
                
                console.log(`Event: ${reg.kegiatan?.judul_kegiatan}`, {
                  isPastEvent,
                  statusKehadiran,
                  isAttended,
                  status_verifikasi: reg.status_verifikasi,
                  hasValidRegistration,
                  isVerified,
                  canGetCertificate
                });
                
                return {
                  id: reg.id,
                  title: reg.kegiatan?.judul_kegiatan || 'Event',
                  date: reg.kegiatan?.waktu_mulai || reg.created_at,
                  status: isAttended ? 'attended' : 'registered',
                  location: reg.kegiatan?.lokasi_kegiatan || 'TBA',
                  certificate: canGetCertificate,
                  eventId: reg.kegiatan_id,
                  token: reg.otp,
                  ticketType: reg.tiket_dipilih || 'free',
                  statusVerifikasi: reg.status_verifikasi,
                  eventFlyer: reg.kegiatan?.flyer_url || reg.kegiatan?.flyer_kegiatan,
                  eventDate: reg.kegiatan?.waktu_mulai,
                  eventEndDate: reg.kegiatan?.waktu_selesai || reg.kegiatan?.waktu_mulai, // Add end date
                  category: reg.kegiatan?.kategori?.nama_kategori || 'Kegiatan',
                  rawStatusKehadiran: statusKehadiran, // Keep raw status for debugging
                  isPastEvent: isPastEvent
                };
              });
            
            // Sort by date (newest first)
            const sortedRegistrations = userRegistrations.sort((a, b) => {
              const dateA = new Date(a.date);
              const dateB = new Date(b.date);
              return dateB - dateA;
            });
            
            setActivities(sortedRegistrations);
            setRegistrations(sortedRegistrations);
            
            // Generate certificates list from events that can get certificate
            const eventsWithCertificate = sortedRegistrations.filter(reg => reg.certificate);
            const certificatesList = eventsWithCertificate.map(event => ({
              id: event.id,
              title: `Sertifikat ${event.title}`,
              event: event.title,
              date: event.date,
              category: event.category,
              fileUrl: "#" // Will be generated on download
            }));
            
            setCertificates(certificatesList);
            console.log('User registrations:', sortedRegistrations);
            console.log('Events with certificate:', eventsWithCertificate);
            console.log('Certificates list:', certificatesList);
          }
        } catch (error) {
          console.error('Error fetching registrations:', error);
        }

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

  const handleCloseDeleteAccountModal = () => {
    setShowDeleteAccountModal(false);
    setDeleteAccountConfirmText('');
  };

  const handleDeleteAccount = async () => {
    if (deleteAccountConfirmText !== 'HAPUS AKUN SAYA') {
      alert('Silakan ketik "HAPUS AKUN SAYA" untuk mengonfirmasi penghapusan akun.');
      return;
    }

    if (!window.confirm('Apakah Anda yakin ingin menghapus akun Anda? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }

    try {
      setLoading(true);
      await userService.deleteAccount();
      
      // Clear local storage and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      alert('Akun Anda telah berhasil dihapus.');
      navigate("/login");
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Gagal menghapus akun: " + (error.response?.data?.message || error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = async (certificate) => {
    try {
      // Generate certificate number
      const certNumber = `CERT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
      
      // Get event dates from certificate
      // certificate.eventDate is the start date from kegiatan.waktu_mulai
      // We need to get waktu_selesai for end date
      const eventStartDate = certificate.eventDate || certificate.date;
      const eventEndDate = certificate.eventEndDate || eventStartDate; // If no end date, use start date
      
      // Create certificate data using template
      const certificateData = {
        participantName: user?.nama_lengkap || 'Peserta',
        eventName: certificate.title || certificate.event,
        eventDate: eventStartDate, // ISO format untuk di-parse
        eventEndDate: eventEndDate, // ISO format untuk calculate issue date
        certificateNumber: certNumber,
        category: certificate.category || 'peserta'
      };

      console.log('Certificate data:', certificateData); // Debug

      // Use the certificate generator
      const result = await downloadCertificate(certificateData);

      if (result.success) {
        alert(`✅ Sertifikat Berhasil Diunduh!\n\n📄 Nomor Sertifikat: ${certNumber}\n🎨 Desain: Template Dynotix\n📁 File: ${result.fileName}\n\nTerima kasih telah menggunakan platform Dynotix!`);
      } else {
        throw new Error(result.error || 'Gagal membuat sertifikat');
      }
      
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('❌ Terjadi Kesalahan\n\nGagal membuat sertifikat. Silakan coba lagi.\n\nDetail Error: ' + error.message);
    }
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
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
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
          
          {/* Navigation Tabs - Simple Homepage Style */}
          <div className="mb-8">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border-2 border-[#4A7FA7]/10 overflow-hidden">
              {/* Horizontal Scrollable Container for Mobile */}
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-6 min-w-max px-6">
                  {[
                    { id: "profile", label: "Profil", icon: "user" },
                    { id: "activities", label: "Riwayat Kegiatan", icon: "calendar" },
                    { id: "certificates", label: "Sertifikat", icon: "award" },
                    { id: "registrations", label: "Pendaftaran", icon: "clipboard" },
                    { id: "password", label: "Ubah Password", icon: "lock" },
                    { id: "delete-account", label: "Hapus Akun", icon: "trash" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSection(tab.id)}
                      className={`relative flex items-center gap-2 px-3 py-4 transition-all duration-300 whitespace-nowrap border-b-3 ${
                        activeSection === tab.id
                          ? "text-[#1A3D63] border-[#4A7FA7]"
                          : "text-[#4A7FA7] hover:text-[#1A3D63] border-transparent hover:border-[#4A7FA7]/30"
                      }`}
                    >
                      {/* Icon */}
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {tab.icon === "user" && (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        )}
                        {tab.icon === "calendar" && (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        )}
                        {tab.icon === "award" && (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        )}
                        {tab.icon === "clipboard" && (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        )}
                        {tab.icon === "lock" && (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        )}
                        {tab.icon === "trash" && (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        )}
                      </svg>
                      
                      {/* Label */}
                      <span className={`text-sm transition-all duration-300 ${
                        activeSection === tab.id ? 'font-bold' : 'font-semibold'
                      }`}>
                        {tab.label}
                      </span>
                      
                      {/* Active Indicator - Bottom Line */}
                      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] transition-all duration-300 ${
                        activeSection === tab.id ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                      }`}></div>
                    </button>
                  ))}
                </div>
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
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#0A1931]">Riwayat Kegiatan</h2>
                  {activities.length > 0 && (
                    <span className="text-sm text-[#4A7FA7] bg-[#F6FAFD] px-3 py-1 rounded-full">
                      {activitiesData.totalItems} kegiatan
                    </span>
                  )}
                </div>

                {/* Search Bar */}
                {activities.length > 0 && (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Cari kegiatan berdasarkan judul, lokasi, atau kategori..."
                      value={searchQueryActivities}
                      onChange={(e) => setSearchQueryActivities(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border-2 border-[#4A7FA7]/20 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#4A7FA7]/10 transition-all duration-300 shadow-sm"
                    />
                    <svg className="w-5 h-5 text-[#4A7FA7] absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                )}

                {activities.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-[#4A7FA7] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-[#4A7FA7] text-lg">Belum ada riwayat kegiatan</p>
                    <p className="text-[#4A7FA7]/70 text-sm mt-2">Kegiatan yang pernah Anda ikuti akan muncul di sini</p>
                  </div>
                ) : activitiesData.paginatedData.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-[#4A7FA7] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-[#4A7FA7] text-lg">Tidak ada hasil untuk "{searchQueryActivities}"</p>
                    <button
                      onClick={() => setSearchQueryActivities('')}
                      className="mt-4 px-4 py-2 text-[#4A7FA7] hover:text-[#1A3D63] font-semibold"
                    >
                      Hapus pencarian
                    </button>
                  </div>
                ) : (
                  <>
                  <div className="relative">
                    {/* Navigation Arrow Left */}
                    {activitiesData.totalPages > 1 && (
                      <button 
                        onClick={prevActivities} 
                        className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-[#F6FAFD]/90 backdrop-blur-xl rounded-full shadow-lg flex items-center justify-center text-[#0A1931] hover:bg-[#F6FAFD] transition-all border border-white/20"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    )}

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {activitiesData.paginatedData.map((activity) => (
                      <div key={activity.id} className="bg-white backdrop-blur-xl rounded-xl overflow-hidden border-2 border-blue-100 hover:shadow-2xl hover:border-blue-300 transition-all transform hover:-translate-y-1">
                        {/* Event Flyer */}
                        {(() => {
                          let flyerSrc = null;
                          if (activity.eventFlyer) {
                            if (activity.eventFlyer.startsWith('http://') || activity.eventFlyer.startsWith('https://')) {
                              flyerSrc = activity.eventFlyer;
                            } else {
                              flyerSrc = `https://dynotix-production.up.railway.app/storage/${activity.eventFlyer}`;
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
                              <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                                {/* Event status badge */}
                                <div className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${
                                  activity.isPastEvent
                                    ? 'bg-gray-500/90 text-white'
                                    : 'bg-purple-500/90 text-white'
                                }`}>
                                  {activity.isPastEvent ? 'Selesai' : 'Akan Datang'}
                                </div>
                                {/* Attendance status badge */}
                                {activity.status === 'attended' && (
                                  <div className="px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md bg-green-500/90 text-white">
                                    ✓ Sudah Hadir
                                  </div>
                                )}
                                {activity.status === 'registered' && activity.statusVerifikasi === 'approved' && (
                                  <div className="px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md bg-blue-500/90 text-white">
                                    ✓ Terdaftar
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="relative h-48 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 flex items-center justify-center">
                              <svg className="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                                {/* Event status badge */}
                                <div className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${
                                  activity.isPastEvent
                                    ? 'bg-gray-500/90 text-white'
                                    : 'bg-purple-500/90 text-white'
                                }`}>
                                  {activity.isPastEvent ? 'Selesai' : 'Akan Datang'}
                                </div>
                                {/* Attendance status badge */}
                                {activity.status === 'attended' && (
                                  <div className="px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md bg-green-500/90 text-white">
                                    ✓ Sudah Hadir
                                  </div>
                                )}
                                {activity.status === 'registered' && activity.statusVerifikasi === 'approved' && (
                                  <div className="px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md bg-blue-500/90 text-white">
                                    ✓ Terdaftar
                                  </div>
                                )}
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
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-green-600">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                  </svg>
                                  <span className="text-sm font-semibold">Sertifikat tersedia</span>
                                </div>
                                <button
                                  onClick={() => handleDownloadCertificate({
                                    title: activity.title,
                                    event: activity.title,
                                    date: activity.date,
                                    category: activity.category
                                  })}
                                  className="px-3 py-1.5 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white text-xs font-semibold rounded-lg hover:from-[#4A7FA7]/90 hover:to-[#0A1931] transition-all flex items-center gap-1 shadow-md hover:shadow-lg transform hover:scale-105"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  Download
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    </div>

                    {/* Navigation Arrow Right */}
                    {activitiesData.totalPages > 1 && (
                      <button 
                        onClick={nextActivities} 
                        className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-[#F6FAFD]/90 backdrop-blur-xl rounded-full shadow-lg flex items-center justify-center text-[#0A1931] hover:bg-[#F6FAFD] transition-all border border-white/20"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </div>
                  </>
                )}
              </div>
            )}

            {/* Certificates Section */}
            {activeSection === "certificates" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#0A1931]">Sertifikat</h2>
                  <span className="text-sm text-[#4A7FA7] bg-[#F6FAFD] px-3 py-1 rounded-full">
                    {certificates.length} sertifikat tersedia
                  </span>
                </div>

                {/* Info box if has activities but no certificates */}
                {certificates.length === 0 && activities.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h3 className="font-bold text-blue-900 mb-2">Sertifikat Tidak Tersedia</h3>
                        <p className="text-sm text-blue-700 mb-3">
                          Anda memiliki <strong>{activities.length} event terdaftar</strong>, namun sertifikat belum tersedia. 
                        </p>
                        <div className="text-sm text-blue-600">
                          <p className="font-semibold mb-2">Sertifikat akan tersedia jika:</p>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Event sudah selesai dilaksanakan</li>
                            <li>Anda sudah hadir dan di-scan saat event</li>
                            <li>Status pendaftaran sudah diverifikasi</li>
                          </ul>
                          <p className="mt-3 text-xs italic">
                            💡 Tip: Cek console browser (F12) untuk melihat detail debug setiap event
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {certificates.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-[#4A7FA7] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <p className="text-[#4A7FA7] text-lg font-semibold">Belum ada sertifikat</p>
                    <p className="text-[#4A7FA7]/70 text-sm mt-2">Sertifikat dari kegiatan yang sudah selesai akan muncul di sini</p>
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
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#0A1931]">Status Pendaftaran</h2>
                  {registrationsData.totalItems > 0 && (
                    <span className="text-sm text-[#4A7FA7] bg-[#F6FAFD] px-3 py-1 rounded-full">
                      {registrationsData.totalItems} pendaftaran
                    </span>
                  )}
                </div>

                {/* Search Bar */}
                {registrations.length > 0 && (
                  <div className="mb-6">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Cari pendaftaran..."
                        value={searchQueryRegistrations}
                        onChange={(e) => setSearchQueryRegistrations(e.target.value)}
                        className="w-full px-4 py-3 pl-12 bg-white border-2 border-[#4A7FA7]/20 rounded-xl focus:outline-none focus:border-[#4A7FA7] transition-all text-[#0A1931] placeholder:text-[#4A7FA7]/50"
                      />
                      <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A7FA7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      {searchQueryRegistrations && (
                        <button
                          onClick={() => setSearchQueryRegistrations('')}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4A7FA7] hover:text-[#0A1931]"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {registrations.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-[#4A7FA7] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-[#4A7FA7] text-lg">Belum ada pendaftaran aktif</p>
                    <p className="text-[#4A7FA7]/70 text-sm mt-2">Status pendaftaran kegiatan Anda akan muncul di sini</p>
                  </div>
                ) : registrationsData.paginatedData.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-[#4A7FA7] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-[#4A7FA7] text-lg">Tidak ada hasil untuk "{searchQueryRegistrations}"</p>
                    <button
                      onClick={() => setSearchQueryRegistrations('')}
                      className="mt-4 px-4 py-2 text-[#4A7FA7] hover:text-[#1A3D63] font-semibold"
                    >
                      Hapus pencarian
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Navigation Arrow Left */}
                    {registrationsData.totalPages > 1 && (
                      <button 
                        onClick={prevRegistrations} 
                        className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-[#F6FAFD]/90 backdrop-blur-xl rounded-full shadow-lg flex items-center justify-center text-[#0A1931] hover:bg-[#F6FAFD] transition-all border border-white/20"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    )}

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {registrationsData.paginatedData.map((registration) => (
                      <div key={registration.id} className="bg-white backdrop-blur-xl rounded-xl overflow-hidden border-2 border-indigo-100 hover:shadow-2xl hover:border-indigo-300 transition-all transform hover:-translate-y-1">
                        {/* Event Flyer */}
                        {(() => {
                          let flyerSrc = null;
                          if (registration.eventFlyer) {
                            if (registration.eventFlyer.startsWith('http://') || registration.eventFlyer.startsWith('https://')) {
                              flyerSrc = registration.eventFlyer;
                            } else {
                              flyerSrc = `https://dynotix-production.up.railway.app/storage/${registration.eventFlyer}`;
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
                              <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
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
                              <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
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

                        <div className="p-6 pb-0">
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
                        </div>

                        <div className="px-6 pb-6 pt-4 border-t border-gray-200">
                          <p className="text-xs text-[#4A7FA7]/70 mb-3">
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
                    ))}
                    </div>

                    {/* Navigation Arrow Right */}
                    {registrationsData.totalPages > 1 && (
                      <button 
                        onClick={nextRegistrations} 
                        className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-[#F6FAFD]/90 backdrop-blur-xl rounded-full shadow-lg flex items-center justify-center text-[#0A1931] hover:bg-[#F6FAFD] transition-all border border-white/20"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Change Password Section */}
            {activeSection === "password" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#0A1931] mb-6">Ubah Password</h2>
                <div className="max-w-md mx-auto">
                  {/* Info Card */}
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 mb-6">
                    <div className="text-center">
                      <p className="text-sm text-blue-800 font-semibold mb-2">
                        Ubah password akun Anda untuk menjaga keamanan
                      </p>
                      <p className="text-xs text-blue-700">
                        Gunakan password yang kuat dan mudah diingat
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="text-center">
                    <button
                      onClick={handleChangePassword}
                      className="px-8 py-3 bg-[#4A7FA7] text-white rounded-xl font-semibold hover:bg-[#4A7FA7]/80 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Ubah Password
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Account Section */}
            {activeSection === "delete-account" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#0A1931] mb-6">Hapus Akun</h2>
                <div className="max-w-md mx-auto">
                  {/* Warning Card */}
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5 mb-6">
                    <div className="text-center">
                      <p className="text-sm text-red-800 font-semibold mb-2">
                        Menghapus akun akan menghapus semua data secara permanen
                      </p>
                      <p className="text-xs text-red-700">
                        Data yang dihapus tidak dapat dipulihkan
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="text-center">
                    <button
                      onClick={() => setShowDeleteAccountModal(true)}
                      className="px-8 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Hapus Akun Saya
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

      {/* Delete Account Modal */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-auto transform transition-all animate-scale-in">
            {/* Header with Icon */}
            <div className="relative bg-gradient-to-r from-red-50 to-orange-50 px-5 pt-5 pb-4 rounded-t-2xl border-b border-red-100">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Hapus Akun</h2>
                    <p className="text-xs text-gray-600">Tindakan ini tidak dapat dibatalkan</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseDeleteAccountModal}
                  className="w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all shadow-sm hover:shadow-md flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Warning Messages */}
              <div className="space-y-3 mb-4">
                <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-3">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <p className="text-xs font-semibold text-red-900 mb-1">Peringatan Penting</p>
                      <p className="text-xs text-red-800 leading-relaxed">
                        Kami akan <strong>segera menghapus SEMUA data</strong> yang terkait dengan akun Anda. Data yang dihapus <strong>tidak dapat dipulihkan</strong>.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xs font-medium text-gray-900 mb-1.5">Data yang akan dihapus:</p>
                  <ul className="space-y-1 text-xs text-gray-700">
                    <li className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Profil dan informasi pribadi
                    </li>
                    <li className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Riwayat kegiatan dan pendaftaran
                    </li>
                    <li className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Sertifikat yang terkait
                    </li>
                    <li className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Data lainnya yang terkait dengan akun Anda
                    </li>
                  </ul>
                </div>
              </div>

              {/* Confirmation Input */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Untuk mengonfirmasi, ketik <span className="text-red-600 font-mono bg-red-50 px-1.5 py-0.5 rounded text-xs">HAPUS AKUN SAYA</span>:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={deleteAccountConfirmText}
                    onChange={(e) => setDeleteAccountConfirmText(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-lg border-2 transition-all text-sm font-medium ${
                      deleteAccountConfirmText === 'HAPUS AKUN SAYA'
                        ? 'bg-green-50 border-green-500 text-green-900 focus:ring-2 focus:ring-green-500 focus:border-green-500'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                    } focus:outline-none`}
                    placeholder="Ketik HAPUS AKUN SAYA"
                  />
                  {deleteAccountConfirmText === 'HAPUS AKUN SAYA' && (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                </div>
                {deleteAccountConfirmText && deleteAccountConfirmText !== 'HAPUS AKUN SAYA' && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Teks yang dimasukkan tidak sesuai
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={handleCloseDeleteAccountModal}
                  className="flex-1 px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm hover:shadow-md"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteAccountConfirmText !== 'HAPUS AKUN SAYA'}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                    deleteAccountConfirmText === 'HAPUS AKUN SAYA'
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 hover:shadow-lg transform hover:scale-[1.02]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Hapus Akun
                </button>
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
