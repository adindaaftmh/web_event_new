import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TicketModal from '../components/TicketModal';
import JigsawCaptcha from '../components/JigsawCaptcha';
import { kegiatanService, daftarHadirService } from '../services/apiService';

export default function EventRegistration() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(location.state?.selectedTicket || null);
  const [quantity, setQuantity] = useState(location.state?.quantity || 1);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  
  // Get logged in user data
  const [loggedInUser, setLoggedInUser] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    namaLengkap: '',
    email: '',
    nomorTelepon: '',
    alamat: '',
    pendidikanTerakhir: ''
  });

  // Tim data
  const [teamData, setTeamData] = useState({
    namaTeam: '',
    ketuaTeam: {
      namaLengkap: '',
      email: '',
      nomorTelepon: '',
      pendidikanTerakhir: ''
    },
    anggotaTeam: [
      { namaLengkap: '', email: '', nomorTelepon: '', pendidikanTerakhir: '' }
    ]
  });

  const [errors, setErrors] = useState({});
  
  // Jigsaw Captcha state
  const [showCaptchaModal, setShowCaptchaModal] = useState(false);

  // Load logged in user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setLoggedInUser(user);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await kegiatanService.getById(id);
        if (response.data.success) {
          const eventData = response.data.data;
          
          // Parse tickets if it's a JSON string
          if (eventData.tickets && typeof eventData.tickets === 'string') {
            try {
              eventData.tickets = JSON.parse(eventData.tickets);
            } catch (e) {
              console.error('Error parsing tickets:', e);
              eventData.tickets = [];
            }
          }
          
          setEvent(eventData);
        }
      } catch (err) {
        console.error('Error fetching event:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  // Normalize tickets data - convert from database format to UI format
  const eventTickets = React.useMemo(() => {
    console.log('Event tickets raw:', event?.tickets);
    
    if (!event?.tickets) {
      console.log('No tickets found in event data');
      return [];
    }
    
    if (!Array.isArray(event.tickets)) {
      console.log('Tickets is not an array:', typeof event.tickets);
      return [];
    }
    
    const normalized = event.tickets.map(ticket => ({
      id: ticket.id,
      name: ticket.nama_tiket || ticket.name || 'Tiket',
      price: ticket.harga || ticket.price || 0,
      features: ticket.deskripsi ? [ticket.deskripsi] : ["Akses event"],
      quota: ticket.kuota || ticket.quota || 0,
      available: ticket.kuota || ticket.quota || 0
    }));
    
    console.log('Normalized tickets:', normalized);
    return normalized;
  }, [event?.tickets]);

  const pendidikanOptions = [
    'SD', 'SMP', 'SMA/SMK', 'D3', 'D4/S1', 'S2', 'S3', 'Lainnya'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTeamInputChange = (e, field, section, index = null) => {
    const { value } = e.target;
    
    setTeamData(prev => {
      if (section === 'team') {
        return { ...prev, namaTeam: value };
      } else if (section === 'ketua') {
        return {
          ...prev,
          ketuaTeam: { ...prev.ketuaTeam, [field]: value }
        };
      } else if (section === 'anggota' && index !== null) {
        const newAnggota = [...prev.anggotaTeam];
        newAnggota[index] = { ...newAnggota[index], [field]: value };
        return { ...prev, anggotaTeam: newAnggota };
      }
      return prev;
    });
  };

  const addAnggotaTeam = () => {
    setTeamData(prev => ({
      ...prev,
      anggotaTeam: [
        ...prev.anggotaTeam,
        { namaLengkap: '', email: '', nomorTelepon: '', pendidikanTerakhir: '' }
      ]
    }));
  };

  const removeAnggotaTeam = (index) => {
    if (teamData.anggotaTeam.length > 1) {
      setTeamData(prev => ({
        ...prev,
        anggotaTeam: prev.anggotaTeam.filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.namaLengkap.trim()) newErrors.namaLengkap = 'Nama lengkap wajib diisi';
    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    if (!formData.nomorTelepon.trim()) {
      newErrors.nomorTelepon = 'Nomor telepon wajib diisi';
    } else if (!/^[0-9]{10,13}$/.test(formData.nomorTelepon.replace(/[^0-9]/g, ''))) {
      newErrors.nomorTelepon = 'Nomor telepon harus 10-13 digit';
    }
    if (!formData.alamat.trim()) newErrors.alamat = 'Alamat wajib diisi';
    if (!formData.pendidikanTerakhir) newErrors.pendidikanTerakhir = 'Pendidikan terakhir wajib dipilih';
    if (!selectedTicket) newErrors.ticket = 'Pilih paket tiket terlebih dahulu';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form first
    const tipePeserta = event?.tipe_peserta || 'individu';
    
    if (tipePeserta === 'tim') {
      if (!teamData.namaTeam.trim() || !teamData.ketuaTeam.namaLengkap.trim()) {
        alert('Nama tim dan data ketua tim wajib diisi');
        return;
      }
    } else {
      if (!validateForm()) {
        return;
      }
    }
    
    // Show captcha modal after validation
    setShowCaptchaModal(true);
  };

  const handleCaptchaSuccess = async () => {
    setShowCaptchaModal(false);
    
    const tipePeserta = event?.tipe_peserta || 'individu';
    
    if (tipePeserta === 'tim') {
      // Validate team data
      if (!teamData.namaTeam.trim() || !teamData.ketuaTeam.namaLengkap.trim()) {
        alert('Nama tim dan data ketua tim wajib diisi');
        return;
      }
      
      try {
        setLoading(true);
        
        const registrationData = {
          kegiatan_id: event?.id || id,
          user_id: loggedInUser?.id || null, // Link to logged in user if available
          nama_lengkap: teamData.ketuaTeam.namaLengkap,
          email: teamData.ketuaTeam.email, // Can be different from user's email
          no_telepon: teamData.ketuaTeam.nomorTelepon,
          tipe_peserta: 'tim',
          nama_tim: teamData.namaTeam,
          data_tim: JSON.stringify({
            ketua: teamData.ketuaTeam,
            anggota: teamData.anggotaTeam
          }),
          tiket_dipilih: selectedTicket ? selectedTicket.nama_tiket || selectedTicket.name : null,
          jumlah_tiket: quantity,
          total_harga: selectedTicket ? (selectedTicket.harga || selectedTicket.price) * quantity : 0,
          status_kehadiran: 'tidak_hadir',
          status_verifikasi: 'pending'
        };
        
        console.log('Team Registration data:', registrationData);
        const response = await daftarHadirService.create(registrationData);
        
        console.log('Team Registration response:', response);
        
        if (response.data?.success) {
          const registrationResult = response.data.data;
          
          // Prepare ticket data
          setTicketData({
            registrationId: registrationResult.id,
            token: registrationResult.otp,
            eventId: event?.id || id,
            eventName: event?.judul_kegiatan || event?.name,
            category: event?.kategori?.nama_kategori || '',
            participantName: teamData.ketuaTeam.namaLengkap,
            email: teamData.ketuaTeam.email,
            phone: teamData.ketuaTeam.nomorTelepon,
            ticketType: selectedTicket ? selectedTicket.nama_tiket || selectedTicket.name : 'General',
            eventDate: event?.waktu_mulai,
            location: event?.lokasi_kegiatan,
            teamName: teamData.namaTeam
          });
          
          setShowTicketModal(true);
        } else {
          // Handle error response from backend
          const errorMessage = response.data?.message || 'Gagal menyimpan pendaftaran tim. Silakan coba lagi.';
          alert(errorMessage);
        }
      } catch (error) {
        console.error('Error submitting team registration:', error);
        
        // Show specific error message from backend
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.errors?.join(', ') ||
                            'Gagal menyimpan pendaftaran tim. Silakan coba lagi.';
        
        // Check if it's a duplicate registration error
        if (error.response?.status === 400 && error.response?.data?.data?.token) {
          const token = error.response.data.data.token;
          alert(`${errorMessage}\n\nToken Kehadiran Tim Anda: ${token}\n\nSilakan screenshot token ini atau cek di halaman Profile.`);
        } else {
          alert(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    } else {
      if (validateForm()) {
        try {
          setLoading(true);
          
          const registrationData = {
            kegiatan_id: event?.id || id,
            user_id: loggedInUser?.id || null, // Link to logged in user if available
            nama_lengkap: formData.namaLengkap,
            email: formData.email, // Can be different from user's email
            no_telepon: formData.nomorTelepon,
            alamat: formData.alamat,
            pendidikan_terakhir: formData.pendidikanTerakhir,
            tipe_peserta: 'individu',
            tiket_dipilih: selectedTicket ? selectedTicket.nama_tiket || selectedTicket.name : null,
            jumlah_tiket: quantity,
            total_harga: selectedTicket ? (selectedTicket.harga || selectedTicket.price) * quantity : 0,
            status_kehadiran: 'tidak_hadir',
            status_verifikasi: 'pending'
          };
          
          console.log('Individual Registration data:', registrationData);
          const response = await daftarHadirService.create(registrationData);
          
          console.log('Registration response:', response);
          
          if (response.data?.success) {
            const registrationResult = response.data.data;
            
            // Prepare ticket data
            setTicketData({
              registrationId: registrationResult.id,
              token: registrationResult.otp,
              eventId: event?.id || id,
              eventName: event?.judul_kegiatan || event?.name,
              category: event?.kategori?.nama_kategori || '',
              participantName: formData.namaLengkap,
              email: formData.email,
              phone: formData.nomorTelepon,
              ticketType: selectedTicket ? selectedTicket.nama_tiket || selectedTicket.name : 'General',
              eventDate: event?.waktu_mulai,
              location: event?.lokasi_kegiatan
            });
            
            setShowTicketModal(true);
          } else {
            // Handle error response from backend
            const errorMessage = response.data?.message || 'Gagal menyimpan pendaftaran. Silakan coba lagi.';
            alert(errorMessage);
          }
        } catch (error) {
          console.error('Error submitting registration:', error);
          
          // Show specific error message from backend
          const errorMessage = error.response?.data?.message || 
                              error.response?.data?.errors?.join(', ') ||
                              'Gagal menyimpan pendaftaran. Silakan coba lagi.';
          
          // Check if it's a duplicate registration error
          if (error.response?.status === 400 && error.response?.data?.data?.token) {
            const token = error.response.data.data.token;
            alert(`${errorMessage}\n\nToken Kehadiran Anda: ${token}\n\nSilakan screenshot token ini atau cek di halaman Profile.`);
          } else {
            alert(errorMessage);
          }
        } finally {
          setLoading(false);
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50/30 to-indigo-100/40">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#4A7FA7] mx-auto"></div>
          <p className="mt-4 text-[#0A1931]">Memuat halaman pendaftaran...</p>
        </div>
      </div>
    );
  }

  const eventData = event || { judul_kegiatan: 'Event', waktu_mulai: new Date(), lokasi_kegiatan: 'TBA' };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-slate-100 via-blue-50/30 to-indigo-100/40 overflow-hidden">
      {/* Ticket Modal */}
      <TicketModal
        isOpen={showTicketModal}
        onClose={() => {
          setShowTicketModal(false);
          navigate('/');
        }}
        ticketData={ticketData}
      />

      {/* Animated Background Accent - Glassmorphism Theme with Bubbles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Large Blur Blobs - Gradient Theme */}
        <div className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-blue-400/25 to-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/20 to-pink-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-[450px] h-[450px] bg-gradient-to-br from-cyan-400/20 to-blue-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-gradient-to-br from-violet-400/15 to-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-1/4 left-1/2 w-[600px] h-[600px] bg-gradient-to-br from-teal-400/20 to-cyan-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] bg-gradient-to-br from-indigo-400/25 to-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '5s' }}></div>

        {/* Additional Gradient Overlays */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-cyan-500/8 to-transparent pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-r from-indigo-500/6 to-transparent pointer-events-none"></div>

        {/* Floating Transparent Bubbles - Gradient Theme */}
        <div className="absolute top-32 left-[15%] w-24 h-24 border-2 border-blue-400/50 rounded-full animate-float bg-gradient-to-br from-blue-200/20 to-indigo-300/15"></div>
        <div className="absolute top-64 right-[20%] w-32 h-32 border-2 border-purple-400/45 rounded-full animate-float bg-gradient-to-br from-purple-200/20 to-pink-300/15" style={{ animationDelay: '1.5s', animationDuration: '8s' }}></div>
        <div className="absolute bottom-40 left-[25%] w-20 h-20 border-2 border-cyan-400/50 rounded-full animate-float bg-gradient-to-br from-cyan-200/20 to-blue-300/15" style={{ animationDelay: '3s', animationDuration: '10s' }}></div>
        <div className="absolute top-[45%] left-[8%] w-16 h-16 border border-violet-400/60 rounded-full animate-float bg-gradient-to-br from-violet-200/25 to-purple-300/20" style={{ animationDelay: '2s', animationDuration: '9s' }}></div>
        <div className="absolute bottom-[30%] right-[15%] w-28 h-28 border-2 border-teal-400/40 rounded-full animate-float bg-gradient-to-br from-teal-200/20 to-cyan-300/15" style={{ animationDelay: '4s', animationDuration: '11s' }}></div>
        <div className="absolute top-[20%] right-[35%] w-18 h-18 border border-indigo-400/55 rounded-full animate-float bg-gradient-to-br from-indigo-200/25 to-blue-300/20" style={{ animationDelay: '1s', animationDuration: '7s' }}></div>
        <div className="absolute top-[60%] left-[60%] w-14 h-14 border border-pink-400/45 rounded-full animate-float bg-gradient-to-br from-pink-200/20 to-rose-300/15" style={{ animationDelay: '2.5s', animationDuration: '12s' }}></div>
        <div className="absolute bottom-[60%] right-[10%] w-22 h-22 border-2 border-emerald-400/50 rounded-full animate-float bg-gradient-to-br from-emerald-200/20 to-teal-300/15" style={{ animationDelay: '3.5s', animationDuration: '9.5s' }}></div>
        <div className="absolute top-[80%] left-[40%] w-12 h-12 border border-amber-400/60 rounded-full animate-float bg-gradient-to-br from-amber-200/25 to-orange-300/20" style={{ animationDelay: '4.5s', animationDuration: '11.5s' }}></div>

        {/* Additional Dynamic Bubbles with Different Animations - Gradient Theme */}
        <div className="absolute top-[10%] left-[70%] w-8 h-8 bg-gradient-to-br from-blue-300/25 to-indigo-400/20 rounded-full animate-bubble-rise" style={{ animationDelay: '0s', animationDuration: '18s' }}></div>
        <div className="absolute top-[15%] left-[30%] w-6 h-6 bg-gradient-to-br from-purple-300/30 to-pink-400/25 rounded-full animate-bubble-rise" style={{ animationDelay: '3s', animationDuration: '20s' }}></div>
        <div className="absolute top-[25%] left-[80%] w-10 h-10 bg-gradient-to-br from-cyan-300/20 to-blue-400/15 rounded-full animate-bubble-rise" style={{ animationDelay: '6s', animationDuration: '16s' }}></div>
        <div className="absolute top-[35%] left-[20%] w-7 h-7 bg-gradient-to-br from-violet-300/35 to-purple-400/30 rounded-full animate-bubble-rise" style={{ animationDelay: '9s', animationDuration: '22s' }}></div>
        <div className="absolute top-[45%] left-[90%] w-5 h-5 bg-gradient-to-br from-teal-300/25 to-cyan-400/20 rounded-full animate-bubble-rise" style={{ animationDelay: '12s', animationDuration: '19s' }}></div>

        {/* Drifting Bubbles - Gradient Theme */}
        <div className="absolute top-[30%] left-[50%] w-9 h-9 border border-indigo-400/40 rounded-full animate-bubble-drift bg-gradient-to-br from-indigo-200/20 to-blue-300/15" style={{ animationDelay: '1s', animationDuration: '14s' }}></div>
        <div className="absolute top-[70%] left-[70%] w-11 h-11 border border-emerald-400/35 rounded-full animate-bubble-drift bg-gradient-to-br from-emerald-200/20 to-teal-300/15" style={{ animationDelay: '4s', animationDuration: '16s' }}></div>
        <div className="absolute top-[50%] left-[10%] w-8 h-8 border border-rose-400/45 rounded-full animate-bubble-drift bg-gradient-to-br from-rose-200/25 to-pink-300/20" style={{ animationDelay: '7s', animationDuration: '13s' }}></div>
        <div className="absolute top-[85%] left-[50%] w-6 h-6 border border-amber-400/50 rounded-full animate-bubble-drift bg-gradient-to-br from-amber-200/25 to-orange-300/20" style={{ animationDelay: '10s', animationDuration: '17s' }}></div>
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
        @keyframes bubble-rise {
          0% {
            transform: translateY(100vh) translateX(0) scale(0.5);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          50% {
            transform: translateY(50vh) translateX(20px) scale(1);
            opacity: 0.7;
          }
          90% {
            opacity: 0.4;
          }
          100% {
            transform: translateY(-10vh) translateX(-10px) scale(0.8);
            opacity: 0;
          }
        }
        @keyframes bubble-drift {
          0%, 100% {
            transform: translateX(0) translateY(0) rotate(0deg);
          }
          33% {
            transform: translateX(30px) translateY(-20px) rotate(120deg);
          }
          66% {
            transform: translateX(-20px) translateY(-40px) rotate(240deg);
          }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-bubble-rise {
          animation: bubble-rise 15s linear infinite;
        }
        .animate-bubble-drift {
          animation: bubble-drift 12s ease-in-out infinite;
        }
      `}</style>

      <Navbar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20 relative z-10">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#4A7FA7] hover:text-[#0A1931] font-semibold transition-all duration-300 group mb-6"
        >
          <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Event Info & Ticket Selection */}
          <div className="lg:col-span-1 space-y-4 animate-slide-up" style={{animationDelay: '0.1s', animationFillMode: 'both'}}>
            {/* Event Card */}
            <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500">
              <h2 className="text-lg font-bold text-[#0A1931] mb-4">Informasi Event</h2>
              
              {(() => {
                let flyerSrc = null;
                if (eventData.flyer_url) {
                  flyerSrc = eventData.flyer_url;
                } else if (eventData.flyer_kegiatan) {
                  if (eventData.flyer_kegiatan.startsWith('http://') || eventData.flyer_kegiatan.startsWith('https://')) {
                    flyerSrc = eventData.flyer_kegiatan;
                  } else {
                    flyerSrc = `http://localhost:8000/storage/${eventData.flyer_kegiatan}`;
                  }
                }
                
                return flyerSrc ? (
                  <div className="mb-4 rounded-xl overflow-hidden shadow-md">
                    <img 
                      src={flyerSrc}
                      alt={eventData.judul_kegiatan} 
                      className="w-full h-56 object-cover"
                      onError={(e) => {
                      e.target.onerror = null;
                      e.target.parentElement.innerHTML = `
                        <div class="mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-[#4A7FA7]/20 to-[#1A3D63]/20 h-56 flex items-center justify-center">
                          <div class="text-center p-4">
                            <svg class="w-16 h-16 text-[#4A7FA7] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p class="text-[#4A7FA7] text-sm font-medium">Gagal Memuat Flyer</p>
                          </div>
                        </div>
                      `;
                    }}
                    />
                  </div>
                ) : (
                  <div className="mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-[#4A7FA7]/20 to-[#1A3D63]/20 h-56 flex items-center justify-center">
                    <div className="text-center p-4">
                      <svg className="w-16 h-16 text-[#4A7FA7] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-[#4A7FA7] text-sm font-medium">Flyer Event</p>
                    </div>
                  </div>
                );
              })()}

              <h3 className="font-bold text-[#0A1931] mb-3">{eventData.judul_kegiatan || eventData.name}</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#4A7FA7] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-xs text-[#4A7FA7] font-medium">Tanggal</p>
                    <p className="text-sm font-semibold text-[#0A1931]">
                      {eventData.waktu_mulai ? new Date(eventData.waktu_mulai).toLocaleDateString('id-ID', { 
                        day: 'numeric', month: 'long', year: 'numeric'
                      }) : 'TBA'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#4A7FA7] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-xs text-[#4A7FA7] font-medium">Waktu</p>
                    <p className="text-sm font-semibold text-[#0A1931]">
                      {eventData.waktu_mulai ? new Date(eventData.waktu_mulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'TBA'} WIB
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#4A7FA7] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <div>
                    <p className="text-xs text-[#4A7FA7] font-medium">Lokasi</p>
                    <p className="text-sm font-semibold text-[#0A1931]">{eventData.lokasi_kegiatan || 'TBA'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Selection */}
            <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-2xl transition-all duration-500 animate-slide-up" style={{animationDelay: '0.2s', animationFillMode: 'both'}}>
              <h2 className="text-lg font-bold text-[#0A1931] mb-4">
                Pilihan Tiket <span className="text-red-500">*</span>
              </h2>
              
              {errors.ticket && <p className="text-red-500 text-sm mb-4">{errors.ticket}</p>}
              
              <div className="space-y-3">
                {eventTickets.length > 0 ? (
                  eventTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:-translate-y-1 ${selectedTicket?.id === ticket.id ? 'scale-105' : ''} ${
                        selectedTicket?.id === ticket.id
                          ? 'border-[#4A7FA7] bg-[#B3CFE5]/20 shadow-lg'
                          : 'border-[#4A7FA7]/20 hover:border-[#4A7FA7] hover:shadow-md'
                      }`}
                    >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-[#0A1931]">{ticket.name}</h4>
                        <p className="text-xl font-bold text-[#4A7FA7] mt-1">
                          Rp {ticket.price.toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedTicket?.id === ticket.id ? 'border-[#4A7FA7] bg-[#4A7FA7]' : 'border-[#4A7FA7]/30'
                      }`}>
                        {selectedTicket?.id === ticket.id && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-1 mb-3">
                      {ticket.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-[#4A7FA7]">
                          <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#4A7FA7]">Tersisa:</span>
                      <span className={`font-semibold ${ticket.available < 10 ? 'text-red-600' : 'text-[#0A1931]'}`}>
                        {ticket.available} / {ticket.quota} tiket
                      </span>
                    </div>
                  </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                    <svg className="w-12 h-12 text-yellow-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-yellow-700 font-semibold mb-1">Belum Ada Pilihan Tiket</p>
                    <p className="text-sm text-yellow-600">Event ini belum memiliki opsi tiket yang tersedia</p>
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              {selectedTicket && (
                <div className="mt-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                  <label className="block text-sm font-semibold text-[#0A1931] mb-3">Jumlah Tiket</label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 bg-white border-2 border-[#4A7FA7]/30 rounded-lg flex items-center justify-center text-[#0A1931] hover:bg-[#4A7FA7] hover:text-white hover:scale-110 hover:shadow-lg transition-all duration-300 active:scale-95"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(selectedTicket.available, parseInt(e.target.value) || 1)))}
                      className="flex-1 text-center text-xl font-bold bg-white border-2 border-[#4A7FA7]/30 rounded-lg py-2 px-4 focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#4A7FA7]/20 transition-all"
                      min="1"
                      max={selectedTicket.available}
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(selectedTicket.available, quantity + 1))}
                      className="w-10 h-10 bg-white border-2 border-[#4A7FA7]/30 rounded-lg flex items-center justify-center text-[#0A1931] hover:bg-[#4A7FA7] hover:text-white hover:scale-110 hover:shadow-lg transition-all duration-300 active:scale-95"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Form & Order Summary */}
          <div className="lg:col-span-2 animate-slide-up" style={{animationDelay: '0.3s', animationFillMode: 'both'}}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Participant Data Form */}
              {event?.tipe_peserta === 'tim' ? (
                /* Form Pendaftaran Tim */
                <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-6">
                    <svg className="w-6 h-6 text-[#4A7FA7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h2 className="text-xl font-bold text-[#0A1931]">Data Tim</h2>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Nama Tim */}
                    <div>
                      <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                        Nama Tim <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={teamData.namaTeam}
                        onChange={(e) => handleTeamInputChange(e, '', 'team')}
                        className="w-full px-4 py-3 border-2 border-[#4A7FA7]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-[#4A7FA7] focus:scale-[1.02] transition-all duration-300 hover:border-[#4A7FA7]/40"
                        placeholder="Masukkan nama tim"
                      />
                    </div>

                    {/* Data Ketua Tim */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200">
                      <h3 className="text-md font-bold text-[#0A1931] mb-4">Ketua Tim</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                            Nama Lengkap <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={teamData.ketuaTeam.namaLengkap}
                            onChange={(e) => handleTeamInputChange(e, 'namaLengkap', 'ketua')}
                            className="w-full px-3 py-2 border-2 border-[#4A7FA7]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-[#4A7FA7] focus:scale-[1.01] transition-all duration-300 hover:border-[#4A7FA7]/40"
                            placeholder="Nama ketua tim"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            value={teamData.ketuaTeam.email}
                            onChange={(e) => handleTeamInputChange(e, 'email', 'ketua')}
                            className="w-full px-3 py-2 border-2 border-[#4A7FA7]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-[#4A7FA7] focus:scale-[1.01] transition-all duration-300 hover:border-[#4A7FA7]/40"
                            placeholder="email@example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                            No. Telepon <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            value={teamData.ketuaTeam.nomorTelepon}
                            onChange={(e) => handleTeamInputChange(e, 'nomorTelepon', 'ketua')}
                            className="w-full px-3 py-2 border-2 border-[#4A7FA7]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-[#4A7FA7] focus:scale-[1.01] transition-all duration-300 hover:border-[#4A7FA7]/40"
                            placeholder="08xxxxxxxxxx"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                            Pendidikan Terakhir
                          </label>
                          <select
                            value={teamData.ketuaTeam.pendidikanTerakhir}
                            onChange={(e) => handleTeamInputChange(e, 'pendidikanTerakhir', 'ketua')}
                            className="w-full px-3 py-2 border-2 border-[#4A7FA7]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-[#4A7FA7] focus:scale-[1.01] transition-all duration-300 hover:border-[#4A7FA7]/40"
                          >
                            <option value="">Pilih pendidikan</option>
                            {pendidikanOptions.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Anggota Tim */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-md font-bold text-[#0A1931]">Anggota Tim</h3>
                        <button
                          type="button"
                          onClick={addAnggotaTeam}
                          className="px-3 py-1.5 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white text-sm font-semibold rounded-lg hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-all flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Tambah Anggota
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        {teamData.anggotaTeam.map((anggota, index) => (
                          <div key={index} className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200 relative">
                            <div className="absolute top-2 right-2">
                              {teamData.anggotaTeam.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeAnggotaTeam(index)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-[#0A1931] mb-3">Anggota {index + 1}</h4>
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={anggota.namaLengkap}
                                onChange={(e) => handleTeamInputChange(e, 'namaLengkap', 'anggota', index)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] transition-all text-sm"
                                placeholder="Nama lengkap"
                              />
                              <input
                                type="email"
                                value={anggota.email}
                                onChange={(e) => handleTeamInputChange(e, 'email', 'anggota', index)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] transition-all text-sm"
                                placeholder="Email"
                              />
                              <input
                                type="tel"
                                value={anggota.nomorTelepon}
                                onChange={(e) => handleTeamInputChange(e, 'nomorTelepon', 'anggota', index)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] transition-all text-sm"
                                placeholder="No. Telepon"
                              />
                              <select
                                value={anggota.pendidikanTerakhir}
                                onChange={(e) => handleTeamInputChange(e, 'pendidikanTerakhir', 'anggota', index)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] transition-all text-sm"
                              >
                                <option value="">Pendidikan</option>
                                {pendidikanOptions.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Form Pendaftaran Individu */
                <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20">
                  <h2 className="text-xl font-bold text-[#0A1931] mb-6">Data Peserta</h2>
                  
                  <div className="space-y-4">
                    {/* Nama Lengkap */}
                    <div>
                      <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="namaLengkap"
                        value={formData.namaLengkap}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] transition-all ${
                          errors.namaLengkap ? 'border-red-500' : 'border-[#4A7FA7]/20'
                        }`}
                        placeholder="Masukkan nama lengkap"
                      />
                      {errors.namaLengkap && <p className="text-red-500 text-xs mt-1">{errors.namaLengkap}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                        Email Aktif <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] transition-all ${
                          errors.email ? 'border-red-500' : 'border-[#4A7FA7]/20'
                        }`}
                        placeholder="contoh@email.com"
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    {/* Nomor Telepon */}
                    <div>
                      <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                        Nomor Telepon <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="nomorTelepon"
                        value={formData.nomorTelepon}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] transition-all ${
                          errors.nomorTelepon ? 'border-red-500' : 'border-[#4A7FA7]/20'
                        }`}
                        placeholder="08xxxxxxxxxx"
                      />
                      {errors.nomorTelepon && <p className="text-red-500 text-xs mt-1">{errors.nomorTelepon}</p>}
                    </div>

                    {/* Alamat */}
                    <div>
                      <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                        Alamat <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="alamat"
                        value={formData.alamat}
                        onChange={handleInputChange}
                        rows="3"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] transition-all resize-none ${
                          errors.alamat ? 'border-red-500' : 'border-[#4A7FA7]/20'
                        }`}
                        placeholder="Masukkan alamat lengkap"
                      ></textarea>
                      {errors.alamat && <p className="text-red-500 text-xs mt-1">{errors.alamat}</p>}
                    </div>

                    {/* Pendidikan Terakhir */}
                    <div>
                      <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                        Pendidikan Terakhir <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="pendidikanTerakhir"
                        value={formData.pendidikanTerakhir}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] transition-all ${
                          errors.pendidikanTerakhir ? 'border-red-500' : 'border-[#4A7FA7]/20'
                        }`}
                      >
                        <option value="">Pilih pendidikan terakhir</option>
                        {pendidikanOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                      {errors.pendidikanTerakhir && <p className="text-red-500 text-xs mt-1">{errors.pendidikanTerakhir}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Order Summary / Informasi Pemesanan */}
              {selectedTicket && (
                <div className="bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-2xl shadow-lg p-6 text-white animate-scale-in hover:shadow-2xl hover:scale-[1.02] transition-all duration-500">
                  <h3 className="text-xl font-bold mb-4">Informasi Pemesanan</h3>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm opacity-90 mb-1">Event</p>
                        <p className="font-semibold text-base">{eventData.judul_kegiatan || eventData.name}</p>
                      </div>
                      
                      <div className="border-t border-white/20 pt-4">
                        <p className="text-sm opacity-90 mb-1">Paket Tiket</p>
                        <p className="font-bold text-lg mb-2">{selectedTicket.name}</p>
                        <p className="text-sm opacity-90">Harga: Rp {selectedTicket.price.toLocaleString('id-ID')}</p>
                      </div>
                      
                      <div className="border-t border-white/20 pt-4">
                        <p className="text-sm opacity-90 mb-1">Jumlah Tiket</p>
                        <p className="font-semibold text-base">{quantity} Tiket</p>
                      </div>
                      
                      <div className="border-t border-white/20 pt-4">
                        <p className="text-sm opacity-90 mb-2">Total Pembayaran</p>
                        <p className="text-3xl font-bold">Rp {(selectedTicket.price * quantity).toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 bg-white/10 rounded-lg p-3">
                    <p className="text-xs text-white/80 text-center">
                      <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Pastikan data yang Anda masukkan sudah benar
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full px-6 py-4 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-[#4A7FA7]/50 transition-all transform hover:scale-105 active:scale-95 relative overflow-hidden group"
              >
                <span className="relative z-10">
                  Daftar Sekarang
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#1A3D63] to-[#4A7FA7] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Jigsaw Captcha Modal */}
      {showCaptchaModal && (
        <JigsawCaptcha
          onSuccess={handleCaptchaSuccess}
          onError={() => {
            console.log('Captcha verification failed');
          }}
          onClose={() => {
            setShowCaptchaModal(false);
          }}
        />
      )}
    </div>
  );
}
