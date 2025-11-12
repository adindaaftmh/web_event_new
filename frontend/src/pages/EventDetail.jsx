import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { kegiatanService } from "../services/apiService";
import apiClient from "../config/api";

export default function EventDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [totalQuota, setTotalQuota] = useState(0);
  const [registeredCount, setRegisteredCount] = useState(0);
  const [showFlyerModal, setShowFlyerModal] = useState(false);
  const countRef = useRef(null);

  // Fetch event data from API
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
              console.log('Parsed tickets in EventDetail:', eventData.tickets);
            } catch (e) {
              console.error('Error parsing tickets:', e);
              eventData.tickets = [];
            }
          }
          
          console.log('EventData in EventDetail:', eventData);
          setEvent(eventData);
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

  // Fetch actual participant data from daftar-hadir
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await apiClient.get('/daftar-hadir');
        if (response.data?.success) {
          const allParticipants = response.data.data || [];
          console.log('All participants:', allParticipants);
          console.log('Event ID:', id);
          // Filter participants for this event (use kegiatan_id field)
          const eventParticipants = allParticipants.filter(
            participant => participant.kegiatan_id === parseInt(id) || participant.id_kegiatan === parseInt(id)
          );
          console.log('Filtered participants for event:', eventParticipants);
          setRegisteredCount(eventParticipants.length);
        }
      } catch (error) {
        console.error('Error fetching participants:', error);
      }
    };

    if (id) {
      fetchParticipants();
    }
  }, [id]);

  // Counter animation function
  const animateCounter = (targetValue) => {
    const duration = 2000; // 2 seconds
    const startTime = Date.now();
    const startValue = 0;

    const updateCounter = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutCubic);
      
      setParticipantCount(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };
    
    requestAnimationFrame(updateCounter);
  };

  // Intersection Observer for triggering counter animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Calculate total quota from tickets
            let totalCount = 0;
            if (event?.tickets && Array.isArray(event.tickets)) {
              event.tickets.forEach(ticket => {
                const quota = parseInt(ticket.quota || ticket.kuota || 0, 10);
                totalCount += (isNaN(quota) ? 0 : Math.max(quota, 0));
              });
            }
            // Set total quota
            setTotalQuota(totalCount);
            // Animate to registered count (actual participants)
            animateCounter(registeredCount);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => {
      if (countRef.current) {
        observer.unobserve(countRef.current);
      }
    };
  }, [event, registeredCount]);

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
    // Navigate directly to registration page
    navigate(`/event/${id}/register`);
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
        
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInRight {
          0% {
            opacity: 0;
            transform: translateX(20px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes gentleBounce {
          0% {
            opacity: 0;
            transform: translateY(15px) scale(0.95);
          }
          60% {
            opacity: 1;
            transform: translateY(-2px) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes popupHover {
          0% {
            transform: translateY(0) scale(1);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          100% {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          }
        }
        
        @keyframes iconPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        
        @keyframes slide-line {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(10px);
          }
        }
        .animate-slide-line {
          animation: slide-line 2s ease-in-out infinite;
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
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .animate-fade-in-right {
          animation: fadeInRight 0.6s ease-out forwards;
        }
        
        .animate-slide-up {
          animation: slideUp 0.8s ease-out forwards;
        }
        
        .animate-gentle-bounce {
          animation: gentleBounce 0.7s ease-out forwards;
        }
        
        .hover-popup {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .hover-popup:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        
        .icon-pulse {
          animation: iconPulse 2s ease-in-out infinite;
        }
        
        .animation-delay-200 {
          animation-delay: 0.15s;
        }
        
        .animation-delay-300 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-400 {
          animation-delay: 0.1s;
        }
        
        .animation-delay-500 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-600 {
          animation-delay: 0.3s;
        }
        
        .animation-delay-700 {
          animation-delay: 0.4s;
        }
        
        .animation-delay-800 {
          animation-delay: 0.3s;
        }
        
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
        
        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }
        
        /* Enhanced transitions for interactive elements */
        .transition-all {
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      {/* Navbar */}
      <Navbar />

      {/* Back Button */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#0A1931] hover:text-[#4A7FA7] font-bold transition-all duration-300 group"
        >
          <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </button> 
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Flyer and Event Info */}
          <div className="lg:col-span-1 space-y-4">
            {/* Flyer Image with Title - Larger Size */}
            <div className="relative bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden hover-popup animate-fade-in-up">
              {/* Category Badge */}
              <div className="absolute top-4 left-4 z-10">
                <span className="px-3 py-1 bg-[#B3CFE5]/90 backdrop-blur-sm text-[#0A1931] text-sm font-semibold rounded-full shadow-lg">
                  {eventData.kategori?.nama_kategori || eventData.category || 'kategori event'}
                </span>
              </div>
              
              {/* Flyer Image - Clickable untuk fullscreen */}
              <div className="aspect-[4/5] w-full bg-gray-100 cursor-pointer group relative" onClick={() => setShowFlyerModal(true)}>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="text-white text-center">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                    <p className="text-sm font-semibold">Klik untuk memperbesar</p>
                  </div>
                </div>
                
                {(() => {
                  let flyerSrc = null;
                  if (eventData.flyer_url) {
                    flyerSrc = eventData.flyer_url;
                  } else if (eventData.flyer_kegiatan) {
                    if (eventData.flyer_kegiatan.startsWith('http://') || eventData.flyer_kegiatan.startsWith('https://')) {
                      flyerSrc = eventData.flyer_kegiatan;
                    } else {
                      flyerSrc = `https://dynotix-production.up.railway.app/storage/${eventData.flyer_kegiatan}`;
                    }
                  }
                  
                  return flyerSrc ? (
                    <img
                      src={flyerSrc}
                      alt={eventData.judul_kegiatan || eventData.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                      e.target.onerror = null;
                      e.target.parentElement.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#4A7FA7]/20 to-[#1A3D63]/20">
                          <div class="text-center p-6">
                            <svg class="w-20 h-20 text-[#4A7FA7] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p class="text-[#4A7FA7] font-medium">Gagal Memuat Flyer</p>
                          </div>
                        </div>
                      `;
                    }}
                  />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#4A7FA7]/20 to-[#1A3D63]/20">
                      <div className="text-center p-6">
                        <svg className="w-20 h-20 text-[#4A7FA7] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-[#4A7FA7] font-medium">Flyer Tidak Tersedia</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
              
              {/* Event Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                <h1 className="text-xl font-bold text-white mb-1">
                  {eventData.judul_kegiatan || eventData.name}
                </h1>
                <p className="text-white/80 text-xs font-medium">Judul Kegiatan</p>
              </div>
            </div>

            {/* Ticket Purchase Card */}
            <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20 hover-popup animate-fade-in-up animation-delay-200">
              {/* Price Info */}
              <div className="text-center mb-6">
                <p className="text-sm text-[#4A7FA7] font-medium mb-2">Harga Tiket Mulai Dari</p>
                <p className="text-4xl font-bold text-[#0A1931] mb-1">
                  {(() => {
                    if (!eventData.tickets || !Array.isArray(eventData.tickets) || eventData.tickets.length === 0) {
                      return 'Rp 0';
                    }
                    
                    // Filter tiket dengan harga > 0
                    const paidTickets = eventData.tickets.filter(t => (t.harga || t.price || 0) > 0);
                    
                    // Jika ada tiket berbayar, tampilkan harga minimum
                    if (paidTickets.length > 0) {
                      const minPrice = Math.min(...paidTickets.map(t => t.harga || t.price || 0));
                      return `Rp ${minPrice.toLocaleString('id-ID')}`;
                    }
                    
                    // Jika semua tiket gratis
                    return 'GRATIS';
                  })()}
                </p>
                <p className="text-xs text-[#4A7FA7]/70">
                  {eventData.tickets && Array.isArray(eventData.tickets) && eventData.tickets.length > 0 ? 
                    `${eventData.tickets.length} paket tiket tersedia` : 
                    'Belum ada paket tiket'}
                </p>
              </div>

              {/* Ticket Packages Info */}
              {eventData.tickets && Array.isArray(eventData.tickets) && eventData.tickets.length > 0 && (
                <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-[#4A7FA7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                    <h4 className="text-sm font-bold text-[#0A1931]">Paket Tersedia:</h4>
                  </div>
                  <div className="space-y-2">
                    {eventData.tickets.map((ticket, idx) => (
                      <div key={ticket.id || idx} className="flex items-center justify-between text-xs">
                        <span className="text-[#4A7FA7] font-medium">• {ticket.nama_tiket || ticket.name}</span>
                        <span className="font-bold text-[#0A1931]">Rp {(ticket.harga || ticket.price || 0).toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA Button */}
              <button
                onClick={handleRegister}
                className="w-full py-4 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-bold rounded-xl hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                Pilih Tiket & Daftar
              </button>

              <p className="text-xs text-[#4A7FA7] text-center mt-4">
                Klik tombol di atas untuk memilih paket tiket dan melanjutkan pendaftaran
              </p>
            </div>

          </div>

          {/* Right Column - Event Details */}
          <div className="lg:col-span-1 space-y-4">
            {/* Event Description Card */}
            <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-lg p-4 border border-white/20 hover-popup animate-fade-in-right">
              <div className="mb-3">
                <h2 className="text-lg font-bold text-[#0A1931] inline-block">Deskripsi Event</h2>
                {/* Animated Underline */}
                <div className="h-1 w-32 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] rounded-full mt-1 animate-slide-line"></div>
              </div>
              <p className="text-[#4A7FA7] leading-relaxed">
                {eventData.deskripsi_kegiatan || eventData.description}
              </p>
            </div>

            {/* Event Info Cards - 2x2 Grid */}
            <div className="grid grid-cols-2 gap-3 animate-fade-in-right animation-delay-300">
              {/* Date Card */}
              <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-lg p-3 border border-white/20 hover-popup animate-gentle-bounce animation-delay-400">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#4A7FA7] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-[#4A7FA7] uppercase tracking-wide">Tanggal</h3>
                    <p className="text-[#0A1931] font-bold text-sm">
                      {eventData.waktu_mulai ? new Date(eventData.waktu_mulai).toLocaleDateString('id-ID', { 
                        day: 'numeric',
                        month: 'short', 
                        year: 'numeric'
                      }) : eventData.date}
                    </p>
                  </div>
                </div>
              </div>

              {/* Time Card */}
              <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-lg p-3 border border-white/20 hover-popup animate-gentle-bounce animation-delay-500">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#4A7FA7] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-[#4A7FA7] uppercase tracking-wide">Waktu</h3>
                    <p className="text-[#0A1931] font-bold text-sm">
                      {eventData.waktu_mulai && eventData.waktu_berakhir ? 
                        `${new Date(eventData.waktu_mulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - ${new Date(eventData.waktu_berakhir).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}` : 
                        eventData.time
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Location Card */}
              <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-lg p-3 border border-white/20 hover-popup animate-gentle-bounce animation-delay-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#4A7FA7] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-[#4A7FA7] uppercase tracking-wide">Lokasi</h3>
                    <p className="text-[#0A1931] font-bold text-sm">{eventData.lokasi_kegiatan || eventData.location}</p>
                  </div>
                </div>
              </div>

              {/* Organizer Card */}
              <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-lg p-3 border border-white/20 hover-popup animate-gentle-bounce animation-delay-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#4A7FA7] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-[#4A7FA7] uppercase tracking-wide">Penyelenggara</h3>
                    <p className="text-[#0A1931] font-bold text-sm">
                      {eventData.penyelenggara || eventData.organizer || 'Penyelenggara belum tersedia'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Card */}
            <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-lg p-4 border border-white/20 hover-popup animate-fade-in-right animation-delay-800">
              <h3 className="text-lg font-bold text-[#0A1931] mb-3">Lokasi di Peta</h3>
              <div className="w-full h-48 rounded-xl overflow-hidden">
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

            {/* Participant Information */}
            <div 
              ref={countRef}
              className="relative bg-gradient-to-br from-[#F6FAFD]/95 via-[#E8F4FD]/90 to-[#F6FAFD]/95 backdrop-blur-xl rounded-2xl shadow-xl p-5 border border-white/30 hover-popup animate-slide-up overflow-hidden"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-4 right-4 w-24 h-24 bg-[#4A7FA7] rounded-full blur-3xl"></div>
                <div className="absolute bottom-4 left-4 w-20 h-20 bg-[#B3CFE5] rounded-full blur-2xl"></div>
              </div>
              
              <div className="relative z-10">
                {/* Header Section */}
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-[#0A1931] mb-1">Peserta Terdaftar</h3>
                  <p className="text-sm text-[#4A7FA7]/70 font-medium">Jumlah peserta yang sudah mendaftar</p>
                </div>

                {/* Counter Display with Icon */}
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/60 shadow-inner">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#4A7FA7] via-[#5B8BC4] to-[#1A3D63] rounded-xl flex items-center justify-center shadow-lg icon-pulse">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                        </svg>
                      </div>
                      {/* Pulse Ring */}
                      <div className="absolute inset-0 rounded-xl bg-[#4A7FA7]/20 animate-ping"></div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-transparent bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] bg-clip-text tabular-nums">
                        {participantCount}
                      </span>
                      <span className="text-2xl font-bold text-[#4A7FA7]/60">/</span>
                      <span className="text-2xl font-bold text-[#4A7FA7]/80 tabular-nums">
                        {totalQuota}
                      </span>
                      <span className="text-base font-semibold text-[#4A7FA7]">Tempat</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-[#4A7FA7]/80 mb-2">
                    <span>Tingkat Pengisian</span>
                    <span className="font-semibold">
                      {(() => {
                        // Calculate total capacity from tickets
                        let totalCapacity = 0;
                        if (event?.tickets && Array.isArray(event.tickets)) {
                          totalCapacity = event.tickets.reduce((sum, ticket) => {
                            const quota = parseInt(ticket.quota || ticket.kuota || 0, 10);
                            return sum + (isNaN(quota) ? 0 : quota);
                          }, 0);
                        }
                        const percentage = totalCapacity > 0 ? Math.round((participantCount / totalCapacity) * 100) : 0;
                        return `${isNaN(percentage) ? 0 : percentage}% Terisi`;
                      })()}
                    </span>
                  </div>
                  <div className="w-full bg-white/60 rounded-full h-2 overflow-hidden shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] rounded-full transition-all duration-1000 ease-out shadow-sm"
                      style={{ 
                        width: `${(() => {
                          let totalCapacity = 0;
                          if (event?.tickets && Array.isArray(event.tickets)) {
                            totalCapacity = event.tickets.reduce((sum, ticket) => {
                              const quota = parseInt(ticket.quota || ticket.kuota || 0, 10);
                              return sum + (isNaN(quota) ? 0 : quota);
                            }, 0);
                          }
                          const percentage = totalCapacity > 0 ? (participantCount / totalCapacity) * 100 : 0;
                          return Math.min(isNaN(percentage) ? 0 : percentage, 100);
                        })()}%` 
                      }}
                    ></div>
                  </div>
                </div>

                {/* Description */}
                <div className="text-center">
                  <p className="text-xs text-[#4A7FA7]/80 leading-relaxed">
                    {(() => {
                      const remaining = totalQuota - participantCount;
                      if (remaining > 0) {
                        return <>Buruan daftar! Masih tersisa <span className="font-semibold text-[#0A1931]">{remaining} tempat</span> untuk event menarik ini</>;
                      } else {
                        return <><span className="font-semibold text-[#0A1931]">Kuota sudah penuh!</span> Pantau terus untuk event selanjutnya</>;
                      }
                    })()}
                  </p>
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}
