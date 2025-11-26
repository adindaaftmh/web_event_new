import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import JigsawCaptcha from "../components/JigsawCaptcha";
import oceanBg from "../assets/ocean.jpg";

const API_URL = "https://dynotix-production.up.railway.app/api";

export default function Contact() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  // Jigsaw Captcha State
  const [showCaptchaModal, setShowCaptchaModal] = useState(false);
  
  // Success Popup State
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        const email = user.email || '';
        const name = user.name || user.username || '';
        
        setIsLoggedIn(true);
        setUserEmail(email);
        setUserName(name);
        setFormData(prev => ({
          ...prev,
          email: email,
          name: name
        }));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!isLoggedIn) {
      alert('Anda harus login terlebih dahulu untuk mengirim pesan!');
      navigate('/login');
      return;
    }

    // Validate form
    if (!formData.name || !formData.subject || !formData.message || !formData.phone) {
      alert('Mohon lengkapi semua field yang wajib diisi!');
      return;
    }

    // Show jigsaw captcha modal
    setShowCaptchaModal(true);
  };

  const handleCaptchaSuccess = async () => {
    setShowCaptchaModal(false);
    setIsSubmitting(true);

    try {
      // Send message to backend API
      const response = await axios.post(
        `${API_URL}/contact-messages`,
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Gagal mengirim pesan');
      }

      // Success - Show popup instead of alert
      setShowSuccessPopup(true);
      
      // Reset form except email
      setFormData({
        email: formData.email,
        name: '',
        phone: '',
        subject: '',
        message: ''
      });
      
    } catch (error) {
      console.error('Error sending message:', error);
      if (error.response?.status === 401) {
        alert('Sesi Anda telah berakhir. Silakan login kembali.');
        navigate('/login');
      } else {
        alert('Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Animated Background - Matching HomePage */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Large Blur Blobs */}
        <div className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-blue-400/25 to-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/20 to-pink-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-[450px] h-[450px] bg-gradient-to-br from-cyan-400/20 to-blue-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Floating Bubbles */}
        <div className="absolute top-32 left-[15%] w-24 h-24 border-2 border-blue-400/50 rounded-full animate-float bg-gradient-to-br from-blue-200/20 to-indigo-300/15"></div>
        <div className="absolute top-64 right-[20%] w-32 h-32 border-2 border-purple-400/45 rounded-full animate-float bg-gradient-to-br from-purple-200/20 to-pink-300/15" style={{ animationDelay: '1.5s', animationDuration: '8s' }}></div>
        <div className="absolute bottom-40 left-[25%] w-20 h-20 border-2 border-cyan-400/50 rounded-full animate-float bg-gradient-to-br from-cyan-200/20 to-blue-300/15" style={{ animationDelay: '3s', animationDuration: '10s' }}></div>
      </div>

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
              Hubungi Kami
            </h1>
            <p className="text-lg md:text-xl text-white/95 max-w-2xl mx-auto drop-shadow-lg">
              Kami siap membantu Anda. Kirim pesan atau hubungi kami melalui informasi di bawah ini
            </p>
          </div>
        </div>
      </div>

      {/* Get In Touch Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Side - Contact Info */}
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Mari Terhubung
              </h2>
              <p className="text-gray-600 mb-10">
                Jangan ragu untuk menghubungi kami kapan saja. Kami akan menghubungi Anda kembali sesegera mungkin.
              </p>

              {/* Contact Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#1A3D63] rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-800 mb-1">Telepon</h3>
                    <p className="text-sm text-gray-600">+62 831-6922-1045</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#1A3D63] rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-800 mb-1">Email</h3>
                    <p className="text-sm text-gray-600">dynotix@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#1A3D63] rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-800 mb-1">Alamat</h3>
                    <p className="text-sm text-gray-600">Tajur Bogor </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#1A3D63] rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-800 mb-1">Instagram</h3>
                    <p className="text-sm text-gray-600">@dynotix.event</p>
                  </div>
                </div>
              </div>

              {/* Map Section - Below Contact Cards */}
              <div className="mt-8">
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border-2 border-white/60">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <svg className="w-6 h-6 text-[#1A3D63]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Lokasi Kami
                    </h3>
                    <p className="text-sm text-gray-600">Temukan kami di peta</p>
                  </div>
                  <div className="bg-gray-200 rounded-xl overflow-hidden shadow-lg" style={{ height: '300px' }}>
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63325.89087556891!2d106.78849697910156!3d-6.59659968359375!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69c5d2e602b501%3A0x25a12f0f97fba863!2sJl.%20Raya%20Tajur%2C%20Muarasari%2C%20Kec.%20Bogor%20Sel.%2C%20Kota%20Bogor%2C%20Jawa%20Barat!5e0!3m2!1sen!2sid!4v1699548000000"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Lokasi DYNOTIX"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Contact Form */}
            <div>
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border-2 border-white/60">
                {!isLoggedIn && (
                  <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-xl">
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="font-bold text-yellow-800">Login Diperlukan</p>
                        <p className="text-sm text-yellow-700">Anda harus login terlebih dahulu untuk mengirim pesan.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="mt-3 w-full px-4 py-2 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-all"
                    >
                      Login Sekarang
                    </button>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="email.anda@contoh.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Nama</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Nama Anda"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Telepon</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="+62 xxx xxxx xxxx"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subjek</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Tentang apa pesan Anda?"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pesan</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder="Tulis pesan Anda di sini..."
                    />
                  </div>
                  
                  
                  <button
                    type="submit"
                    disabled={!isLoggedIn || isSubmitting}
                    className="w-full px-8 py-4 bg-[#1A3D63] text-white rounded-xl font-bold text-base hover:bg-[#0F2942] transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Mengirim...
                      </>
                    ) : (
                      'Kirim Pesan'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
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

      {/* Success Popup Modal */}
      {showSuccessPopup && (
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
              Pesan Berhasil Terkirim!
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Terima kasih telah menghubungi kami. Tim kami akan segera menghubungi Anda kembali melalui email atau telepon.
            </p>

            {/* Info Box */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-blue-800">Estimasi Respons</p>
                  <p className="text-sm text-blue-700">Biasanya kami merespons dalam 1-2 hari kerja</p>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#1A3D63] to-[#2563EB] text-white rounded-xl font-bold hover:from-[#0F2942] hover:to-[#1E40AF] transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] duration-300"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />

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
