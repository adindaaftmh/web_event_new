import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import AssistiveTouchNav from "../components/AssistiveTouchNav";
import { kegiatanService } from "../services/apiService";

export default function EventDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch event data from API
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await kegiatanService.getById(id);
        if (response.data.success) {
          setEvent(response.data.data);
        } else {
          setError('Event tidak ditemukan');
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Gagal memuat data event');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  // Mock data structure for fallback
  const mockEvent = {
    id: 1,
    name: "Workshop Digital Marketing 2025",
    banner: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200",
    status: "Tersedia",
    date: "15 Juli 2025",
    time: "09:00 - 17:00 WIB",
    location: "Grand Ballroom Hotel Santika, Jakarta Selatan",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.3293!2d106.8229!3d-6.2088!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTInMzEuNyJTIDEwNsKwNDknMjIuNCJF!5e0!3m2!1sen!2sid!4v1234567890",
    organizer: "Event Atraksi Indonesia",
    category: "Edukasi",
    rating: 4.8,
    totalReviews: 245,
    description: `Workshop Digital Marketing 2025 adalah program pelatihan intensif yang dirancang khusus untuk meningkatkan kemampuan digital marketing Anda. 

Dalam workshop ini, Anda akan belajar strategi pemasaran digital terkini, teknik SEO, social media marketing, content marketing, dan analytics yang akan membantu bisnis Anda berkembang di era digital.

Program ini cocok untuk entrepreneur, marketing professional, dan siapa saja yang ingin menguasai digital marketing.`,
    agenda: [
      { time: "09:00 - 09:30", activity: "Registrasi & Welcome Coffee" },
      { time: "09:30 - 11:00", activity: "Sesi 1: Fundamental Digital Marketing" },
      { time: "11:00 - 11:15", activity: "Coffee Break" },
      { time: "11:15 - 12:45", activity: "Sesi 2: Social Media Marketing Strategy" },
      { time: "12:45 - 13:45", activity: "Lunch Break" },
      { time: "13:45 - 15:15", activity: "Sesi 3: Content Marketing & SEO" },
      { time: "15:15 - 15:30", activity: "Coffee Break" },
      { time: "15:30 - 17:00", activity: "Sesi 4: Analytics & Performance Measurement" }
    ],
    tickets: [
      {
        id: 1,
        name: "Early Bird",
        price: 138000,
        features: ["Akses semua sesi", "Materi digital", "Sertifikat"],
        quota: 50,
        available: 12
      },
      {
        id: 2,
        name: "Regular",
        price: 250000,
        features: ["Akses semua sesi", "Materi digital", "Sertifikat", "Lunch"],
        quota: 100,
        available: 45
      },
      {
        id: 3,
        name: "VIP",
        price: 500000,
        features: ["Akses semua sesi", "Materi digital", "Sertifikat", "Lunch", "1-on-1 Consultation", "VIP Seating"],
        quota: 20,
        available: 8
      }
    ],
    reviews: [
      {
        id: 1,
        name: "Budi Santoso",
        rating: 5,
        date: "10 Juni 2025",
        comment: "Workshop yang sangat bermanfaat! Materi lengkap dan instruktur sangat kompeten. Recommended!"
      },
      {
        id: 2,
        name: "Siti Nurhaliza",
        rating: 5,
        date: "8 Juni 2025",
        comment: "Materi praktis dan langsung applicable untuk bisnis. Worth it banget!"
      },
      {
        id: 3,
        name: "Ahmad Wijaya",
        rating: 4,
        date: "5 Juni 2025",
        comment: "Overall bagus, tapi waktunya terlalu padat. Mungkin bisa dibagi 2 hari."
      }
    ]
  };

  const handleRegister = () => {
    if (!selectedTicket) {
      alert("Silakan pilih paket tiket terlebih dahulu");
      return;
    }
    // Navigate ke halaman pembayaran atau registrasi
    navigate(`/register-event/${id}`, {
      state: { event: eventData, ticket: selectedTicket, quantity }
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen relative bg-gradient-to-br from-slate-100 via-blue-50/30 to-indigo-100/40 overflow-hidden flex items-center justify-center">
        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-blue-400/25 to-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/20 to-pink-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#4A7FA7] mx-auto"></div>
          <p className="mt-4 text-[#0A1931]">Memuat data event...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen relative bg-gradient-to-br from-slate-100 via-blue-50/30 to-indigo-100/40 overflow-hidden flex items-center justify-center">
        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-blue-400/25 to-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/20 to-pink-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="text-center relative z-10">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-[#0A1931] mb-2">Oops!</h2>
          <p className="text-[#4A7FA7] mb-4">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-[#4A7FA7] text-white rounded-lg hover:bg-[#4A7FA7]/80 transition-colors"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  // If no event data, use mock data as fallback
  const eventData = event || mockEvent;

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-slate-100 via-blue-50/30 to-indigo-100/40 overflow-hidden">
      {/* Animated Background Accent - Glassmorphism Theme with Bubbles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Large Blur Blobs - Gradient Theme */}
        <div className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-blue-400/25 to-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/20 to-pink-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-[450px] h-[450px] bg-gradient-to-br from-cyan-400/20 to-blue-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-gradient-to-br from-violet-400/15 to-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
        
        {/* Floating Transparent Bubbles - Gradient Theme */}
        <div className="absolute top-32 left-[15%] w-24 h-24 border-2 border-blue-400/50 rounded-full animate-float bg-gradient-to-br from-blue-200/20 to-indigo-300/15"></div>
        <div className="absolute top-64 right-[20%] w-32 h-32 border-2 border-purple-400/45 rounded-full animate-float bg-gradient-to-br from-purple-200/20 to-pink-300/15" style={{ animationDelay: '1.5s', animationDuration: '8s' }}></div>
        <div className="absolute bottom-40 left-[25%] w-20 h-20 border-2 border-cyan-400/50 rounded-full animate-float bg-gradient-to-br from-cyan-200/20 to-blue-300/15" style={{ animationDelay: '3s', animationDuration: '10s' }}></div>
        <div className="absolute top-[45%] left-[8%] w-16 h-16 border border-violet-400/60 rounded-full animate-float bg-gradient-to-br from-violet-200/25 to-purple-300/20" style={{ animationDelay: '2s', animationDuration: '9s' }}></div>
        
        {/* Additional Gradient Overlays */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-cyan-500/8 to-transparent pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-r from-indigo-500/6 to-transparent pointer-events-none"></div>
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

      {/* Navbar */}
      <Navbar />

      {/* Hero Banner */}
      <div className="relative h-96 mt-20">
        {/* Back to Home Button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 z-10 flex items-center gap-2 px-4 py-2 bg-[#F6FAFD]/90 backdrop-blur-xl hover:bg-[#F6FAFD] text-[#0A1931] rounded-full shadow-md border border-white/20 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-semibold">Kembali</span>
        </button>
        <img
          src={eventData.flyer_kegiatan || eventData.banner}
          alt={eventData.judul_kegiatan || eventData.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        {/* Status Badge */}
        <div className="absolute top-6 right-6">
          <span className="px-4 py-2 bg-[#B3CFE5] text-[#0A1931] text-sm font-bold rounded-full shadow-lg">
            Tersedia
          </span>
        </div>

        {/* Event Title */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-2xl">
              {eventData.judul_kegiatan || eventData.name}
            </h1>
            <div className="flex items-center gap-4 text-white/90">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                {eventData.kategori?.nama_kategori || eventData.category}
              </span>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
                <span className="font-semibold">4.8</span>
                <span className="text-sm">(245 reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Info Card */}
            <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-[#0A1931] mb-6">Informasi Event</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#B3CFE5] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#0A1931]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-[#4A7FA7]">Tanggal</p>
                    <p className="font-semibold text-[#0A1931]">
                      {eventData.waktu_mulai ? new Date(eventData.waktu_mulai).toLocaleDateString('id-ID', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : eventData.date}
                    </p>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#B3CFE5] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#0A1931]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-[#4A7FA7]">Waktu</p>
                    <p className="font-semibold text-[#0A1931]">
                      {eventData.waktu_mulai && eventData.waktu_berakhir ? 
                        `${new Date(eventData.waktu_mulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - ${new Date(eventData.waktu_berakhir).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB` : 
                        eventData.time
                      }
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4 md:col-span-2">
                  <div className="w-12 h-12 bg-[#B3CFE5] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#0A1931]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-[#4A7FA7]">Lokasi</p>
                    <p className="font-semibold text-[#0A1931]">{eventData.lokasi_kegiatan || eventData.location}</p>
                  </div>
                </div>

                {/* Organizer */}
                <div className="flex items-start gap-4 md:col-span-2">
                  <div className="w-12 h-12 bg-[#B3CFE5] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#0A1931]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-[#4A7FA7]">Penyelenggara</p>
                    <p className="font-semibold text-[#0A1931]">Event Atraksi Indonesia</p>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="mt-6">
                <h3 className="font-semibold text-[#0A1931] mb-3">Lokasi di Peta</h3>
                <div className="w-full h-64 rounded-xl overflow-hidden">
                  <iframe
                    src={eventData.lokasi_kegiatan ? `https://www.google.com/maps?q=${encodeURIComponent(eventData.lokasi_kegiatan)}&output=embed` : (eventData.mapUrl || '')}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-[#0A1931] mb-4">Deskripsi Event</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-[#4A7FA7] leading-relaxed whitespace-pre-line">
                  {eventData.deskripsi_kegiatan || eventData.description}
                </p>
              </div>
            </div>

            {/* Agenda */}
            <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-[#0A1931] mb-6">Agenda Acara</h2>
              <div className="space-y-4">
                {(eventData.agenda || []).map((item, index) => (
                  <div key={index} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                    <div className="flex-shrink-0 w-32">
                      <span className="inline-block px-3 py-1 bg-[#B3CFE5] text-[#0A1931] text-sm font-semibold rounded-lg">
                        {item.time}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[#0A1931] font-medium">{item.activity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#0A1931]">Reviews</h2>
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                  <span className="text-2xl font-bold text-[#0A1931]">{eventData.rating || 4.8}</span>
                  <span className="text-[#4A7FA7]">/ 5</span>
                </div>
              </div>

              <div className="space-y-6">
                {(eventData.reviews || []).map((review) => (
                  <div key={review.id} className="pb-6 border-b border-gray-200 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-[#0A1931]">{review.name}</h4>
                        <p className="text-sm text-[#4A7FA7]">{review.date}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-[#4A7FA7]">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Ticket Selection */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border-2 border-[#4A7FA7]/20">
                <h2 className="text-2xl font-bold text-[#0A1931] mb-6">Pilih Tiket</h2>
                
                <div className="space-y-4 mb-6">
                  {(eventData.tickets || []).map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                        selectedTicket?.id === ticket.id
                          ? 'border-[#4A7FA7] bg-[#B3CFE5]/20 shadow-lg'
                          : 'border-[#4A7FA7]/20 hover:border-[#4A7FA7] hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-[#0A1931]">{ticket.name}</h3>
                          <p className="text-2xl font-bold text-[#4A7FA7] mt-1">
                            Rp {ticket.price.toLocaleString('id-ID')}
                          </p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedTicket?.id === ticket.id
                            ? 'border-[#4A7FA7] bg-[#4A7FA7]'
                            : 'border-[#4A7FA7]/30'
                        }`}>
                          {selectedTicket?.id === ticket.id && (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        {ticket.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-[#4A7FA7]">
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {feature}
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#4A7FA7]">Tersisa:</span>
                        <span className="font-semibold text-[#0A1931]">{ticket.available} / {ticket.quota}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quantity Selector */}
                {selectedTicket && (
                  <div className="mb-6 p-4 bg-[#B3CFE5]/20 rounded-xl">
                    <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                      Jumlah Tiket
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 bg-[#F6FAFD] border-2 border-[#4A7FA7]/30 rounded-lg flex items-center justify-center text-[#0A1931] hover:bg-[#F6FAFD]/80 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="flex-1 text-center text-xl font-bold bg-[#F6FAFD] border-2 border-[#4A7FA7]/30 rounded-lg py-2"
                        min="1"
                      />
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 bg-[#F6FAFD] border-2 border-[#4A7FA7]/30 rounded-lg flex items-center justify-center text-[#0A1931] hover:bg-[#F6FAFD]/80 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Total Price */}
                {selectedTicket && (
                  <div className="mb-6 p-4 bg-[#B3CFE5]/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[#4A7FA7]">Total Harga:</span>
                      <span className="text-2xl font-bold text-[#0A1931]">
                        Rp {(selectedTicket.price * quantity).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                <button
                  onClick={handleRegister}
                  className="w-full py-4 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-bold rounded-xl hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Daftar Sekarang
                </button>

                <p className="text-xs text-[#4A7FA7] text-center mt-4">
                  Dengan mendaftar, Anda menyetujui syarat dan ketentuan kami
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AssistiveTouch Navigation */}
      <AssistiveTouchNav />
    </div>
  );
}
