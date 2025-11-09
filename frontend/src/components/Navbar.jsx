import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const [hoveredMenu, setHoveredMenu] = useState(null);

  // Function to check if a menu item is active
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    if (path !== '/' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  // Function to check if active menu underline should be visible
  const shouldShowActiveUnderline = () => {
    // If no menu is hovered, show underline on active menu
    if (!hoveredMenu) return true;
    // If a menu is hovered, hide underline on active menu
    return false;
  };

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Handle scroll effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const scrollToSection = (sectionId) => {
    // If we're not on homepage, navigate to homepage first
    if (window.location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } });
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  };

  return (
    <nav
      className={`fixed top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 md:left-8 md:right-8 lg:left-12 lg:right-12 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#1A3D63]/85 backdrop-blur-2xl shadow-2xl"
          : "bg-[#1A3D63]/75 backdrop-blur-xl shadow-xl"
      } border border-white/20 rounded-2xl`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Left Section: Enhanced Logo */}
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate("/")}>
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-white/25 to-white/15 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/40 shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                <svg className="w-7 h-7 text-white drop-shadow-lg" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-xl tracking-wide drop-shadow-lg group-hover:text-blue-100 transition-colors duration-300">DYNOTIX</span>
              <span className="text-white/70 text-xs font-medium tracking-wider">EVENT PLATFORM</span>
            </div>
          </div>

          {/* Center: Enhanced Navigation Menu - Hidden on mobile */}
          <div 
            className="hidden lg:flex items-center justify-center flex-1 gap-1"
            onMouseLeave={() => setHoveredMenu(null)}
          >
            <button
              onMouseEnter={() => setHoveredMenu('beranda')}
              onMouseLeave={() => setHoveredMenu(null)}
              onClick={() => {
                if (window.location.pathname === '/') {
                  const heroSection = document.getElementById('hero-section');
                  if (heroSection) {
                    heroSection.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    });
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                } else {
                  navigate("/");
                }
              }}
              className={`relative px-3 py-1.5 text-xs font-medium transition-all duration-200 group ${
                isActive('/') 
                  ? "text-blue-200 font-bold" 
                  : "text-white hover:text-blue-200"
              }`}
            >
              Beranda
              <span className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-300 to-blue-500 rounded-full transition-all duration-300 ease-out ${
                isActive('/') 
                  ? (shouldShowActiveUnderline() ? "w-full" : "w-0")
                  : (hoveredMenu === 'beranda' ? "w-full" : "w-0")
              }`}></span>
            </button>
            <button
              onMouseEnter={() => setHoveredMenu('mobile-app')}
              onMouseLeave={() => setHoveredMenu(null)}
              onClick={() => scrollToSection("mobile-app-section")}
              className="relative px-3 py-1.5 text-white text-xs font-medium hover:text-blue-200 transition-all duration-200 group"
            >
              Mobile App
              <span className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-300 to-blue-500 rounded-full transition-all duration-300 ease-out ${
                hoveredMenu === 'mobile-app' ? "w-full" : "w-0"
              }`}></span>
            </button>
            <button
              onMouseEnter={() => setHoveredMenu('event')}
              onMouseLeave={() => setHoveredMenu(null)}
              onClick={() => navigate("/events")}
              className={`relative px-3 py-1.5 text-xs font-medium transition-all duration-200 group ${
                isActive('/events') 
                  ? "text-blue-200 font-bold" 
                  : "text-white hover:text-blue-200"
              }`}
            >
              Event
              <span className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-300 to-blue-500 rounded-full transition-all duration-300 ease-out ${
                isActive('/events') 
                  ? (shouldShowActiveUnderline() ? "w-full" : "w-0")
                  : (hoveredMenu === 'event' ? "w-full" : "w-0")
              }`}></span>
            </button>
            <button
              onMouseEnter={() => setHoveredMenu('tentang')}
              onMouseLeave={() => setHoveredMenu(null)}
              onClick={() => navigate("/about")}
              className={`relative px-3 py-1.5 text-xs font-medium transition-all duration-200 group ${
                isActive('/about') 
                  ? "text-blue-200 font-bold" 
                  : "text-white hover:text-blue-200"
              }`}
            >
              Tentang Kami
              <span className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-300 to-blue-500 rounded-full transition-all duration-300 ease-out ${
                isActive('/about') 
                  ? (shouldShowActiveUnderline() ? "w-full" : "w-0")
                  : (hoveredMenu === 'tentang' ? "w-full" : "w-0")
              }`}></span>
            </button>
            <button
              onMouseEnter={() => setHoveredMenu('kontak')}
              onMouseLeave={() => setHoveredMenu(null)}
              onClick={() => navigate("/contact")}
              className={`relative px-3 py-1.5 text-xs font-medium transition-all duration-200 group ${
                isActive('/contact') 
                  ? "text-blue-200 font-bold" 
                  : "text-white hover:text-blue-200"
              }`}
            >
              Kontak
              <span className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-300 to-blue-500 rounded-full transition-all duration-300 ease-out ${
                isActive('/contact') 
                  ? (shouldShowActiveUnderline() ? "w-full" : "w-0")
                  : (hoveredMenu === 'kontak' ? "w-full" : "w-0")
              }`}></span>
            </button>
          </div>


          {/* Right: Enhanced Auth Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden md:flex flex-col items-end text-white text-sm">
                  <p className="font-bold text-white drop-shadow-lg">{user.nama_lengkap}</p>
                </div>
                <button
                  onClick={() => navigate("/profile")}
                  className="w-11 h-11 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl border border-white/40 rounded-2xl flex items-center justify-center text-white hover:bg-white/25 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden"
                  title="Profil"
                >
                  {user.profile_image ? (
                    <img 
                      src={user.profile_image} 
                      alt="Profile" 
                      className="w-full h-full object-cover rounded-2xl" 
                    />
                  ) : (
                    <svg className="w-5 h-5 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-11 h-11 bg-gradient-to-br from-red-500/25 to-red-600/20 backdrop-blur-xl border border-red-400/50 rounded-2xl flex items-center justify-center text-red-300 hover:bg-red-500/35 hover:text-red-200 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                  title="Keluar"
                >
                  <svg className="w-5 h-5 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/register")}
                  className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-transparent backdrop-blur-sm border border-white/20 rounded-2xl text-white text-sm font-bold hover:bg-white/10 hover:scale-105 transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Daftar
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-transparent backdrop-blur-sm border border-white/20 rounded-2xl text-white text-sm font-bold hover:bg-white/10 hover:scale-105 transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Masuk
                </button>
              </>
            )}

            {/* Enhanced Mobile Menu Button - Transparent */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-11 h-11 bg-transparent backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center text-white hover:bg-white/10 hover:scale-105 transition-all duration-300 ml-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-white/20 py-3 space-y-1">
            {/* Menu Items */}
            <button
              onClick={() => {
                if (window.location.pathname === '/') {
                  const heroSection = document.getElementById('hero-section');
                  if (heroSection) {
                    heroSection.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    });
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                } else {
                  navigate("/");
                }
                setIsMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 text-sm font-medium rounded transition-all ${
                isActive('/')
                  ? "text-blue-200 font-bold bg-white/10 border-l-4 border-blue-400"
                  : "text-white hover:bg-white/10"
              }`}
            >
              Beranda
            </button>
            <button
              onClick={() => {
                scrollToSection("mobile-app-section");
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-white text-sm font-medium hover:bg-white/10 rounded transition-all"
            >
              Mobile App
            </button>
            <button
              onClick={() => {
                navigate("/events");
                setIsMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 text-sm font-medium rounded transition-all ${
                isActive('/events')
                  ? "text-blue-200 font-bold bg-white/10 border-l-4 border-blue-400"
                  : "text-white hover:bg-white/10"
              }`}
            >
              Event
            </button>
            <button
              onClick={() => {
                navigate("/about");
                setIsMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 text-sm font-medium rounded transition-all ${
                isActive('/about')
                  ? "text-blue-200 font-bold bg-white/10 border-l-4 border-blue-400"
                  : "text-white hover:bg-white/10"
              }`}
            >
              Tentang
            </button>
            <button
              onClick={() => {
                navigate("/contact");
                setIsMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 text-sm font-medium rounded transition-all ${
                isActive('/contact')
                  ? "text-blue-200 font-bold bg-white/10 border-l-4 border-blue-400"
                  : "text-white hover:bg-white/10"
              }`}
            >
              Kontak
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
