import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);

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

  return (
    <nav
      className={`fixed top-6 left-8 right-8 md:left-12 md:right-12 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#1A3D63]/80 backdrop-blur-2xl shadow-2xl"
          : "bg-[#1A3D63]/70 backdrop-blur-xl shadow-xl"
      } border border-white/20 rounded-2xl`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section: Logo Only */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/30 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <span className="text-white font-bold text-xl">DYNOTIX</span>
          </div>

          {/* Center-Left: Navigation Menu - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => navigate("/events")}
              className="text-white font-medium hover:text-blue-200 transition-all relative group"
            >
              Event
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
            </button>
            <button
              onClick={() => navigate("/attractions")}
              className="text-white font-medium hover:text-blue-200 transition-all relative group"
            >
              Atraksi
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
            </button>
          </div>

          {/* Center: Search Bar - Hidden on mobile */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Cari disini"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white rounded-full text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all shadow-md"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Right: Auth Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden md:block text-white text-sm">
                  <p className="font-semibold">{user.nama_lengkap}</p>
                </div>
                <button
                  onClick={() => navigate("/profile")}
                  className="w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
                  title="Profil"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 sm:px-6 py-2 bg-white/10 backdrop-blur-sm border border-white/30 rounded-full text-white text-sm font-semibold hover:bg-white/20 transition-all"
                >
                  Keluar
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/register")}
                  className="hidden sm:block px-6 py-2 bg-[#4A7FA7] rounded-full text-white text-sm font-semibold hover:bg-[#4A7FA7]/80 transition-all shadow-md"
                >
                  Daftar
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 sm:px-6 py-2 bg-[#0A1931] rounded-full text-white text-sm font-bold hover:bg-[#0A1931]/80 transition-all shadow-lg hover:shadow-xl"
                >
                  Masuk
                </button>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center text-white"
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

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 py-4 space-y-4">
            {/* Search Bar Mobile */}
            <div className="relative">
              <input
                type="text"
                placeholder="Cari disini"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white rounded-full text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-md"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Menu Items */}
            <button
              onClick={() => {
                navigate("/events");
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-white font-medium hover:bg-white/10 rounded-lg transition-all"
            >
              Event
            </button>
            <button
              onClick={() => {
                navigate("/attractions");
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-white font-medium hover:bg-white/10 rounded-lg transition-all"
            >
              Atraksi
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
