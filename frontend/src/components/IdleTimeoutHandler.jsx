import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const IdleTimeoutHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const timeoutIdRef = useRef(null);
  const warningTimeoutIdRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 menit
  const WARNING_TIME = 1 * 60 * 1000; // 1 menit sebelum logout

  // Check if user is logged in
  const isUserLoggedIn = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    return !!token;
  };

  // Logout function
  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // Close warning modal
    setShowWarning(false);
    
    // Navigate to appropriate login page
    const isAdminPage = location.pathname.startsWith('/admin');
    navigate(isAdminPage ? '/admin/login' : '/login', { 
      replace: true,
      state: { message: 'Sesi Anda telah berakhir karena tidak aktif.' }
    });
  };

  // Reset timer
  const resetTimer = () => {
    // Clear existing timeouts
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }
    if (warningTimeoutIdRef.current) {
      clearTimeout(warningTimeoutIdRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    // Reset state
    setShowWarning(false);
    setCountdown(60);

    // Only set timers if user is logged in
    if (!isUserLoggedIn()) {
      return;
    }

    // Set warning timeout (4 menit)
    warningTimeoutIdRef.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(60);
      
      // Start countdown
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, IDLE_TIMEOUT - WARNING_TIME);

    // Set logout timeout (5 menit)
    timeoutIdRef.current = setTimeout(() => {
      handleLogout();
    }, IDLE_TIMEOUT);
  };

  // Activity handler
  const handleActivity = () => {
    if (isUserLoggedIn()) {
      resetTimer();
    }
  };

  // Continue session (dismiss warning)
  const handleContinueSession = () => {
    resetTimer();
  };

  useEffect(() => {
    // Only activate if user is logged in
    if (!isUserLoggedIn()) {
      return;
    }

    // Events to track for activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'keydown'
    ];

    // Attach event listeners
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Start timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      if (warningTimeoutIdRef.current) {
        clearTimeout(warningTimeoutIdRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [location.pathname]); // Re-run when route changes

  // Don't render anything if user is not logged in
  if (!isUserLoggedIn()) {
    return null;
  }

  return (
    <>
      {showWarning && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop with animated blur */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A1931]/80 via-[#1A3D63]/70 to-[#4A7FA7]/60 backdrop-blur-md animate-fade-in"></div>
          
          {/* Decorative circles */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-[#B3CFE5]/20 rounded-full blur-2xl animate-float"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#4A7FA7]/20 rounded-full blur-3xl animate-float-delayed"></div>
          
          {/* Modal */}
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full animate-scale-in overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-[#4A7FA7] via-[#1A3D63] to-[#0A1931] px-8 py-6 relative overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute w-40 h-40 bg-white rounded-full -top-10 -right-10 animate-pulse"></div>
                <div className="absolute w-32 h-32 bg-white rounded-full -bottom-5 -left-5 animate-pulse" style={{animationDelay: '1s'}}></div>
              </div>
              
              {/* Icon with animation */}
              <div className="relative flex justify-center mb-4">
                <div className="relative">
                  {/* Outer ring */}
                  <div className="absolute inset-0 w-24 h-24 border-4 border-white/30 rounded-full animate-ping"></div>
                  {/* Icon container */}
                  <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl">
                    <svg className="w-12 h-12 text-[#4A7FA7] animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Title */}
              <h2 className="relative text-2xl lg:text-3xl font-bold text-white text-center mb-2">
                ⏰ Sesi Akan Berakhir
              </h2>
              <p className="relative text-[#B3CFE5] text-center text-sm">
                Anda tidak aktif selama beberapa waktu
              </p>
            </div>

            {/* Content */}
            <div className="px-8 py-8">
              {/* Countdown Circle */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  {/* Progress circle background */}
                  <svg className="transform -rotate-90 w-36 h-36">
                    <circle
                      cx="72"
                      cy="72"
                      r="64"
                      stroke="#B3CFE5"
                      strokeWidth="8"
                      fill="none"
                      opacity="0.2"
                    />
                    <circle
                      cx="72"
                      cy="72"
                      r="64"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 64}`}
                      strokeDashoffset={`${2 * Math.PI * 64 * (1 - countdown / 60)}`}
                      className="transition-all duration-1000 ease-linear"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4A7FA7" />
                        <stop offset="100%" stopColor="#1A3D63" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* Countdown number */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold bg-gradient-to-br from-[#4A7FA7] to-[#0A1931] bg-clip-text text-transparent animate-pulse">
                      {countdown}
                    </span>
                    <span className="text-sm text-gray-500 font-medium mt-1">detik</span>
                  </div>
                </div>
              </div>

              {/* Warning message */}
              <div className="bg-gradient-to-r from-[#B3CFE5]/20 to-[#4A7FA7]/10 rounded-2xl p-4 mb-6 border border-[#B3CFE5]/30">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-[#0A1931] font-semibold text-sm mb-1">
                      Sesi akan otomatis logout
                    </p>
                    <p className="text-gray-600 text-xs leading-relaxed">
                      Klik <strong className="text-[#4A7FA7]">"Lanjutkan Sesi"</strong> untuk tetap login, atau <strong className="text-gray-700">"Logout"</strong> untuk keluar sekarang.
                    </p>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleLogout}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-semibold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md border border-gray-300 group"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </span>
                </button>
                <button
                  onClick={handleContinueSession}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-[#4A7FA7] via-[#1A3D63] to-[#0A1931] hover:from-[#4A7FA7] hover:to-[#1A3D63] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Lanjutkan Sesi
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scale-in {
          0% {
            transform: scale(0.85) translateY(20px);
            opacity: 0;
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        @keyframes fade-in {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.05);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 8s ease-in-out infinite;
          animation-delay: 1s;
        }
      `}</style>
    </>
  );
};

export default IdleTimeoutHandler;