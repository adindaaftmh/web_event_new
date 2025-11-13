import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEvents } from '../contexts/EventContext';
import Navbar from '../components/Navbar';
import oceanBg from "../assets/ocean.jpg";
import apiClient from '../config/api';

export default function CategoryEvents() {
  const navigate = useNavigate();
  const { category } = useParams();
  const { events, loading } = useEvents();
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [sortBy, setSortBy] = useState('terdekat'); // terdekat, terlama, termurah, terpopuler
  const [animatedCounts, setAnimatedCounts] = useState({});
  const [participants, setParticipants] = useState([]);

  // Category configuration - All using Edukasi color scheme
  const categoryConfig = {
    'olahraga': {
      name: 'Olahraga',
      icon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-blue-500 via-indigo-500 to-violet-600',
      bgGradient: 'from-blue-50/30 via-indigo-50/20 to-violet-50/30',
      cardGradient: 'from-blue-400 to-indigo-500',
      accentColor: 'blue-500',
      description: 'Berbagai event olahraga menarik untuk meningkatkan kesehatan dan kebugaran'
    },
    'hiburan': {
      name: 'Hiburan',
      icon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      ),
      gradient: 'from-blue-500 via-indigo-500 to-violet-600',
      bgGradient: 'from-blue-50/30 via-indigo-50/20 to-violet-50/30',
      cardGradient: 'from-blue-400 to-indigo-500',
      accentColor: 'blue-500',
      description: 'Konser, festival, dan berbagai hiburan untuk mengisi waktu luang Anda'
    },
    'edukasi': {
      name: 'Edukasi',
      icon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      gradient: 'from-blue-500 via-indigo-500 to-violet-600',
      bgGradient: 'from-blue-50/30 via-indigo-50/20 to-violet-50/30',
      cardGradient: 'from-blue-400 to-indigo-500',
      accentColor: 'blue-500',
      description: 'Workshop, seminar, dan pelatihan untuk meningkatkan pengetahuan dan keterampilan'
    },
    'seni-budaya': {
      name: 'Seni Budaya',
      icon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      gradient: 'from-blue-500 via-indigo-500 to-violet-600',
      bgGradient: 'from-blue-50/30 via-indigo-50/20 to-violet-50/30',
      cardGradient: 'from-blue-400 to-indigo-500',
      accentColor: 'blue-500',
      description: 'Pameran, pertunjukan, dan festival budaya untuk melestarikan warisan nusantara'
    }
  };

  const currentCategory = categoryConfig[category] || categoryConfig['olahraga'];

  // Fetch participants data
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await apiClient.get('/daftar-hadir');
        if (response.data?.success) {
          setParticipants(response.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching participants:', error);
      }
    };
    fetchParticipants();
  }, []);

  // Get participant count for an event
  const getEventParticipantCount = (eventId) => {
    const filtered = participants.filter(p => p.kegiatan_id === eventId || p.id_kegiatan === eventId);
    return filtered.length;
  };

  // Filter events by category and scroll to top
  useEffect(() => {
    // Scroll to top when category changes
    window.scrollTo(0, 0);
    
    if (events.length > 0) {
      const filtered = events.filter(event => {
        // Get category from nested object or direct property
        const eventCategoryName = event.kategori?.nama_kategori || event.kategori_kegiatan || '';
        const eventCategory = eventCategoryName.toLowerCase().replace(/\s+/g, '-');
        
        return eventCategory === category;
      });
      
      setFilteredEvents(filtered);
    }
  }, [events, category]);

  // Helper to check if event has ended
  const isEventEndedCheck = (event) => {
    const now = new Date();
    const endTime = event.waktu_selesai ? new Date(event.waktu_selesai) : (event.waktu_mulai ? new Date(event.waktu_mulai) : null);
    if (!endTime) return false;
    return now > endTime;
  };

  // Sort events - separate active and ended events
  const sortedEvents = (() => {
    // Separate active and ended events
    const activeEvents = filteredEvents.filter(event => !isEventEndedCheck(event));
    const endedEvents = filteredEvents.filter(event => isEventEndedCheck(event));

    // Sort active events based on selected filter
    activeEvents.sort((a, b) => {
      const now = new Date();
      
      switch (sortBy) {
        case 'terdekat': {
          const dateA = new Date(a.waktu_mulai || 0);
          const dateB = new Date(b.waktu_mulai || 0);
          return dateA - dateB; // Closest first
        }
        case 'terlama': {
          const dateA = new Date(a.waktu_mulai || 0);
          const dateB = new Date(b.waktu_mulai || 0);
          return dateB - dateA; // Farthest first
        }
        case 'termurah': {
          const priceA = parseFloat(a.harga_tiket || a.tickets?.[0]?.price || 999999999);
          const priceB = parseFloat(b.harga_tiket || b.tickets?.[0]?.price || 999999999);
          return priceA - priceB; // Cheapest first
        }
        case 'terpopuler': {
          const countA = getEventParticipantCount(a.id);
          const countB = getEventParticipantCount(b.id);
          return countB - countA; // Most participants first
        }
        default:
          return 0;
      }
    });

    // Sort ended events by date (most recent first)
    endedEvents.sort((a, b) => new Date(b.waktu_mulai || 0) - new Date(a.waktu_mulai || 0));

    // Combine: active events first, then ended events
    return [...activeEvents, ...endedEvents];
  })();

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "TBA";
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Helper function to format time
  const formatTime = (dateString) => {
    if (!dateString) return "TBA";
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    }) + " WIB";
  };

  // Check if event has ended
  const isEventEnded = (event) => {
    const now = new Date();
    // Check waktu_selesai first, if not available check waktu_mulai
    const endTime = event.waktu_selesai ? new Date(event.waktu_selesai) : (event.waktu_mulai ? new Date(event.waktu_mulai) : null);
    
    if (!endTime) return false;
    return now > endTime;
  };

  // Display participant count for visible events (instant, no animation)
  useEffect(() => {
    if (participants.length === 0 || sortedEvents.length === 0) return;
    
    const newCounts = {};
    sortedEvents.forEach((event) => {
      const count = getEventParticipantCount(event.id);
      const countKey = `event-${event.id}`;
      newCounts[countKey] = count;
    });
    
    setAnimatedCounts(prev => ({ ...prev, ...newCounts }));
  }, [sortedEvents, participants]);

  return (
    <>
      {/* Animated Background Accent */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Large Blur Blobs */}
        <div className={`absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br ${currentCategory.cardGradient} opacity-20 rounded-full blur-3xl animate-pulse`}></div>
        <div className={`absolute top-40 right-10 w-[500px] h-[500px] bg-gradient-to-br ${currentCategory.cardGradient} opacity-15 rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '1s' }}></div>
        <div className={`absolute bottom-20 left-1/3 w-[450px] h-[450px] bg-gradient-to-br ${currentCategory.cardGradient} opacity-15 rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '2s' }}></div>
        
        {/* Floating Bubbles */}
        <div className={`absolute top-32 left-[15%] w-24 h-24 border-2 border-${currentCategory.accentColor}/50 rounded-full animate-float bg-gradient-to-br from-${currentCategory.accentColor}/20 to-${currentCategory.accentColor}/10`}></div>
        <div className={`absolute top-64 right-[20%] w-32 h-32 border-2 border-${currentCategory.accentColor}/45 rounded-full animate-float`} style={{ animationDelay: '1.5s', animationDuration: '8s' }}></div>
        <div className={`absolute bottom-40 left-[25%] w-20 h-20 border-2 border-${currentCategory.accentColor}/50 rounded-full animate-float`} style={{ animationDelay: '3s', animationDuration: '10s' }}></div>
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
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
      `}</style>

      {/* Navbar */}
      <Navbar />

      {/* Hero Section with Category Banner */}
      <div 
        className="relative h-[20rem] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${oceanBg})` }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Gradient overlay matching category */}
        <div className={`absolute inset-0 bg-gradient-to-br ${currentCategory.gradient} opacity-40`} />
        
        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center justify-center px-4 pt-2">
          <div className="max-w-4xl mx-auto text-center">
            {/* Category Icon */}
            <div className="mb-2 text-white drop-shadow-2xl">
              {currentCategory.icon}
            </div>
            
            {/* Category Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-1 drop-shadow-2xl">
              Event {currentCategory.name}
            </h1>
            
            {/* Category Description */}
            <p className="text-lg text-white/90 drop-shadow-lg max-w-2xl mx-auto mb-2">
              {currentCategory.description}
            </p>
            
            {/* Event Count Badge */}
            <div className="inline-block">
              <div className="bg-white/20 backdrop-blur-md rounded-full px-5 py-2 border border-white/30">
                <span className="text-white font-bold text-base">
                  {filteredEvents.length} Event Tersedia
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className={`relative py-12 min-h-screen bg-gradient-to-b ${currentCategory.bgGradient}`}>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Filter and Sort Section */}
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <button onClick={() => navigate('/')} className="hover:text-gray-900 transition-colors">
                Beranda
              </button>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="font-semibold text-gray-900">{currentCategory.name}</span>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-gray-700">Urutkan:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-4 py-2 bg-white/90 backdrop-blur-sm border-2 border-${currentCategory.accentColor}/20 rounded-lg text-gray-700 focus:border-${currentCategory.accentColor} focus:outline-none transition-colors shadow-sm`}
              >
                <option value="terdekat">Terdekat</option>
                <option value="terlama">Terlama</option>
                <option value="termurah">Termurah</option>
                <option value="terpopuler">Terpopuler</option>
              </select>
            </div>
          </div>

          {/* Events Grid */}
          {loading ? (
            // Loading skeleton
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="bg-white/90 backdrop-blur-xl rounded-xl border-2 border-gray-200 overflow-hidden shadow-lg animate-pulse">
                  <div className="h-56 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-3"></div>
                    <div className="h-6 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : sortedEvents.length === 0 ? (
            // Empty state
            <div className="text-center py-20">
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-12 max-w-md mx-auto border border-white/20">
                <div className={`w-24 h-24 mx-auto mb-6 bg-gradient-to-br ${currentCategory.cardGradient} rounded-full flex items-center justify-center text-white`}>
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Belum Ada Event
                </h3>
                <p className="text-gray-600 mb-6">
                  Saat ini belum ada event dalam kategori {currentCategory.name}. Silakan cek kembali nanti!
                </p>
                <button
                  onClick={() => navigate('/')}
                  className={`px-6 py-3 bg-gradient-to-r ${currentCategory.cardGradient} text-white font-semibold rounded-lg hover:shadow-lg transition-all`}
                >
                  Kembali ke Beranda
                </button>
              </div>
            </div>
          ) : (
            // Events grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedEvents.map((event, index) => {
                const eventEnded = isEventEnded(event);
                return (
                <div
                  key={event.id}
                  onClick={() => !eventEnded && navigate(`/event/${event.id}`)}
                  className={`bg-[#F6FAFD]/90 backdrop-blur-xl rounded-xl border-2 overflow-hidden shadow-lg transition-all duration-500 ease-in-out group animate-fade-in-up ${
                    eventEnded 
                      ? 'opacity-70 grayscale cursor-not-allowed border-gray-300 hover:scale-100' 
                      : 'cursor-pointer border-[#4A7FA7]/20 hover:scale-105 hover:-translate-y-6 hover:shadow-2xl hover:shadow-[#4A7FA7]/30 hover:border-[#4A7FA7] hover:ring-2 hover:ring-[#4A7FA7]/50'
                  }`}
                  style={{
                    animationDelay: `${index * 0.15}s`,
                    animationFillMode: 'both',
                    willChange: 'transform, box-shadow'
                  }}
                >
                  {/* Flyer Image Area */}
                  <div className="relative h-56 bg-gradient-to-br from-[#1A3D63] via-[#4A7FA7] to-[#0A1931] flex items-center justify-center overflow-hidden group-hover:from-[#4A7FA7] group-hover:via-[#1A3D63] group-hover:to-[#0A1931] transition-all duration-500">
                    {(() => {
                      // Get flyer source - handle both full URL and path
                      let flyerSrc = null;
                      
                      if (event.flyer_url) {
                        // Backend provides full URL
                        flyerSrc = event.flyer_url;
                      } else if (event.flyer_kegiatan) {
                        // Check if flyer_kegiatan is already a full URL or just a path
                        if (event.flyer_kegiatan.startsWith('http://') || event.flyer_kegiatan.startsWith('https://')) {
                          // Already a full URL, use as is
                          flyerSrc = event.flyer_kegiatan;
                        } else {
                          // It's a path, construct full URL
                          flyerSrc = `http://localhost:8000/storage/${event.flyer_kegiatan}`;
                        }
                      }
                      
                      return flyerSrc ? (
                        <img
                          src={flyerSrc}
                          alt={event.judul_kegiatan}
                          className="absolute inset-0 w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            // Hide broken image and show placeholder
                            e.target.style.display = 'none';
                            const placeholder = e.target.parentElement.querySelector('.flyer-placeholder');
                            if (placeholder) placeholder.style.display = 'flex';
                          }}
                        />
                      ) : null;
                    })()}
                    
                    {/* Fallback UI - shown by default if no image, or on error */}
                    <div className={`flyer-placeholder absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-110 ${(event.flyer_url || event.flyer_kegiatan) ? 'hidden' : 'flex'}`}>
                      <p className="absolute inset-0 flex items-center justify-center text-white/40 text-2xl font-bold group-hover:scale-110 transition-transform duration-500">Flyer</p>
                    </div>
                    
                    <div className={`absolute inset-0 ${eventEnded ? 'bg-black/50' : 'bg-black/10'}`} />
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      {eventEnded ? (
                        <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-md flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          Berakhir
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-md flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Tersedia
                        </span>
                      )}
                    </div>
                    {/* Event Ended Overlay Text */}
                    {eventEnded && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/70 backdrop-blur-sm px-6 py-3 rounded-xl border-2 border-white/30">
                          <p className="text-white font-bold text-lg drop-shadow-lg">Event Telah Berakhir</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Event Info */}
                  <div className="p-4 bg-white/90 backdrop-blur-xl flex flex-col">
                    {/* Location */}
                    <div className="flex items-center gap-2 text-[#4A7FA7] text-sm mb-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{event.lokasi_kegiatan}</span>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-[#4A7FA7] text-sm mb-3">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{formatDate(event.waktu_mulai)}</span>
                    </div>

                    {/* Event Title - Fixed height */}
                    <h3 className="text-[#0A1931] font-bold text-lg mb-2 group-hover:text-[#4A7FA7] transition-colors duration-300 line-clamp-2 min-h-[3.5rem]">
                      {event.judul_kegiatan}
                    </h3>

                    {/* Event Description */}
                    <p className="text-[#4A7FA7]/80 text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
                      {event.deskripsi_kegiatan || 'Event menarik yang tidak boleh dilewatkan. Segera daftarkan diri Anda!'}
                    </p>

                    {/* Participant Count with Animation */}
                    <div className="flex items-center gap-1.5 mb-1">
                      <svg className="w-4 h-4 text-[#4A7FA7]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      <span className="text-[#4A7FA7] text-sm font-semibold">
                        {animatedCounts[`event-${event.id}`] || 0} peserta
                      </span>
                    </div>

                    {/* Price */}
                    {(() => {
                        // Get price from harga_tiket field
                        const hargaTiket = event.harga_tiket;
                        
                        // Parse and validate price
                        let price = 0;
                        if (hargaTiket !== null && hargaTiket !== undefined && hargaTiket !== '') {
                          price = typeof hargaTiket === 'string' 
                            ? parseFloat(hargaTiket.replace(/[^0-9.]/g, '')) 
                            : parseFloat(hargaTiket);
                          price = isNaN(price) ? 0 : price;
                        }
                        
                        // Show price if > 0, otherwise show GRATIS
                        if (price > 0) {
                          return (
                            <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 -mx-4 -mb-4 px-4 py-3 border-t border-green-100">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600 text-xs font-medium">Harga Mulai Dari</span>
                              </div>
                              <div className="flex items-baseline gap-1">
                                <span className="text-green-600 font-bold text-lg tracking-tight">
                                  Rp {price.toLocaleString('id-ID')}
                                </span>
                              </div>
                            </div>
                          );
                        }
                        
                        // Free event
                        return (
                          <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 -mx-4 -mb-4 px-4 py-3 border-t border-green-100">
                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-green-600 font-bold text-lg">GRATIS</span>
                          </div>
                        );
                      })()}
                  </div>
                </div>
                );
              })}
            </div>
          )}

          {/* Show More Button (if needed) */}
          {sortedEvents.length > 0 && (
            <div className="mt-12 text-center">
              <div className="inline-block bg-white/90 backdrop-blur-xl rounded-full px-6 py-3 shadow-lg border border-white/20">
                <p className="text-gray-700 font-semibold">
                  Menampilkan {sortedEvents.length} event dari kategori {currentCategory.name}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative bg-gradient-to-b from-[#0A1931] via-[#1A3D63]/50 to-[#0A1931] border-t border-[#4A7FA7]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-[#B3CFE5]/70 text-sm">
            <p>© 2025 Event Atraksi. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
