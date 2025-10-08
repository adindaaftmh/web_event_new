import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import oceanBg from "../assets/ocean.jpg";
import AssistiveTouchNav from "../components/AssistiveTouchNav";
import Navbar from "../components/Navbar";
import { kegiatanService } from "../services/apiService";

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventsPage, setEventsPage] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', eventId: '' });
  const [testimonials, setTestimonials] = useState([
    {
      id: 1,
      name: 'Budi Santoso',
      role: 'Profesional Pemasaran',
      avatar: 'https://i.pravatar.cc/100?img=12',
      rating: 5,
      review: 'Eventnya sangat informatif dan terstruktur. Saya mendapatkan banyak insight baru untuk kampanye digital di perusahaan.',
      eventName: 'Workshop Digital Marketing'
    },
    {
      id: 2,
      name: 'Siti Nurhaliza',
      role: 'Pemilik UMKM',
      avatar: 'https://i.pravatar.cc/100?img=5',
      rating: 5,
      review: 'Pendaftaran mudah dan materi workshop sangat aplikatif. Tim panitia responsif dan ramah.',
      eventName: 'Seminar Teknologi AI'
    },
    {
      id: 3,
      name: 'Andi Wijaya',
      role: 'Mahasiswa',
      avatar: 'https://i.pravatar.cc/100?img=3',
      rating: 4,
      review: 'Pembicaranya keren-keren. Sesi tanya jawab interaktif banget. Overall sangat worth it!',
      eventName: 'Konser Musik Akustik'
    },
    {
      id: 4,
      name: 'Dewi Lestari',
      role: 'UI/UX Designer',
      avatar: 'https://i.pravatar.cc/100?img=47',
      rating: 5,
      review: 'Workshop desainnya lengkap dari fundamental sampai praktik. Materi dan fasilitator mantap.',
      eventName: 'Pelatihan Public Speaking'
    },
    {
      id: 5,
      name: 'Rizky Pratama',
      role: 'Data Enthusiast',
      avatar: 'https://i.pravatar.cc/100?img=22',
      rating: 4,
      review: 'Webinar data science-nya cocok untuk pemula. Ada rekaman juga jadi bisa dipelajari ulang.',
      eventName: 'Workshop Digital Marketing'
    },
    {
      id: 6,
      name: 'Lia Kartika',
      role: 'Freelancer',
      avatar: 'https://i.pravatar.cc/100?img=8',
      rating: 5,
      review: 'Sangat membantu pengembangan karier saya. Networking di acara juga seru dan bermanfaat.',
      eventName: 'Seminar Teknologi AI'
    }
  ]);
  const EVENTS_PER_PAGE = 4;
  const totalEventPages = Math.ceil(events.length / EVENTS_PER_PAGE) || 0;
  const visibleEvents = events.slice(
    eventsPage * EVENTS_PER_PAGE,
    eventsPage * EVENTS_PER_PAGE + EVENTS_PER_PAGE
  );

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
      
      // Mock user events data for testing
      if (!localStorage.getItem("userEvents")) {
        localStorage.setItem("userEvents", JSON.stringify([
          { id: 1, name: "Workshop Digital Marketing", joinedAt: "2025-01-15" },
          { id: 2, name: "Seminar Teknologi AI", joinedAt: "2025-01-20" }
        ]));
      }
    }

    // Fetch events from API
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await kegiatanService.getAll();
        if (response.data.success) {
          setEvents(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        // Fallback to mock data if API fails
        setEvents([
          {
            id: 1,
            judul_kegiatan: "Workshop Digital Marketing",
            lokasi_kegiatan: "Tangerang",
            waktu_mulai: "2025-07-15T09:00:00",
            flyer_kegiatan: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200",
            kategori: { nama_kategori: "Workshop" }
          },
          {
            id: 2,
            judul_kegiatan: "Seminar Teknologi AI",
            lokasi_kegiatan: "Tangerang",
            waktu_mulai: "2025-07-20T13:00:00",
            flyer_kegiatan: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200",
            kategori: { nama_kategori: "Seminar" }
          },
          {
            id: 3,
            judul_kegiatan: "Konser Musik Akustik",
            lokasi_kegiatan: "Tangerang",
            waktu_mulai: "2025-07-25T18:00:00",
            flyer_kegiatan: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1200",
            kategori: { nama_kategori: "Konser" }
          },
          {
            id: 4,
            judul_kegiatan: "Pelatihan Public Speaking",
            lokasi_kegiatan: "Tangerang",
            waktu_mulai: "2025-07-28T10:00:00",
            flyer_kegiatan: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200",
            kategori: { nama_kategori: "Pelatihan" }
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Reset to first page whenever events change
  useEffect(() => {
    setEventsPage(0);
  }, [events]);

  const nextEvents = () => {
    if (totalEventPages === 0) return;
    setEventsPage((prev) => (prev + 1) % totalEventPages);
  };

  const prevEvents = () => {
    if (totalEventPages === 0) return;
    setEventsPage((prev) => (prev - 1 + totalEventPages) % totalEventPages);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const handleAddReview = () => {
    if (!user) {
      alert("Silakan login terlebih dahulu untuk menambahkan ulasan");
      navigate("/login");
      return;
    }
    
    // Check if user has joined any events (mock check)
    const userEvents = localStorage.getItem("userEvents");
    if (!userEvents || JSON.parse(userEvents).length === 0) {
      alert("Anda harus bergabung dengan event terlebih dahulu sebelum dapat menambahkan ulasan");
      return;
    }
    
    setShowReviewForm(true);
  };

  const handleSubmitReview = () => {
    if (!newReview.comment.trim() || !newReview.eventId) {
      alert("Silakan lengkapi semua field");
      return;
    }
    
    const selectedEvent = events.find(e => e.id.toString() === newReview.eventId);
    const reviewData = {
      id: testimonials.length + 1,
      name: user.nama_lengkap,
      role: user.role || 'Peserta Event',
      avatar: user.avatar || `https://i.pravatar.cc/100?img=${Math.floor(Math.random() * 50)}`,
      rating: newReview.rating,
      review: newReview.comment,
      eventName: selectedEvent?.judul_kegiatan || 'Event'
    };
    
    setTestimonials(prev => [reviewData, ...prev]);
    setNewReview({ rating: 5, comment: '', eventId: '' });
    setShowReviewForm(false);
    alert("Ulasan berhasil ditambahkan!");
  };

  const handleCancelReview = () => {
    setNewReview({ rating: 5, comment: '', eventId: '' });
    setShowReviewForm(false);
  };

  // Hero slides
  const heroSlides = [
    {
      id: 1,
      title: "Event Menarik Minggu Ini",
      description: "Jangan lewatkan event-event terbaik untuk Anda",
    },
    {
      id: 2,
      title: "Bergabung dengan Komunitas",
      description: "Temukan teman baru dan pengalaman tak terlupakan",
    },
    {
      id: 3,
      title: "Daftar Event Favorit Anda",
      description: "Mudah, cepat, dan aman",
    },
  ];

  // Recommendation slides use events' flyers when available
  const recommendationSlides = events.length ? events : heroSlides;

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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

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
        
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
      `}</style>

      {/* Navbar Component */}
      <Navbar />

      {/* Hero Section with Ocean Background - Cut at 50vh */}
      <div 
        className="relative h-[50vh] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${oceanBg})` }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Hero Content - Centered Text with Carousel */}
        <div className="relative z-10 h-full flex items-center justify-center px-4">
            <div className="max-w-4xl mx-auto text-center">
              {heroSlides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`transition-opacity duration-1000 ${
                    index === currentSlide ? "opacity-100" : "opacity-0 absolute"
                  }`}
                >
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-2xl">
                    {slide.title}
                  </h2>
                  <p className="text-xl text-white/90 drop-shadow-lg">
                    {slide.description}
                  </p>
                </div>
              ))}
              
              {/* Carousel Dots */}
              <div className="flex justify-center gap-2 mt-8">
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentSlide ? "bg-white w-8" : "bg-white/50 w-2"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Recommendations Carousel - Overlapping between Hero and White Section */}
      <div className="relative -mt-32 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Glass Card Container - Ticket Style */}
          <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-xl p-8 relative border border-white/20">
            {/* Flyer Carousel Inside */}
            <div className="relative h-80">
              {/* Carousel Slides */}
              {recommendationSlides.map((slide, index) => (
                <div
                  key={`rec-${slide.id || index}`}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentSlide ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div className="h-full rounded-xl overflow-hidden shadow-md relative">
                    {/* When events are available, show flyer image; otherwise show the old gradient placeholder */}
                    {events.length && slide.flyer_kegiatan ? (
                      <img
                        src={slide.flyer_kegiatan}
                        alt={slide.judul_kegiatan || 'Flyer'}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600" />
                    )}
                    {/* Subtle overlay for readability */}
                    <div className="absolute inset-0 bg-black/20" />
                    {/* Optional caption */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="bg-black/40 text-white rounded-lg px-3 py-2 backdrop-blur-sm inline-block">
                        <span className="text-sm font-semibold">
                          {events.length ? (slide.judul_kegiatan || 'Event') : (slide.title || 'Flyer')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Navigation Arrows - Inside glass card - Bigger */}
              <button
                onClick={prevSlide}
                className="absolute -left-8 top-1/2 -translate-y-1/2 w-16 h-16 bg-[#F6FAFD]/90 backdrop-blur-xl rounded-full shadow-xl flex items-center justify-center text-[#0A1931] hover:bg-[#F6FAFD] transition-all z-10 border border-white/20"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                className="absolute -right-8 top-1/2 -translate-y-1/2 w-16 h-16 bg-[#F6FAFD]/90 backdrop-blur-xl rounded-full shadow-xl flex items-center justify-center text-[#0A1931] hover:bg-[#F6FAFD] transition-all z-10 border border-white/20"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Event Cards Section - Glassmorphism Gradient Background */}
      <div className="relative pt-20 pb-12 overflow-hidden">
        {/* Gradient Background with Pattern - Color Theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/25 to-indigo-100/35"></div>
        <div className="absolute inset-0 opacity-35" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.12) 0%, transparent 50%),
                           radial-gradient(circle at 50% 20%, rgba(6, 182, 212, 0.08) 0%, transparent 50%)`
        }}></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#F6FAFD] to-[#B3CFE5] border-2 border-[#4A7FA7]/30 rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-[#0A1931]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#0A1931] inline-block">Event Terbaru</h2>
                {/* Animated Underline */}
                <div className="h-1 w-32 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] rounded-full mt-1 animate-slide-line"></div>
              </div>
            </div>
            <button className="text-[#4A7FA7] hover:text-[#0A1931] text-sm font-semibold transition-all flex items-center gap-1 hover:gap-2">
              Lihat selengkapnya
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Event Cards Grid */}
          <div className="relative">
            {/* Navigation Arrow Left */}
            <button onClick={prevEvents} className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-[#F6FAFD]/90 backdrop-blur-xl rounded-full shadow-lg flex items-center justify-center text-[#0A1931] hover:bg-[#F6FAFD] transition-all border border-white/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-xl border-2 border-[#4A7FA7]/20 overflow-hidden shadow-lg animate-pulse">
                    <div className="h-56 bg-[#4A7FA7]/20"></div>
                    <div className="p-4">
                      <div className="h-4 bg-[#4A7FA7]/20 rounded mb-2"></div>
                      <div className="h-4 bg-[#4A7FA7]/20 rounded mb-3"></div>
                      <div className="h-6 bg-[#4A7FA7]/20 rounded mb-3"></div>
                      <div className="h-4 bg-[#4A7FA7]/20 rounded"></div>
                    </div>
                  </div>
                ))
              ) : (
                visibleEvents.map((event, index) => (
                <div
                  key={event.id}
                  onClick={() => navigate(`/event/${event.id}`)}
                  className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-xl border-2 border-[#4A7FA7]/20 overflow-hidden shadow-lg transition-all duration-500 ease-in-out cursor-pointer group animate-fade-in-up transform hover:scale-105 hover:-translate-y-6 hover:shadow-2xl hover:shadow-[#4A7FA7]/30 hover:border-[#4A7FA7] hover:ring-2 hover:ring-[#4A7FA7]/50"
                  style={{
                    animationDelay: `${index * 0.15}s`,
                    animationFillMode: 'both',
                    willChange: 'transform, box-shadow'
                  }}
                >
                  {/* Flyer Image Area */}
                  <div className="relative h-56 bg-gradient-to-br from-[#1A3D63] via-[#4A7FA7] to-[#0A1931] flex items-center justify-center overflow-hidden group-hover:from-[#4A7FA7] group-hover:via-[#1A3D63] group-hover:to-[#0A1931] transition-all duration-500">
                    {event.flyer_kegiatan ? (
                      <img
                        src={event.flyer_kegiatan}
                        alt={event.judul_kegiatan}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-110">
                        <p className="absolute inset-0 flex items-center justify-center text-white/40 text-2xl font-bold group-hover:scale-110 transition-transform duration-500">Flyer</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/10" />
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 bg-[#B3CFE5] text-[#0A1931] text-xs font-bold rounded-full shadow-md">
                        Tersedia
                      </span>
                    </div>
                  </div>

                  {/* Event Info */}
                  <div className="p-4 bg-[#F6FAFD]/90 backdrop-blur-xl">
                    {/* Location */}
                    <div className="flex items-center gap-2 text-[#4A7FA7] text-sm mb-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{event.lokasi_kegiatan}</span>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-[#4A7FA7] text-sm mb-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{formatDate(event.waktu_mulai)}</span>
                    </div>

                    {/* Event Title */}
                    <h3 className="text-[#0A1931] font-bold text-lg mb-3 group-hover:text-[#4A7FA7] transition-colors duration-300 line-clamp-2">
                      {event.judul_kegiatan}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                      <span className="text-[#4A7FA7] text-xs ml-1">(baru)</span>
                    </div>

                    {/* Price (optional placeholder) */}
                    <div className="pt-3 border-t border-[#4A7FA7]/20">
                      <span className="text-[#4A7FA7] font-bold text-lg">&nbsp;</span>
                    </div>
                  </div>
                </div>
                ))
              )}
            </div>

            {/* Navigation Arrow Right */}
            <button onClick={nextEvents} className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-[#F6FAFD]/90 backdrop-blur-xl rounded-full shadow-lg flex items-center justify-center text-[#0A1931] hover:bg-[#F6FAFD] transition-all border border-white/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Kategori Event Section */}
      <div className="relative py-16 overflow-hidden">
        {/* Background Pattern - Color Theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-100/20 to-transparent"></div>
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `radial-gradient(circle at 30% 30%, rgba(168, 85, 247, 0.12) 0%, transparent 50%),
                           radial-gradient(circle at 70% 70%, rgba(236, 72, 153, 0.10) 0%, transparent 50%)`
        }}></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Title */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0A1931] mb-3">
              Kategori Event
            </h2>
            {/* Animated Underline */}
            <div className="w-40 h-1 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] rounded-full mx-auto mb-3 animate-slide-line"></div>
            <p className="text-[#4A7FA7]">Pilih kategori event sesuai minat Anda</p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category 1: Olahraga */}
            <div className="group relative h-64 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-500 to-pink-600"></div>
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800')] bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity duration-500"></div>
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-500"></div>
              <div className="relative h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-4">
                    <svg className="w-16 h-16 mx-auto text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white drop-shadow-2xl group-hover:scale-110 transition-transform duration-500">
                    Olahraga
                  </h3>
                  <p className="text-white/80 mt-2 text-sm">Berbagai event olahraga menarik</p>
                </div>
              </div>
            </div>

            {/* Category 2: Hiburan */}
            <div className="group relative h-64 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-600"></div>
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800')] bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity duration-500"></div>
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-500"></div>
              <div className="relative h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-4">
                    <svg className="w-16 h-16 mx-auto text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white drop-shadow-2xl group-hover:scale-110 transition-transform duration-500">
                    Hiburan
                  </h3>
                  <p className="text-white/80 mt-2 text-sm">Konser, festival, dan entertainment</p>
                </div>
              </div>
            </div>

            {/* Category 3: Edukasi */}
            <div className="group relative h-64 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600"></div>
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800')] bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity duration-500"></div>
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-500"></div>
              <div className="relative h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-4">
                    <svg className="w-16 h-16 mx-auto text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white drop-shadow-2xl group-hover:scale-110 transition-transform duration-500">
                    Edukasi
                  </h3>
                  <p className="text-white/80 mt-2 text-sm">Workshop, seminar, dan pelatihan</p>
                </div>
              </div>
            </div>

            {/* Category 4: Seni Budaya */}
            <div className="group relative h-64 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600"></div>
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800')] bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity duration-500"></div>
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-500"></div>
              <div className="relative h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-4">
                    <svg className="w-16 h-16 mx-auto text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white drop-shadow-2xl group-hover:scale-110 transition-transform duration-500">
                    Seni Budaya
                  </h3>
                  <p className="text-white/80 mt-2 text-sm">Pameran, pertunjukan, dan festival budaya</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liburan kemana ya Section */}
      <div className="relative py-16 overflow-hidden">
        {/* Background - Color Theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-50/20 to-teal-100/30"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Banner with Overlay Cards */}
          <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl mb-16">
            {/* Background Image */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200')] bg-cover bg-center"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A1931]/80 via-[#1A3D63]/70 to-[#0A1931]/90"></div>
            
            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-2xl">
                Petualangan Bahari Di Labuan Bajo
              </h2>
              <p className="text-lg text-white/90 max-w-2xl drop-shadow-lg">
                Rasakan keajaiban bawah laut dengan paket perjalanan eksklusif ke surga diving
              </p>

              {/* Floating Cards */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="bg-[#F6FAFD]/95 backdrop-blur-md rounded-xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/20">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-[#B3CFE5] rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-[#0A1931]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-xs text-[#4A7FA7] mb-1">Destinasi Populer</p>
                          <h4 className="font-bold text-[#0A1931] text-sm">Pulau Komodo</h4>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section Title */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0A1931] mb-3 italic">
              Liburan kemana yaa??
            </h2>
            {/* Animated Underline */}
            <div className="w-52 h-1 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] rounded-full mx-auto mb-3 animate-slide-line"></div>
            <p className="text-[#4A7FA7]">Pilih destinasi wisata impian Anda</p>
          </div>

          {/* Destination Cards Carousel */}
          <div className="relative">
            {/* Navigation Arrow Left */}
            <button className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-[#F6FAFD]/90 backdrop-blur-xl rounded-full shadow-lg flex items-center justify-center text-[#0A1931] hover:bg-[#F6FAFD] hover:text-[#4A7FA7] transition-all border border-white/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {['Bali', 'Raja Ampat', 'Lombok', 'Yogyakarta', 'Bromo'].map((destination, index) => (
                <div
                  key={destination}
                  className="group relative h-64 rounded-2xl border-2 border-[#4A7FA7]/30 overflow-hidden shadow-lg transition-all duration-500 ease-in-out cursor-pointer animate-fade-in-up transform hover:scale-105 hover:-translate-y-6 hover:shadow-2xl hover:shadow-[#4A7FA7]/30 hover:border-[#4A7FA7] hover:ring-2 hover:ring-[#4A7FA7]/50"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animationFillMode: 'both',
                    willChange: 'transform, box-shadow'
                  }}
                >
                  {/* Background Gradient with Zoom */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] group-hover:from-[#4A7FA7]/80 group-hover:to-[#0A1931] transition-all duration-500">
                    <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-110"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
                    <div className="mb-4 transition-transform duration-500 group-hover:scale-110">
                      <svg className="w-12 h-12 mx-auto text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg transition-transform duration-500 group-hover:scale-110">
                      {destination}
                    </h3>
                    <p className="text-white/80 text-sm transition-opacity duration-300 group-hover:text-white">Lorem Ipsum</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrow Right */}
            <button className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-[#F6FAFD]/90 backdrop-blur-xl rounded-full shadow-lg flex items-center justify-center text-[#0A1931] hover:bg-[#F6FAFD] hover:text-[#4A7FA7] transition-all border border-white/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Objek Wisata Terpopuler Section */}
          <div className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#0A1931] mb-3">
                Objek Wisata Terpopuler Di Indonesia
              </h2>
              {/* Animated Underline */}
              <div className="w-64 h-1 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] rounded-full mx-auto mb-3 animate-slide-line"></div>
            </div>

            {/* Wisata List with Image + Description */}
            <div className="space-y-6">
              {[
                { title: 'Raja Ampat', subtitle: 'Papua Barat' },
                { title: 'Pulau Komodo', subtitle: 'Nusa Tenggara Timur' },
                { title: 'Pantai Kuta', subtitle: 'Bali' },
                { title: 'Danau Toba', subtitle: 'Sumatera Utara' }
              ].map((place, index) => (
                <div
                  key={place.title}
                  className="group flex flex-col md:flex-row gap-6 bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden animate-fade-in-up border border-white/20"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animationFillMode: 'both'
                  }}
                >
                  {/* Image Section */}
                  <div className="md:w-64 h-48 md:h-auto bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] flex-shrink-0 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                      <p className="text-white/60 text-xl font-bold">{place.subtitle}</p>
                    </div>
                  </div>
                  
                  {/* Content Section */}
                  <div className="flex-1 p-6">
                    <h3 className="text-2xl font-bold text-[#0A1931] mb-3 group-hover:text-[#4A7FA7] transition-colors">
                      Lorem Ipsum
                    </h3>
                    <p className="text-[#4A7FA7] leading-relaxed">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ulasan Pengguna Section - Horizontal Scroll */}
      <div className="relative py-16 overflow-hidden">
        {/* Background - Color Theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-50/20 to-purple-100/30"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Title with Add Review Button */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0A1931] mb-3">
              Ulasan Pengguna
            </h2>
            <div className="w-56 h-1 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] rounded-full mx-auto mb-3 animate-slide-line"></div>
            <p className="text-[#4A7FA7] mb-6">Cerita pengalaman dari pengguna Event Atraksi</p>
            
            {/* Add Review Button */}
            <button
              onClick={handleAddReview}
              className="px-6 py-3 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-semibold rounded-full shadow-lg hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-all duration-300 transform hover:scale-105 flex items-center gap-2 mx-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Ulasan
            </button>
          </div>

          {/* Horizontal Scrolling Testimonials */}
          <div className="relative">
            <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className="flex-shrink-0 w-80 bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-lg border border-[#4A7FA7]/20 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  {/* Event Badge */}
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 bg-[#B3CFE5] text-[#0A1931] text-xs font-semibold rounded-full">
                      {testimonial.eventName}
                    </span>
                  </div>
                  
                  {/* User Info */}
                  <div className="flex items-center gap-4 mb-4">
                    <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#4A7FA7]/20" loading="lazy" />
                    <div>
                      <h4 className="font-semibold text-[#0A1931]">{testimonial.name}</h4>
                      <p className="text-xs text-[#4A7FA7]">{testimonial.role}</p>
                    </div>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <svg key={idx} className={`w-4 h-4 ${idx < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'} fill-current`} viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  
                  {/* Review Text */}
                  <p className="text-[#0A1931] leading-relaxed text-sm">"{testimonial.review}"</p>
                </div>
              ))}
            </div>
            
            {/* Scroll Indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: Math.ceil(testimonials.length / 3) }).map((_, i) => (
                <div key={i} className="w-2 h-2 bg-[#4A7FA7]/30 rounded-full"></div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-10">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-6 py-2 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-semibold rounded-full shadow hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-colors"
            >
              Lihat Event Populer
            </button>
          </div>
        </div>
      </div>

      {/* Review Submission Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F6FAFD]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#0A1931]">Tambah Ulasan</h3>
              <button
                onClick={handleCancelReview}
                className="w-8 h-8 bg-[#4A7FA7]/20 rounded-full flex items-center justify-center text-[#0A1931] hover:bg-[#4A7FA7]/30 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSubmitReview(); }} className="space-y-4">
              {/* Event Selection */}
              <div>
                <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                  Pilih Event
                </label>
                <select
                  value={newReview.eventId}
                  onChange={(e) => setNewReview(prev => ({ ...prev, eventId: e.target.value }))}
                  className="w-full p-3 bg-white border-2 border-[#4A7FA7]/20 rounded-lg text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors"
                  required
                >
                  <option value="">Pilih event yang telah diikuti</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>
                      {event.judul_kegiatan}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Rating */}
              <div>
                <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                  Rating
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                      className={`w-8 h-8 transition-colors ${
                        star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      <svg className="w-full h-full fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Comment */}
              <div>
                <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                  Ulasan Anda
                </label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Bagikan pengalaman Anda mengikuti event ini..."
                  className="w-full p-3 bg-white border-2 border-[#4A7FA7]/20 rounded-lg text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors resize-none"
                  rows={4}
                  required
                />
              </div>
              
              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancelReview}
                  className="flex-1 py-3 bg-[#4A7FA7]/20 text-[#0A1931] font-semibold rounded-lg hover:bg-[#4A7FA7]/30 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-semibold rounded-lg hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-all"
                >
                  Kirim Ulasan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative bg-gradient-to-b from-[#0A1931] via-[#1A3D63]/50 to-[#0A1931] border-t border-[#4A7FA7]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-[#B3CFE5]/70 text-sm">
            <p>© 2025 Event Atraksi. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* AssistiveTouch Navigation */}
      <AssistiveTouchNav />
    </div>
  );
}
