import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { kegiatanService } from "../services/apiService";
import apiClient from "../config/api";
import oceanBg from "../assets/ocean.jpg";

export default function EventData() {
  const navigate = useNavigate();
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("terdekat");
  const [animatedCounts, setAnimatedCounts] = useState({});
  const [participants, setParticipants] = useState([]);

  // Fetch participants from database
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await apiClient.get('/daftar-hadir');
        const participantsData = response.data.data || [];
        setParticipants(participantsData);
      } catch (error) {
        console.error('Error fetching participants:', error);
        setParticipants([]);
      }
    };
    fetchParticipants();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await kegiatanService.getAll();
        if (response.data?.success) {
          setEvents(response.data.data || []);
        } else {
          setError("Gagal memuat data event");
        }
      } catch (e) {
        setError("Gagal memuat data event");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Calculate participant count for each event from database
  const getEventParticipantCount = (eventId) => {
    const filtered = participants.filter(p => p.kegiatan_id === eventId || p.id_kegiatan === eventId);
    return filtered.length;
  };

  // Reset all filters function
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("terdekat");
    setAnimatedCounts({}); // Reset animated counts to trigger re-animation
  };

  // Filter and sort events
  useEffect(() => {
    let filtered = [...events];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(event =>
        event.judul_kegiatan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.lokasi_kegiatan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.kategori?.nama_kategori?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(event =>
        event.kategori?.nama_kategori?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Separate active and ended events
    const activeEvents = filtered.filter(event => !isEventEnded(event));
    const endedEvents = filtered.filter(event => isEventEnded(event));

    // Apply sorting to active events based on selected filter
    switch (sortBy) {
      case "terdekat":
        // Sort by soonest event date (waktu_mulai ascending - closest to start)
        activeEvents.sort((a, b) => new Date(a.waktu_mulai || 0) - new Date(b.waktu_mulai || 0));
        break;
      case "terlama":
        // Sort by furthest event date (waktu_mulai descending - furthest from now)
        activeEvents.sort((a, b) => new Date(b.waktu_mulai || 0) - new Date(a.waktu_mulai || 0));
        break;
      case "termurah":
        // Sort by cheapest price (harga_tiket ascending)
        activeEvents.sort((a, b) => {
          const priceA = parseFloat(a.harga_tiket) || 0;
          const priceB = parseFloat(b.harga_tiket) || 0;
          return priceA - priceB;
        });
        break;
      case "terpopuler":
        // Sort by most popular (participant count descending)
        activeEvents.sort((a, b) => {
          const aParticipants = getEventParticipantCount(a.id);
          const bParticipants = getEventParticipantCount(b.id);
          return bParticipants - aParticipants;
        });
        break;
      default:
        break;
    }

    // Also sort ended events by date (most recent first)
    endedEvents.sort((a, b) => new Date(b.waktu_mulai || 0) - new Date(a.waktu_mulai || 0));

    // Combine: active events first, then ended events
    filtered = [...activeEvents, ...endedEvents];

    setFilteredEvents(filtered);
  }, [events, searchQuery, selectedCategory, sortBy, participants]);

  // Get unique categories
  const categories = [...new Set(events.map(event => event.kategori?.nama_kategori).filter(Boolean))];

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

  // Check if event has ended
  const isEventEnded = (event) => {
    const now = new Date();
    // Check waktu_selesai first, if not available check waktu_mulai
    const endTime = event.waktu_selesai ? new Date(event.waktu_selesai) : (event.waktu_mulai ? new Date(event.waktu_mulai) : null);
    
    if (!endTime) return false;
    return now > endTime;
  };

  // Animate participant count for visible events using actual data
  useEffect(() => {
    // Only run animation if participants data is loaded
    if (participants.length === 0) return;
    
    // Reset animated counts when participants change to trigger re-animation
    const newCounts = {};
    
    filteredEvents.forEach((event) => {
      const targetCount = getEventParticipantCount(event.id);
      const countKey = `event-${event.id}`;
      
      // Always animate (remove the undefined check to re-animate on participant changes)
      let startTime = null;
      const duration = 2000;
      
      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentCount = Math.floor(targetCount * easeOut);
        
        setAnimatedCounts(prev => ({
          ...prev,
          [countKey]: currentCount
        }));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    });
  }, [filteredEvents, participants]);

  // Scroll to section function for navbar
  const scrollToSection = (sectionId) => {
    // If we're not on homepage, navigate to homepage first
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } });
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <>
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
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>

      <div className="min-h-screen relative">
        <Navbar />

        {/* Hero Section with Ocean Background */}
        <div 
          className="relative h-[50vh] bg-cover bg-center bg-no-repeat pt-24"
          style={{ backgroundImage: `url(${oceanBg})` }}
        >
          {/* Overlay - No Blur */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-indigo-800/50 to-purple-900/60"></div>
          
          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-center text-center px-4 pb-16">
            <div className="animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
                Semua Event
              </h1>
              <p className="text-lg md:text-xl text-white/95 max-w-2xl mx-auto drop-shadow-lg mb-6">
                Temukan berbagai event menarik yang sesuai dengan minat dan passion Anda
              </p>
              
              <div className="flex items-center justify-center gap-2 text-white/90">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-semibold drop-shadow">
                  {loading ? "Memuat event..." : `${events.length} Event Tersedia`}
                </span>
              </div>
            </div>
          </div>
        </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12">
        {/* Search and Filter Section */}
        <div className="mb-8 -mt-20 relative z-30">
          <div className="relative bg-white/95 backdrop-blur-2xl rounded-2xl border-2 border-[#4A7FA7]/20 shadow-xl p-6 mb-8 overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#4A7FA7]/10 to-[#1A3D63]/5 rounded-full blur-2xl -translate-y-8 translate-x-8"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#B3CFE5]/15 to-[#4A7FA7]/10 rounded-full blur-xl translate-y-4 -translate-x-4"></div>
            
            {/* Header */}
            <div className="relative z-10 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-lg flex items-center justify-center shadow-md">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-[#0A1931]">Cari & Filter Event</h2>
              </div>
              <p className="text-[#4A7FA7] text-xs ml-10">Temukan event yang sesuai dengan preferensi Anda</p>
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search Bar */}
              <div className="relative group">
                <label className="block text-xs font-semibold text-[#0A1931] mb-1">Pencarian</label>
                <input
                  type="text"
                  placeholder="Cari event, lokasi, atau kategori..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-[#4A7FA7]/20 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#4A7FA7]/10 transition-all duration-300 shadow-sm hover:shadow-md group-hover:border-[#4A7FA7]/40"
                />
                <svg className="w-4 h-4 text-[#4A7FA7] absolute left-3 top-[42px] -translate-y-1/2 group-focus-within:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Category Filter */}
              <div className="relative group">
                <label className="block text-xs font-semibold text-[#0A1931] mb-1">Kategori</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 bg-white border-2 border-[#4A7FA7]/20 rounded-xl text-gray-700 focus:outline-none focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#4A7FA7]/10 transition-all duration-300 shadow-sm hover:shadow-md appearance-none cursor-pointer group-hover:border-[#4A7FA7]/40"
                >
                  <option value="all">Semua Kategori</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <svg className="w-4 h-4 text-[#4A7FA7] absolute right-3 top-[42px] -translate-y-1/2 pointer-events-none group-focus-within:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Sort Options */}
              <div className="relative group">
                <label className="block text-xs font-semibold text-[#0A1931] mb-1">Urutkan</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 bg-white border-2 border-[#4A7FA7]/20 rounded-xl text-gray-700 focus:outline-none focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#4A7FA7]/10 transition-all duration-300 shadow-sm hover:shadow-md appearance-none cursor-pointer group-hover:border-[#4A7FA7]/40"
                >
                  <option value="terdekat">Terdekat</option>
                  <option value="terlama">Terlama</option>
                  <option value="termurah">Termurah</option>
                  <option value="terpopuler">Terpopuler</option>
                </select>
                <svg className="w-4 h-4 text-[#4A7FA7] absolute right-3 top-[42px] -translate-y-1/2 pointer-events-none group-focus-within:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Categories Row */}
              <div className="col-span-full pt-4 border-t border-[#4A7FA7]/10 mt-4">
                <div className="flex gap-3">
                  {/* Category Buttons */}
                  {categories.map(category => {
                    // Convert category name to URL-friendly format
                    const categorySlug = category.toLowerCase().replace(/ /g, '-');
                    return (
                      <button
                        key={category}
                        onClick={() => navigate(`/category/${categorySlug}`)}
                        className="flex-1 px-6 py-3 bg-white border-2 border-[#4A7FA7]/30 text-[#0A1931] rounded-lg hover:bg-[#4A7FA7]/10 hover:border-[#4A7FA7] hover:shadow-md transition-all duration-300 text-sm font-semibold hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4 text-[#4A7FA7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {category}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Results Count & Reset Button */}
            <div className="relative z-10 mt-4 pt-4 border-t border-[#4A7FA7]/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#4A7FA7] rounded-full animate-pulse"></div>
                <p className="text-[#4A7FA7] font-medium">
                  {loading ? "Memuat..." : `Menampilkan ${filteredEvents.length} dari ${events.length} event`}
                </p>
              </div>
              
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-[#4A7FA7]/10 hover:bg-[#4A7FA7]/20 text-[#4A7FA7] rounded-xl transition-all duration-200 text-sm font-semibold flex items-center gap-2 hover:scale-105"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Filter
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl border-2 border-[#4A7FA7]/20 overflow-hidden shadow-lg animate-pulse">
                <div className="h-56 bg-[#4A7FA7]/20" />
                <div className="p-6">
                  <div className="h-3 bg-[#4A7FA7]/20 rounded mb-3 w-1/3" />
                  <div className="h-5 bg-[#4A7FA7]/20 rounded mb-3" />
                  <div className="h-4 bg-[#4A7FA7]/20 rounded mb-2 w-3/4" />
                  <div className="h-4 bg-[#4A7FA7]/20 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="text-center py-12">
            <div className="bg-red-50/80 backdrop-blur-xl rounded-2xl border border-red-200/50 p-8 max-w-md mx-auto">
              <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Terjadi Kesalahan</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        )}

        {/* Events Grid */}
        {!loading && !error && (
          <>
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredEvents.map((event, index) => {
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
                        // Handle flyer URL - check multiple possible fields
                        let flyerSrc = null;
                        if (event.flyer_url) {
                          flyerSrc = event.flyer_url;
                        } else if (event.flyer_kegiatan) {
                          // Check if it's already a full URL
                          if (event.flyer_kegiatan.startsWith('http://') || event.flyer_kegiatan.startsWith('https://')) {
                            flyerSrc = event.flyer_kegiatan;
                          } else {
                            // Prepend storage path for relative paths
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
                      <div className="flyer-placeholder absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-110" style={{ display: event.flyer_kegiatan ? 'none' : 'flex' }}>
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
                    <div className="p-4 bg-[#F6FAFD]/90 backdrop-blur-xl flex flex-col">
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
            ) : (
              /* Empty State */
              <div className="text-center py-16">
                <div className="bg-[#F6FAFD]/80 backdrop-blur-xl rounded-2xl border border-white/20 p-12 max-w-lg mx-auto">
                  <svg className="w-20 h-20 text-[#4A7FA7]/50 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="text-2xl font-bold text-[#0A1931] mb-3">Tidak Ada Event Ditemukan</h3>
                  <p className="text-[#4A7FA7] mb-6">
                    Coba ubah kata kunci pencarian atau filter kategori Anda
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                      setSortBy("newest");
                      setAnimatedCounts({});
                    }}
                    className="px-6 py-3 bg-[#4A7FA7] text-white rounded-xl hover:bg-[#4A7FA7]/90 transition-colors duration-300 font-semibold"
                  >
                    Reset Filter
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      </div>

      {/* Footer */}
      <footer className="relative bg-gradient-to-b from-[#0A1931] via-[#1A3D63] to-[#0A1931] border-t border-[#4A7FA7]/30 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-[#4A7FA7] to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-[#B3CFE5] to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Brand Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-white/25 to-white/15 backdrop-blur-xl rounded-lg flex items-center justify-center border border-white/40 shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
                  </svg>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-lg font-bold text-white tracking-wide">DYNOTIX</h3>
                  <span className="text-white/70 text-[10px] font-medium tracking-wider">EVENT PLATFORM</span>
                </div>
              </div>
              <p className="text-[#B3CFE5]/80 text-xs mb-3 leading-relaxed">
                Platform terpercaya untuk menemukan dan mendaftar berbagai event menarik. Bergabunglah dengan komunitas kami dan jangan lewatkan pengalaman tak terlupakan.
              </p>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">Kontak</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-[#B3CFE5]/80 text-xs">
                  <svg className="w-4 h-4 text-[#4A7FA7] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Jl. Raya Tajur, Kp. Buntar RT.02/RW.08, Kel. Muara sari, Kec. Bogor Selatan, Kota Bogor, Jawa Barat 16137</span>
                </li>
                <li className="flex items-start gap-2 text-[#B3CFE5]/80 text-xs">
                  <svg className="w-4 h-4 text-[#4A7FA7] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>dynotix@gmail.com</span>
                </li>
                <li className="flex items-start gap-2 text-[#B3CFE5]/80 text-xs">
                  <svg className="w-4 h-4 text-[#4A7FA7] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>+62 831-6922-1045</span>
                </li>
              </ul>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">Ikuti Kami</h4>
              <p className="text-[#B3CFE5]/80 text-xs mb-3">
                Tetap terhubung untuk update event terbaru
              </p>
              <div className="flex gap-2">
                <a href="#" className="w-8 h-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-all hover:scale-110 hover:shadow-lg">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-all hover:scale-110 hover:shadow-lg">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-all hover:scale-110 hover:shadow-lg">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417a9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-all hover:scale-110 hover:shadow-lg">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-[#4A7FA7]/20 pt-4">
            <p className="text-[#B3CFE5]/70 text-xs text-center">
              © 2025 <span className="font-semibold text-[#B3CFE5]">DYNOTIX Event Platform</span>. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
