import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
// import Navigation from '../components/Navigation';
// import Footer from '../components/Footer';
import { useEvents } from '../contexts/EventContext';
import { useRecommendedEvents } from '../contexts/RecommendedEventsContext';
import { useInterestingFacts } from '../contexts/InterestingFactsContext';
import TestimonialScroll from '../components/TestimonialScroll';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import oceanBg from "../assets/ocean.jpg";
import smkn4Bg from "../assets/smkn4.jpeg";
import axios from 'axios';
import { BookOpen, Smile, Palette, Lightbulb, Heart, Edit } from 'lucide-react';
import { testimonialService } from '../services/apiService';

const API_URL = "http://localhost:8000/api";

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { events, loading } = useEvents();
  const { bannerConfig, sectionText, getActiveEvents } = useRecommendedEvents();
  const { getActiveFacts } = useInterestingFacts();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [user, setUser] = useState(null);
  const [attendedEvents, setAttendedEvents] = useState([]);
  const [eventsPage, setEventsPage] = useState(0);
  const [popularEventsPage, setPopularEventsPage] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', eventId: '' });
  const [flyers, setFlyers] = useState([]);
  const [animatedCounts, setAnimatedCounts] = useState({});
  const [toast, setToast] = useState(null);
  const [showFactModal, setShowFactModal] = useState(false);
  const [selectedFact, setSelectedFact] = useState(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  // User authentication and attended events stagte
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userAttendedEvents, setUserAttendedEvents] = useState([]);
  
  const EVENTS_PER_PAGE = 4;
  const totalEventPages = Math.ceil(events.length / EVENTS_PER_PAGE) || 0;

  // Sort events by waktu_mulai (newest first)
  const sortedEvents = events.length > 0 ? [...events].sort((a, b) => {
    return new Date(b.waktu_mulai) - new Date(a.waktu_mulai);
  }) : [];

  const visibleEvents = sortedEvents.slice(
    eventsPage * EVENTS_PER_PAGE,
    eventsPage * EVENTS_PER_PAGE + EVENTS_PER_PAGE
  );

  // Animate participant counts when events become visible
  useEffect(() => {
    if (visibleEvents.length > 0) {
      visibleEvents.forEach(event => {
        const targetCount = event.peserta || event.participants || Math.floor(Math.random() * 150) + 50;
        const countKey = `event-${event.id}`;
        
        if (animatedCounts[countKey] === undefined) {
          let startTime = null;
          const duration = 2000;
          
          const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const value = Math.floor(easeOut * targetCount);
            
            setAnimatedCounts(prev => ({ ...prev, [countKey]: value }));
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          
          requestAnimationFrame(animate);
        }
      });
    }
  }, [visibleEvents]);

  // Filter popular events (events with more than 100 participants)
  const popularEvents = [...events].filter(event => {
    // Assuming each event has a 'peserta' or 'participants' field
    // If not available, we'll simulate it with a random number for demo
    const participants = event.peserta || event.participants || Math.floor(Math.random() * 200) + 50;
    return participants > 100;
  }).sort((a, b) => {
    // Sort by participant count (highest first)
    const aParticipants = a.peserta || a.participants || Math.floor(Math.random() * 200) + 50;
    const bParticipants = b.peserta || b.participants || Math.floor(Math.random() * 200) + 50;
    return bParticipants - aParticipants;
  });
  
  const totalPopularEventPages = Math.ceil(popularEvents.length / EVENTS_PER_PAGE) || 0;
  const visiblePopularEvents = popularEvents.slice(
    popularEventsPage * EVENTS_PER_PAGE,
    popularEventsPage * EVENTS_PER_PAGE + EVENTS_PER_PAGE
  );

  // Animate popular events participant counts
  useEffect(() => {
    if (visiblePopularEvents.length > 0) {
      visiblePopularEvents.forEach(event => {
        const targetCount = event.peserta || event.participants || Math.floor(Math.random() * 200) + 100;
        const countKey = `event-popular-${event.id}`;
        
        if (animatedCounts[countKey] === undefined) {
          let startTime = null;
          const duration = 2000;
          
          const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const value = Math.floor(easeOut * targetCount);
            
            setAnimatedCounts(prev => ({ ...prev, [countKey]: value }));
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          
          requestAnimationFrame(animate);
        }
      });
    }
  }, [visiblePopularEvents]);

  useEffect(() => {
    setEventsPage(0);
    setPopularEventsPage(0);
  }, [events]);

  // Fetch active flyers from backend
  useEffect(() => {
    fetchFlyers();
  }, []);

  const fetchFlyers = async () => {
    try {
      const response = await axios.get(`${API_URL}/flyers/active`);
      if (response.data.success && response.data.data.length > 0) {
        setFlyers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching flyers:', error);
      // Jika gagal fetch, gunakan data default atau kosong
      setFlyers([]);
    }
  };

  // Handle scrolling when navigating from other pages
  useEffect(() => {
    if (location.state?.scrollTo) {
      const timer = setTimeout(() => {
        const element = document.getElementById(location.state.scrollTo);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100); // Small delay to ensure page is rendered
      
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Check user authentication status and load attended events
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const userData = localStorage.getItem('user') || localStorage.getItem('userData');
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          setIsLoggedIn(true);
          setCurrentUser(user);
          if (user.id) {
            loadUserAttendedEvents(user.id);
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          // Clear invalid data
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    };

    checkAuthStatus();
  }, []);

  // Reload attended events when user logs in or navigates back
  useEffect(() => {
    if (isLoggedIn && currentUser && currentUser.id) {
      loadUserAttendedEvents(currentUser.id);
    }
  }, [isLoggedIn, currentUser?.id]);

  // Load events that user has attended
  const loadUserAttendedEvents = async (userId) => {
    try {
      // Call API to get user's attended events from backend
      const response = await axios.get(`${API_URL}/daftar-hadir-by-user/${userId}`);
      
      console.log('User attended events response:', response.data);
      
      if (response.data && response.data.success && response.data.data) {
        const attendedEvents = response.data.data.map(item => ({
          id: item.id,
          eventId: item.kegiatan_id, // Fixed: changed from id_kegiatan to kegiatan_id
          eventName: item.kegiatan?.judul_kegiatan || 'Event',
          attendedDate: item.created_at,
          status: item.status_kehadiran || item.status_absen || 'pending'
        }));
        
        console.log('Processed attended events:', attendedEvents);
        setUserAttendedEvents(attendedEvents);
      } else {
        console.log('No attended events found or invalid response');
        setUserAttendedEvents([]);
      }
    } catch (error) {
      console.error('Error loading attended events:', error);
      console.error('Error details:', error.response?.data);
      setUserAttendedEvents([]);
    }
  };

  const nextEvents = () => {
    if (totalEventPages === 0) return;
    setEventsPage((prev) => (prev + 1) % totalEventPages);
  };

  const prevEvents = () => {
    if (totalEventPages === 0) return;
    setEventsPage((prev) => (prev - 1 + totalEventPages) % totalEventPages);
  };

  const nextPopularEvents = () => {
    if (totalPopularEventPages === 0) return;
    setPopularEventsPage((prev) => (prev + 1) % totalPopularEventPages);
  };

  const prevPopularEvents = () => {
    if (totalPopularEventPages === 0) return;
    setPopularEventsPage((prev) => (prev - 1 + totalPopularEventPages) % totalPopularEventPages);
  };


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const handleAddReview = () => {
    if (!user) {
      showToast("Silakan login terlebih dahulu untuk menambahkan ulasan", 'warning');
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    // Check if user has joined any events (mock check)
    const userEvents = localStorage.getItem("userEvents");
    if (!userEvents || JSON.parse(userEvents).length === 0) {
      showToast("Anda harus bergabung dengan event terlebih dahulu sebelum dapat menambahkan ulasan", 'warning');
      return;
    }

    setShowReviewForm(true);
  };

  const handleSubmitReview = async (e) => {
    if (e) {
      e.preventDefault();
    }
    
    // Prevent double submission
    if (isSubmittingReview) {
      return;
    }
    
    // Validate user is logged in
    if (!isLoggedIn || !currentUser) {
      showToast('Anda harus login terlebih dahulu untuk memberikan testimoni', 'warning');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    // Validate user has attended events
    if (userAttendedEvents.length === 0) {
      showToast('Anda harus mengikuti event terlebih dahulu sebelum dapat memberikan testimoni', 'warning');
      return;
    }

    // Validate form fields
    if (!newReview.eventId || !newReview.comment.trim()) {
      showToast('Mohon lengkapi semua field', 'error');
      return;
    }

    // Validate that selected event is in user's attended events
    const isEventAttended = userAttendedEvents.some(attendedEvent => 
      attendedEvent.eventId == newReview.eventId
    );

    if (!isEventAttended) {
      showToast('Anda hanya dapat memberikan testimoni untuk event yang pernah diikuti', 'error');
      return;
    }

    setIsSubmittingReview(true);

    try {
      // Find the event details for event_category
      const attendedEvent = userAttendedEvents.find(
        attendedEvent => attendedEvent.eventId == newReview.eventId
      );
      
      // Get event details from events list
      const eventDetails = events.find(event => event.id == newReview.eventId);
      
      // Prepare review data according to backend API requirements
      const reviewData = {
        event_id: parseInt(newReview.eventId),
        testimonial: newReview.comment.trim(),
        rating: newReview.rating,
        event_category: eventDetails?.kategori_kegiatan?.nama_kategori || attendedEvent?.eventName || 'Event'
      };

      console.log('Submitting testimonial:', reviewData);
      
      // Call the actual API
      const response = await testimonialService.create(reviewData);
      
      if (response.data.success) {
        showToast('Testimoni berhasil dikirim! Terima kasih atas feedback Anda. Testimoni akan ditinjau oleh admin.', 'success');
        setShowReviewForm(false);
        setNewReview({ rating: 5, comment: '', eventId: '' });
      } else {
        throw new Error(response.data.message || 'Gagal mengirim testimoni');
      }
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal mengirim testimoni. Silakan coba lagi.';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleCancelReview = () => {
    setShowReviewForm(false);
    setNewReview({ rating: 5, comment: '', eventId: '' });
  };

  // Handle add testimonial button click with validation
  const handleAddTestimonial = () => {
    console.log('handleAddTestimonial called');
    console.log('isLoggedIn:', isLoggedIn);
    console.log('currentUser:', currentUser);
    console.log('userAttendedEvents:', userAttendedEvents);
    
    if (!isLoggedIn || !currentUser) {
      showToast('Anda harus login terlebih dahulu untuk memberikan testimoni', 'warning');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (userAttendedEvents.length === 0) {
      console.log('No attended events found. Fetching events for user:', currentUser.id);
      // Try to reload the events
      if (currentUser.id) {
        loadUserAttendedEvents(currentUser.id);
      }
      showToast('Anda harus mengikuti event terlebih dahulu sebelum dapat memberikan testimoni. Silakan daftar event terlebih dahulu.', 'warning');
      return;
    }

    setShowReviewForm(true);
  };

  // Handle event card click - navigate to event detail
  const handleEventClick = (event) => {
    navigate(`/event/${event.id}`);
  };

  // Hero slides - default jika tidak ada flyers
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

  // Use flyers from backend if available, otherwise use default hero slides
  const carouselSlides = flyers.length > 0 ? flyers : heroSlides;

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
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [carouselSlides.length]);

  return (
    <>
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

      {/* Hero Section with Ocean Background - Enlarged */}
      <div 
        id="hero-section"
        className="relative h-[70vh] bg-cover bg-center bg-no-repeat"
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

      </div>

      {/* Flyer Carousel - Overlapping between Hero and White Section */}
      <div className="relative -mt-32 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Glass Card Container - Ticket Style */}
          <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-xl p-8 relative border border-white/20">
            {/* Flyer Carousel Inside */}
            <div className="relative h-80">
              {/* Carousel Slides */}
              {carouselSlides.map((slide, index) => (
                <div
                  key={`carousel-${slide.id || index}`}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentSlide ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div className="h-full rounded-xl overflow-hidden shadow-md relative cursor-pointer group"
                    onClick={() => {
                      if (slide.link_url) {
                        window.open(slide.link_url, '_blank');
                      }
                    }}
                  >
                    {/* Display flyer image from backend or default gradient */}
                    {slide.image_url ? (
                      <img
                        src={slide.image_url}
                        alt={slide.title || 'Flyer'}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#4A7FA7] via-[#1A3D63] to-[#0A1931]" />
                    )}
                    {/* Subtle overlay for readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    {/* Caption with title only (no description) */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="bg-gradient-to-r from-black/60 to-black/40 text-white rounded-xl px-6 py-4 backdrop-blur-md border border-white/10">
                        <h3 className="text-xl font-bold drop-shadow-lg">
                          {slide.title || 'Event Carousel'}
                        </h3>
                      </div>
                    </div>
                    {/* Link indicator */}
                    {slide.link_url && (
                      <div className="absolute top-4 right-4 bg-white/95 text-[#0A1931] px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <span>Buka Link</span>
                      </div>
                    )}
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
            <button
              onClick={() => navigate('/events')}
              className="text-[#4A7FA7] hover:text-[#0A1931] text-sm font-semibold transition-all flex items-center gap-1 hover:gap-2"
            >
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
                    onClick={() => handleEventClick(event)}
                    className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-xl border-2 border-[#4A7FA7]/20 overflow-hidden shadow-lg transition-all duration-500 ease-in-out cursor-pointer group animate-fade-in-up transform hover:scale-105 hover:-translate-y-6 hover:shadow-2xl hover:shadow-[#4A7FA7]/30 hover:border-[#4A7FA7] hover:ring-2 hover:ring-[#4A7FA7]/50"
                    style={{
                      animationDelay: `${index * 0.15}s`,
                      animationFillMode: 'both',
                      willChange: 'transform, box-shadow'
                    }}
                  >
                    {/* Flyer Image Area */}
                    <div className="relative h-56 bg-gradient-to-br from-[#1A3D63] via-[#4A7FA7] to-[#0A1931] flex items-center justify-center overflow-hidden group-hover:from-[#4A7FA7] group-hover:via-[#1A3D63] group-hover:to-[#0A1931] transition-all duration-500">
                      {(() => {
                        // Handle flyer URL
                        let flyerSrc = null;
                        if (event.flyer_url) {
                          flyerSrc = event.flyer_url;
                        } else if (event.flyer_kegiatan) {
                          if (event.flyer_kegiatan.startsWith('http://') || event.flyer_kegiatan.startsWith('https://')) {
                            flyerSrc = event.flyer_kegiatan;
                          } else {
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
                      <div className="absolute inset-0 bg-black/10" />
                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 bg-[#B3CFE5] text-[#0A1931] text-xs font-bold rounded-full shadow-md">
                          Tersedia
                        </span>
                      </div>
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

      {/* Event Populer Section */}
      <div className="relative pt-12 pb-12 overflow-hidden">
        {/* Gradient Background with Pattern - Color Theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-50/25 to-emerald-100/35"></div>
        <div className="absolute inset-0 opacity-35" style={{
          backgroundImage: `radial-gradient(circle at 25% 50%, rgba(34, 197, 94, 0.15) 0%, transparent 50%),
                           radial-gradient(circle at 75% 80%, rgba(16, 185, 129, 0.12) 0%, transparent 50%),
                           radial-gradient(circle at 50% 20%, rgba(5, 150, 105, 0.08) 0%, transparent 50%)`
        }}></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#F6FAFD] to-[#B3CFE5] border-2 border-emerald-500/30 rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#0A1931] inline-block">Event Populer</h2>
                {/* Animated Underline */}
                <div className="h-1 w-36 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mt-1 animate-slide-line"></div>
              </div>
            </div>
            <button
              onClick={() => navigate('/events?filter=popular')}
              className="text-emerald-600 hover:text-[#0A1931] text-sm font-semibold transition-all flex items-center gap-1 hover:gap-2"
            >
              Lihat selengkapnya
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Popular Event Cards Grid */}
          <div className="relative">
            {/* Navigation Arrow Left */}
            <button onClick={prevPopularEvents} className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-[#F6FAFD]/90 backdrop-blur-xl rounded-full shadow-lg flex items-center justify-center text-[#0A1931] hover:bg-[#F6FAFD] transition-all border border-white/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-xl border-2 border-emerald-500/20 overflow-hidden shadow-lg animate-pulse">
                    <div className="h-56 bg-emerald-500/20"></div>
                    <div className="p-4">
                      <div className="h-4 bg-emerald-500/20 rounded mb-2"></div>
                      <div className="h-4 bg-emerald-500/20 rounded mb-3"></div>
                      <div className="h-6 bg-emerald-500/20 rounded mb-3"></div>
                      <div className="h-4 bg-emerald-500/20 rounded"></div>
                    </div>
                  </div>
                ))
              ) : (
                visiblePopularEvents.map((event, index) => (
                  <div
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-xl border-2 border-emerald-500/20 overflow-hidden shadow-lg transition-all duration-500 ease-in-out cursor-pointer group animate-fade-in-up transform hover:scale-105 hover:-translate-y-6 hover:shadow-2xl hover:shadow-emerald-500/30 hover:border-emerald-500 hover:ring-2 hover:ring-emerald-500/50"
                    style={{
                      animationDelay: `${index * 0.15}s`,
                      animationFillMode: 'both',
                      willChange: 'transform, box-shadow'
                    }}
                  >
                    {/* Flyer Image Area */}
                    <div className="relative h-56 bg-gradient-to-br from-emerald-600 via-green-500 to-teal-600 flex items-center justify-center overflow-hidden group-hover:from-green-500 group-hover:via-emerald-600 group-hover:to-teal-500 transition-all duration-500">
                      {(() => {
                        // Handle flyer URL
                        let flyerSrc = null;
                        if (event.flyer_url) {
                          flyerSrc = event.flyer_url;
                        } else if (event.flyer_kegiatan) {
                          if (event.flyer_kegiatan.startsWith('http://') || event.flyer_kegiatan.startsWith('https://')) {
                            flyerSrc = event.flyer_kegiatan;
                          } else {
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
                      <div className="absolute inset-0 bg-black/10" />
                      {/* Popular Badge */}
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-md flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          Populer
                        </span>
                      </div>
                      {/* Participant Count */}
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-black/50 text-white text-xs font-medium rounded-full backdrop-blur-sm">
                          {event.peserta || event.participants || Math.floor(Math.random() * 200) + 100}+ peserta
                        </span>
                      </div>
                    </div>

                    {/* Event Info */}
                    <div className="p-4 bg-[#F6FAFD]/90 backdrop-blur-xl flex flex-col">
                      {/* Location */}
                      <div className="flex items-center gap-2 text-emerald-600 text-sm mb-2">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">{event.lokasi_kegiatan}</span>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-2 text-emerald-600 text-sm mb-3">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDate(event.waktu_mulai)}</span>
                      </div>

                      {/* Event Title - Fixed height */}
                      <h3 className="text-[#0A1931] font-bold text-lg mb-2 group-hover:text-emerald-600 transition-colors duration-300 line-clamp-2 min-h-[3.5rem]">
                        {event.judul_kegiatan}
                      </h3>

                      {/* Event Description */}
                      <p className="text-emerald-600/70 text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
                        {event.deskripsi_kegiatan || 'Event populer yang sangat diminati. Jangan sampai kehabisan tiket!'}
                      </p>

                      {/* Participant Count with Animation */}
                      <div className="flex items-center gap-1.5 mb-1">
                        <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        <span className="text-emerald-600 text-sm font-semibold">
                          {animatedCounts[`event-popular-${event.id}`] || 0} peserta
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
                                  <span className="text-gray-600 text-xs font-medium">Harga Tiket</span>
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
                ))
              )}
            </div>

            {/* Navigation Arrow Right */}
            <button onClick={nextPopularEvents} className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-[#F6FAFD]/90 backdrop-blur-xl rounded-full shadow-lg flex items-center justify-center text-[#0A1931] hover:bg-[#F6FAFD] transition-all border border-white/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>


      {/* Kategori Event Section */}
      <div id="kategori-section" className="relative py-16 overflow-hidden">
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
            <div 
              onClick={() => navigate('/category/olahraga')}
              className="group relative h-64 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105"
            >
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
            <div 
              onClick={() => navigate('/category/hiburan')}
              className="group relative h-64 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105"
            >
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
            <div 
              onClick={() => navigate('/category/edukasi')}
              className="group relative h-64 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105"
            >
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
            <div 
              onClick={() => navigate('/category/seni-budaya')}
              className="group relative h-64 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105"
            >
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

            {/* Event Menarik di SMKN 4 BOGOR Section - Dynamic */}
      <div className="relative py-20 overflow-hidden min-h-screen">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Event Card Container */}
          <div className="relative bg-[#F6FAFD]/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Header Section - Dynamic Banner */}
            <div className="relative h-80 overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${bannerConfig.backgroundImage})` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-b from-[#0A1931]/85 via-[#1A3D63]/80 to-[#0A1931]/90"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-transparent to-indigo-900/30"></div>
              
              <div className="relative h-full flex items-center justify-center text-center px-8">
                <div>
                  <div className="mb-6">
                    <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-2xl">
                    {bannerConfig.title}
                  </h2>
                  <p className="text-xl text-white/90 max-w-3xl mx-auto drop-shadow-lg leading-relaxed">
                    {bannerConfig.subtitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Event Information Cards Section - Dynamic */}
            <div className="p-8 md:p-12">
              <div className="text-center mb-10">
                <h3 className="text-2xl md:text-3xl font-bold text-[#0A1931] mb-3">
                  {sectionText.heading}
                </h3>
                <div className="w-32 h-1 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] rounded-full mx-auto mb-4"></div>
                <p className="text-[#4A7FA7] text-lg">{sectionText.subheading}</p>
              </div>

              {/* Event Cards Grid - Dynamic */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getActiveEvents().map((event) => {
                  // Debug: Log event data
                  if (event.flyerImage) {
                    console.log('Event with image:', event.title, '→', event.flyerImage);
                  }
                  
                  const iconMap = {
                    book: BookOpen, smile: Smile, palette: Palette,
                    lightbulb: Lightbulb, heart: Heart, edit: Edit
                  };
                  const IconComponent = iconMap[event.icon] || BookOpen;
                  
                  return (
                  <div 
                    key={event.id} 
                    onClick={() => {
                      // Check if event has a real eventId that links to actual event
                      if (event.eventId) {
                        navigate(`/event/${event.eventId}`);
                      } else {
                        // If no specific event linked, search for event by title in the events list
                        const matchedEvent = events.find(ev => 
                          ev.judul_kegiatan.toLowerCase().includes(event.title.toLowerCase())
                        );
                        
                        if (matchedEvent) {
                          navigate(`/event/${matchedEvent.id}`);
                        } else {
                          navigate('/events');
                        }
                      }
                    }}
                    className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 hover:border-[#4A7FA7]/50 h-full flex flex-col cursor-pointer"
                  >
                    <div className={`relative h-56 bg-gradient-to-br ${event.gradient} overflow-hidden flex-shrink-0`}>
                      {/* Flyer Image Background if exists */}
                      {event.flyerImage && (
                        <img 
                          src={event.flyerImage} 
                          alt={event.title} 
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Failed to load image:', event.flyerImage);
                            e.target.style.display = 'none';
                          }}
                          onLoad={() => console.log('Image loaded:', event.flyerImage)}
                        />
                      )}
                      <div className={`absolute inset-0 ${event.flyerImage ? 'bg-black/30' : 'bg-black/10'}`}></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <IconComponent className="w-12 h-12" />
                          </div>
                          <h4 className="text-2xl font-bold mb-1 line-clamp-1 px-4">{event.title.toUpperCase()}</h4>
                          <p className="text-sm opacity-90 font-medium">{event.schoolText || "SMKN 4 BOGOR"}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 flex flex-col flex-grow">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">{event.category}</span>
                        {event.tags && event.tags.map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{tag}</span>
                        ))}
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#4A7FA7] transition-colors line-clamp-1">
                        {event.title}
                      </h3>
                      
                      <p className="text-gray-600 text-xs mb-3 leading-relaxed line-clamp-2">
                        {event.description}
                      </p>
                      
                      <div className="space-y-1 text-xs text-gray-500 mb-3 flex-grow">
                        <div className="flex items-center gap-2">
                          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{event.date}, {event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          <span>{event.location}</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Check if event has a real eventId that links to actual event
                          if (event.eventId) {
                            // Navigate to specific event detail page
                            navigate(`/event/${event.eventId}`);
                          } else {
                            // If no specific event linked, search for event by title in the events list
                            const matchedEvent = events.find(ev => 
                              ev.judul_kegiatan.toLowerCase().includes(event.title.toLowerCase())
                            );
                            
                            if (matchedEvent) {
                              // Navigate to matched event detail
                              navigate(`/event/${matchedEvent.id}`);
                            } else {
                              // Fallback to events page
                              navigate('/events');
                            }
                          }
                        }}
                        className={`w-full py-2 bg-gradient-to-r ${event.buttonGradient} text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-all duration-300 transform hover:-translate-y-0.5 mt-auto cursor-pointer`}
                      >
                        {event.buttonText}
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fakta Menarik Section */}
      <div id="fakta-menarik-section" className="relative py-16 overflow-hidden">
        {/* Background - Color Theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-50/20 to-purple-100/30"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Title */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0A1931] mb-3">
              Fakta Menarik 
            </h2>
            {/* Animated Underline */}
            <div className="w-72 h-1 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] rounded-full mx-auto mb-3 animate-slide-line"></div>
            <p className="text-[#4A7FA7]">Temukan hal-hal menarik tentang event-event kami</p>
          </div>

          {/* Facts List */}
          <div className="space-y-6">
            {getActiveFacts().map((fact, index) => (
              <div
                key={fact.id}
                onClick={() => {
                  setSelectedFact(fact);
                  setShowFactModal(true);
                }}
                className="group flex gap-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden animate-fade-in-up border border-[#4A7FA7]/20 hover:border-[#4A7FA7]/40 p-3 cursor-pointer hover:scale-[1.02]"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: 'both'
                }}
              >
                {/* Image Section */}
                <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg">
                  <img 
                    src={fact.image} 
                    alt={fact.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Badge */}
                  <div className="absolute top-2 right-2">
                    <div className="px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-full">
                      <p className="text-[#4A7FA7] text-[10px] font-bold">Fakta</p>
                    </div>
                  </div>
                </div>
                
                {/* Content Section */}
                <div className="flex-1 py-1">
                  <h3 className="text-lg font-bold text-[#0A1931] mb-2 group-hover:text-[#4A7FA7] transition-colors line-clamp-1">
                    {fact.title}
                  </h3>
                  
                  <p className="text-sm text-[#0A1931]/70 leading-relaxed line-clamp-3">
                    {fact.description}
                  </p>
                  
                  {/* Read More Indicator */}
                  <div className="mt-2 flex items-center gap-2 text-[#4A7FA7] text-xs font-semibold group-hover:gap-3 transition-all">
                    <span>Baca Selengkapnya</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fact Detail Modal */}
      {showFactModal && selectedFact && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowFactModal(false)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-2xl font-bold">Fakta Menarik</h2>
              <button
                onClick={() => setShowFactModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-all hover:rotate-90 duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Fact Image */}
              <div className="relative w-full h-80 rounded-xl overflow-hidden mb-6 shadow-lg">
                <img
                  src={selectedFact.image}
                  alt={selectedFact.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <div className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md">
                    <p className="text-[#4A7FA7] text-sm font-bold">✨ Fakta Menarik</p>
                  </div>
                </div>
              </div>

              {/* Fact Title */}
              <h3 className="text-3xl font-bold text-[#0A1931] mb-4">
                {selectedFact.title}
              </h3>

              {/* Divider */}
              <div className="w-24 h-1 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] rounded-full mb-6"></div>

              {/* Fact Description */}
              <div className="prose prose-lg max-w-none">
                <p className="text-[#0A1931]/80 leading-relaxed text-lg whitespace-pre-line">
                  {selectedFact.description}
                </p>
              </div>

              {/* Additional Info */}
              <div className="mt-8 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#4A7FA7] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-bold text-[#0A1931] mb-1">Tahukah Anda?</h4>
                    <p className="text-sm text-[#0A1931]/70">Fakta menarik ini dikurasi khusus untuk memberikan wawasan yang menarik tentang event-event kami!</p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowFactModal(false)}
                className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-bold rounded-xl hover:shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile App Section */}
      <div id="mobile-app-section" className="relative py-20 overflow-hidden">
        {/* Background - Color Theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A1931] via-[#1A3D63] to-[#4A7FA7]"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#4A7FA7]/20 via-transparent to-[#0A1931]/30"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#4A7FA7]/10 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/3 rounded-full blur-xl"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Content Section */}
            <div className="text-white order-2 lg:order-1">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
                <div className="w-2 h-2 bg-[#4A7FA7] rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold">#Choose Better</span>
              </div>
              
              {/* Main Heading */}
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                <span className="block">Aplikasi Mobile</span>
                <span className="block text-[#4A7FA7]">SMKN 4 BOGOR</span>
              </h2>
              
              {/* Subheading */}
              <div className="mb-8">
                <p className="text-xl text-white/90 mb-2">
                  Empowering Innovation, Driving Success:
                </p>
                <h3 className="text-2xl font-bold text-[#4A7FA7] mb-2">
                  Event App SMKN 4
                </h3>
                <p className="text-white/80 leading-relaxed">
                  Partner Anda dalam Mengakses Event dan Informasi Sekolah dengan Mudah
                </p>
              </div>
              
              {/* Features List */}
              <div className="space-y-4 mb-8">
                {[
                  { icon: '📅', text: 'Lihat jadwal event terbaru' },
                  { icon: '🎫', text: 'Daftar event secara online' },
                  { icon: '🔔', text: 'Notifikasi event penting' },
                  { icon: '📊', text: 'Statistik dan prestasi sekolah' }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <span className="text-lg">{feature.icon}</span>
                    </div>
                    <span className="text-white/90">{feature.text}</span>
                  </div>
                ))}
              </div>
              
              {/* Download Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="group flex items-center justify-center gap-3 px-6 py-4 bg-white text-[#0A1931] rounded-xl font-semibold hover:bg-white/90 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl">
                  <div className="w-8 h-8 bg-[#0A1931] rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-[#0A1931]/70">Download di</div>
                    <div className="text-sm font-bold">App Store</div>
                  </div>
                </button>
                
                <button className="group flex items-center justify-center gap-3 px-6 py-4 bg-[#4A7FA7] text-white rounded-xl font-semibold hover:bg-[#4A7FA7]/90 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl border border-white/20">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-white/70">Download di</div>
                    <div className="text-sm font-bold">Google Play</div>
                  </div>
                </button>
              </div>
            </div>
            
            {/* Image/Phone Mockup Section */}
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative w-64 h-[500px] bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-[3rem] shadow-2xl p-4 transform hover:scale-105 transition-transform duration-500">
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                  <div className="bg-gradient-to-br from-[#0A1931] to-[#4A7FA7] h-full flex items-center justify-center text-white text-6xl">
                    📱
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial Section - Infinite Scroll */}
      <div id="testimonial-section" className="relative py-16 overflow-hidden">
        {/* Background - Color Theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-50/20 to-purple-100/30"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0A1931] mb-3">
              Apa Kata Mereka?
            </h2>
            <div className="w-64 h-1 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] rounded-full mx-auto mb-4"></div>
            <p className="text-[#4A7FA7] text-lg mb-6">
              Dengarkan pengalaman mereka yang telah mengikuti event kami
            </p>
          </div>
          
          <TestimonialScroll onAddTestimonial={handleAddTestimonial} />
        </div>
      </div>

      {/* Review Submission Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F6FAFD]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-[#0A1931]">Tambah Testimoni</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Peserta Terverifikasi</span>
                </div>
              </div>
              <button
                onClick={handleCancelReview}
                className="w-8 h-8 bg-[#4A7FA7]/20 rounded-full flex items-center justify-center text-[#0A1931] hover:bg-[#4A7FA7]/30 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Event Selection - Only show attended events */}
              <div>
                <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                  Pilih Event yang Pernah Diikuti
                </label>
                <select
                  value={newReview.eventId}
                  onChange={(e) => setNewReview(prev => ({ ...prev, eventId: e.target.value }))}
                  className="w-full p-3 bg-white border-2 border-[#4A7FA7]/20 rounded-lg text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors"
                  required
                >
                  <option value="">Pilih event yang telah diikuti</option>
                  {userAttendedEvents.map(attendedEvent => (
                    <option key={attendedEvent.id} value={attendedEvent.eventId}>
                      {attendedEvent.eventName} - {new Date(attendedEvent.attendedDate).toLocaleDateString('id-ID')}
                    </option>
                  ))}
                </select>
                
                {userAttendedEvents.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Anda belum mengikuti event apapun. Ikuti event terlebih dahulu untuk memberikan testimoni.
                  </p>
                )}
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
                  disabled={isSubmittingReview}
                  className="flex-1 py-3 bg-[#4A7FA7]/20 text-[#0A1931] font-semibold rounded-lg hover:bg-[#4A7FA7]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="flex-1 py-3 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-semibold rounded-lg hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmittingReview ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Mengirim...
                    </>
                  ) : (
                    'Kirim Ulasan'
                  )}
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

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
