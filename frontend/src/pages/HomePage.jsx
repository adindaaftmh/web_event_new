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
import olahragaImg from "../assets/olahraga.jpg";
import edukasiImg from "../assets/edukasi.jpeg";
import senibudayaImg from "../assets/senibudaya.jpg";
import hiburanImg from "../assets/hiburan.jpg";
import axios from 'axios';
import { BookOpen, Smile, Palette, Lightbulb, Heart, Edit } from 'lucide-react';
import { testimonialService } from '../services/apiService';
import apiClient from '../config/api';

const API_URL = "https://dynotix-production.up.railway.app/api";

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
  const [showReviewSuccessPopup, setShowReviewSuccessPopup] = useState(false);
  
  // User authentication and attended events stagte
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userAttendedEvents, setUserAttendedEvents] = useState([]);
  const [participants, setParticipants] = useState([]);
  
  const EVENTS_PER_PAGE = 4;

  // Filter event yang belum selesai dan sort by waktu_mulai (upcoming first)
  const upcomingEvents = events.length > 0 ? [...events]
    .filter(event => {
      const endTime = new Date(event.waktu_selesai || event.waktu_mulai);
      return endTime > new Date(); // Only show events that haven't ended
    })
    .sort((a, b) => {
      return new Date(a.waktu_mulai) - new Date(b.waktu_mulai);
    }) : [];

  const totalEventPages = Math.ceil(upcomingEvents.length / EVENTS_PER_PAGE) || 0;
  const sortedEvents = upcomingEvents; // Alias untuk kompatibilitas

  const visibleEvents = upcomingEvents.slice(
    eventsPage * EVENTS_PER_PAGE,
    eventsPage * EVENTS_PER_PAGE + EVENTS_PER_PAGE
  );

  // Fetch participants from database
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await apiClient.get('/daftar-hadir');
        const participantsData = response.data.data || [];
        console.log('HomePage - Fetched participants:', participantsData);
        setParticipants(participantsData);
      } catch (error) {
        console.error('Error fetching participants:', error);
        setParticipants([]);
      }
    };
    fetchParticipants();
  }, []);

  // Calculate participant count for each event from database
  const getEventParticipantCount = (eventId) => {
    if (eventId === 16) {
      console.log('\n=== Debugging Event 16 ===');
      console.log('Searching for eventId:', eventId, 'Type:', typeof eventId);
      console.log('All participants:', participants);
      
      participants.forEach((p, index) => {
        console.log(`Participant ${index + 1}:`, {
          kegiatan_id: p.kegiatan_id,
          kegiatan_id_type: typeof p.kegiatan_id,
          id_kegiatan: p.id_kegiatan,
          nama: p.nama_lengkap,
          match_kegiatan_id: p.kegiatan_id === eventId,
          match_id_kegiatan: p.id_kegiatan === eventId,
          match_loose: p.kegiatan_id == eventId || p.id_kegiatan == eventId
        });
      });
    }
    
    const filtered = participants.filter(p => p.kegiatan_id === eventId || p.id_kegiatan === eventId);
    
    if (eventId === 16) {
      console.log('Filtered result for Event 16:', filtered);
      console.log('Count:', filtered.length);
      console.log('=========================\n');
    }
    
    return filtered.length;
  };

  // Set participant counts directly - NO ANIMATION for instant display
  useEffect(() => {
    if (participants.length === 0 || visibleEvents.length === 0) return;
    
    const newCounts = {};
    visibleEvents.forEach(event => {
      const count = getEventParticipantCount(event.id);
      newCounts[`event-${event.id}`] = count;
    });
    
    setAnimatedCounts(prev => ({ ...prev, ...newCounts }));
  }, [visibleEvents, participants]);

  // Popular events: All events sorted by participant count (highest first)
  const popularEvents = [...events]
    .map(event => ({
      ...event,
      participantCount: getEventParticipantCount(event.id)
    }))
    // Show all events, sorted by participant count (events with participants shown first)
    .sort((a, b) => b.participantCount - a.participantCount); // Sort by participant count descending
  
  const totalPopularEventPages = Math.ceil(popularEvents.length / EVENTS_PER_PAGE) || 0;
  const visiblePopularEvents = popularEvents.slice(
    popularEventsPage * EVENTS_PER_PAGE,
    popularEventsPage * EVENTS_PER_PAGE + EVENTS_PER_PAGE
  );

  // Set popular events participant counts directly - NO ANIMATION for instant display
  useEffect(() => {
    if (participants.length === 0 || visiblePopularEvents.length === 0) return;
    
    const newCounts = {};
    visiblePopularEvents.forEach(event => {
      const count = getEventParticipantCount(event.id);
      newCounts[`event-popular-${event.id}`] = count;
    });
    
    setAnimatedCounts(prev => ({ ...prev, ...newCounts }));
  }, [visiblePopularEvents, participants, popularEventsPage]);

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
    
    console.log('=== Submit Review Debug ===');
    console.log('isLoggedIn:', isLoggedIn);
    console.log('currentUser:', currentUser);
    console.log('userAttendedEvents:', userAttendedEvents);
    console.log('newReview:', newReview);
    
    // Prevent double submission
    if (isSubmittingReview) {
      console.log('Already submitting, prevented double submission');
      return;
    }
    
    // Validate user is logged in
    if (!isLoggedIn || !currentUser) {
      console.log('User not logged in');
      showToast('Anda harus login terlebih dahulu untuk memberikan testimoni', 'warning');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    // Validate user has attended events
    if (userAttendedEvents.length === 0) {
      console.log('User has no attended events');
      showToast('Anda harus mengikuti event terlebih dahulu sebelum dapat memberikan testimoni', 'warning');
      return;
    }

    // Validate form fields
    if (!newReview.eventId || !newReview.comment.trim()) {
      console.log('Form validation failed - missing fields');
      console.log('eventId:', newReview.eventId);
      console.log('comment:', newReview.comment);
      showToast('Mohon lengkapi semua field (Pilih event dan tulis komentar)', 'error');
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
        // Show success popup instead of toast
        setShowReviewSuccessPopup(true);
        setShowReviewForm(false);
        setNewReview({ rating: 5, comment: '', eventId: '' });
        
        // Refresh testimonials after successful submission
        if (window.refreshTestimonials) {
          await window.refreshTestimonials();
        }
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

  // Check if event has ended
  const isEventEnded = (event) => {
    const now = new Date();
    // Check waktu_selesai first, if not available check waktu_mulai
    const endTime = event.waktu_selesai ? new Date(event.waktu_selesai) : (event.waktu_mulai ? new Date(event.waktu_mulai) : null);
    
    if (!endTime) return false;
    return now > endTime;
  };

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
                visibleEvents.map((event, index) => {
                  const eventEnded = isEventEnded(event);
                  return (
                  <div
                    key={`event-${event.id}-${eventsPage}`}
                    onClick={() => !eventEnded && handleEventClick(event)}
                    className={`bg-[#F6FAFD]/90 backdrop-blur-xl rounded-xl border-2 overflow-hidden shadow-lg transition-all duration-500 ease-in-out group transform ${
                      eventEnded 
                        ? 'opacity-70 grayscale cursor-not-allowed border-gray-300 hover:scale-100' 
                        : 'cursor-pointer border-[#4A7FA7]/20 hover:scale-105 hover:-translate-y-6 hover:shadow-2xl hover:shadow-[#4A7FA7]/30 hover:border-[#4A7FA7] hover:ring-2 hover:ring-[#4A7FA7]/50'
                    }`}
                    style={{
                      animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
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
                })
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
                visiblePopularEvents.map((event, index) => {
                  const eventEnded = isEventEnded(event);
                  return (
                  <div
                    key={`event-popular-${event.id}-${popularEventsPage}`}
                    onClick={() => !eventEnded && handleEventClick(event)}
                    className={`bg-[#F6FAFD]/90 backdrop-blur-xl rounded-xl border-2 overflow-hidden shadow-lg transition-all duration-500 ease-in-out group transform ${
                      eventEnded 
                        ? 'opacity-70 grayscale cursor-not-allowed border-gray-300 hover:scale-100' 
                        : 'cursor-pointer border-emerald-500/20 hover:scale-105 hover:-translate-y-6 hover:shadow-2xl hover:shadow-emerald-500/30 hover:border-emerald-500 hover:ring-2 hover:ring-emerald-500/50'
                    }`}
                    style={{
                      animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
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
                          <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-md flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            Populer
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
                  );
                })
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
              <div className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity duration-500" style={{ backgroundImage: `url(${olahragaImg})` }}></div>
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
              <div className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity duration-500" style={{ backgroundImage: `url(${hiburanImg})` }}></div>
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
              <div className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity duration-500" style={{ backgroundImage: `url(${edukasiImg})` }}></div>
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
              <div className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity duration-500" style={{ backgroundImage: `url(${senibudayaImg})` }}></div>
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
                {getActiveEvents().map((event, index) => {
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
                    key={`event-card-${event.id}-${index}`} 
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
      <div id="mobile-app-section" className="relative py-24 overflow-hidden">
        {/* Modern Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A1931] via-[#1A3D63] to-[#4A7FA7]"></div>
        
        {/* Minimal Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-20 left-[10%] w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-[20%] w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-32 left-[15%] w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-20 right-[25%] w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Clean Phone Mockup */}
            <div className="flex justify-center lg:justify-end order-2 lg:order-2">
              <div className="relative lg:-translate-x-8">
                {/* Large main phone */}
                <div className="relative w-52 sm:w-64 lg:w-72 h-[420px] sm:h-[500px] lg:h-[540px] bg-white rounded-[2.8rem] shadow-2xl border-[5px] border-black z-10">
                  <div className="relative w-full h-full bg-gradient-to-br from-[#0A1931] via-[#102741] to-[#1A3D63] rounded-[2rem] overflow-hidden">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-black/80 rounded-full"></div>
                    <div className="flex items-center justify-between px-4 pt-4 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#4A7FA7] flex items-center justify-center text-[9px] font-bold text-white">
                          D
                        </div>
                        <span className="text-white/70 text-[11px] font-semibold">Dynotix</span>
                      </div>
                      <span className="text-white/60 text-[11px]">9:41</span>
                    </div>
                    <div className="p-4 pt-1 space-y-3">
                      <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                        <p className="text-white/80 text-xs mb-1">Event Hari Ini</p>
                        <p className="text-white font-semibold text-sm">Seminar Karir Digital</p>
                        <p className="text-white/60 text-[11px]">Aula SMKN 4   b7 13.00 WIB</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-black/20 rounded-lg px-3 py-2">
                          <div>
                            <p className="text-white text-xs font-medium">Lomba Desain Poster</p>
                            <p className="text-white/60 text-[10px]">Besok   b7 09.00 WIB</p>
                          </div>
                          <span className="text-[10px] text-[#4A7FA7] bg-white/10 px-2 py-1 rounded-full border border-white/10">Daftar</span>
                        </div>
                        <div className="flex items-center justify-between bg-black/15 rounded-lg px-3 py-2">
                          <div>
                            <p className="text-white text-xs font-medium">Workshop UI/UX</p>
                            <p className="text-white/60 text-[10px]">Sabtu   b7 10.00 WIB</p>
                          </div>
                          <span className="text-[10px] text-white/80 bg-[#4A7FA7]/60 px-2 py-1 rounded-full">Segera</span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-14 h-1.5 bg-white/70 rounded-full"></div>
                  </div>
                </div>

                {/* Smaller secondary phone */}
                <div className="absolute -right-4 sm:-right-6 bottom-2 sm:bottom-4 w-32 sm:w-40 lg:w-44 h-64 sm:h-72 lg:h-80 bg-white rounded-[2.4rem] shadow-2xl border-[5px] border-black z-20">
                  <div className="relative w-full h-full bg-gradient-to-br from-[#0A1931] via-[#0F3A4F] to-[#1A3D63] rounded-[2rem] overflow-hidden">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-black/80 rounded-full"></div>
                    <div className="flex flex-col h-full px-4 pt-8 pb-5">
                      <div className="w-10 h-10 mx-auto mb-4 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 8h12M6 12h12M6 16h12" />
                        </svg>
                      </div>

                      <div className="text-center mb-4">
                        <p className="text-white font-semibold text-sm">Selamat Datang!</p>
                        <p className="text-white/70 text-[10px] mt-1">Masuk untuk mengakses event menarik</p>
                      </div>

                      <div className="space-y-2 text-white/80 text-[10px]">
                        <div className="space-y-1">
                          <p className="font-medium">Email</p>
                          <div className="h-7 rounded-lg border border-white/30 bg-white/10 flex items-center px-2 text-[9px] text-white/60">
                            Masukkan email Anda
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium">Password</p>
                          <div className="h-7 rounded-lg border border-white/30 bg-white/10 flex items-center justify-between px-2 text-[9px] text-white/60">
                            <span>Masukkan password</span>
                            <span className="text-[10px] text-white/70">•••</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 mb-2">
                        <div className="flex items-center gap-1 text-[9px] text-white/80">
                          <span className="w-3 h-3 rounded border border-white/70 bg-transparent"></span>
                          <span>Ingat saya</span>
                        </div>
                        <button className="text-[9px] text-[#B3E6FF]">Lupa password?</button>
                      </div>

                      <button className="w-full h-8 rounded-lg bg-white text-[#0A1931] text-[10px] font-semibold mb-2 shadow-sm">
                        Masuk
                      </button>

                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-px flex-1 bg-white/25"></div>
                        <span className="text-[9px] text-white/70">Atau</span>
                        <div className="h-px flex-1 bg-white/25"></div>
                      </div>

                      <button className="w-full h-8 rounded-lg bg-white/10 border border-white/30 flex items-center justify-center gap-2 text-[10px] text-white mb-1">
                        <span className="w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center text-[8px] font-bold text-[#4285F4]">G</span>
                        <span>Masuk dengan Google</span>
                      </button>

                      <div className="mt-auto pt-1 text-center text-[9px] text-white/75">
                        <span>Belum punya akun? </span>
                        <span className="font-semibold text-white">Daftar</span>
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-14 h-1.5 bg-white/70 rounded-full"></div>
                  </div>
                </div>

              </div>
            </div>

            <div className="text-white text-center lg:text-left order-1 lg:order-1 lg:translate-x-4">
              {/* Modern Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 backdrop-blur-md rounded-full border border-white/10 mb-6 lg:mb-8">
                <div className="w-2 h-2 bg-[#4A7FA7] rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-white/90">Segera Hadir</span>
              </div>
              
              {/* Main Heading */}
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 lg:mb-6 leading-tight">
                Aplikasi Mobile
              </h2>
              <h3 className="text-3xl md:text-4xl lg:text-4xl font-bold mb-6 lg:mb-8">
                <span className="bg-gradient-to-r from-[#4A7FA7] via-[#6B9FC7] to-white bg-clip-text text-transparent">
                  Dynotix 
                </span>
              </h3>
              
              {/* Simple Description */}
              <p className="text-base md:text-lg text-white/80 max-w-xl lg:max-w-lg mx-auto lg:mx-0 mb-4 lg:mb-6 leading-relaxed">
                Aplikasi mobile untuk mengakses event dan informasi dengan mudah.
              </p>
              <p className="text-sm md:text-base text-white/60">
                Kelola pendaftaran, dapatkan pengingat jadwal, dan pantau riwayat kehadiran langsung dari ponsel Anda.
                <span className="ml-1 text-white/80 font-medium">Segera Hadir.</span>
              </p>
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
                  {userAttendedEvents.map((attendedEvent, index) => (
                    <option key={`attended-${attendedEvent.eventId}-${index}`} value={attendedEvent.eventId}>
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

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Review Success Popup Modal */}
      {showReviewSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform animate-scale-in">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            {/* Success Message */}
            <h3 className="text-2xl font-bold text-gray-800 text-center mb-3">
              Testimoni Sudah Terkirim!
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Terima kasih atas testimoni Anda. Ulasan Anda akan segera ditinjau oleh tim kami.
            </p>

            {/* Close Button */}
            <button
              onClick={() => setShowReviewSuccessPopup(false)}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white rounded-xl font-bold hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] duration-300"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      <style>{`
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
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
