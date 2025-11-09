import React from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import oceanBg from "../assets/ocean.jpg";

export default function AboutUs() {
  const navigate = useNavigate();

  const values = [
    {
      title: "Inovasi",
      description: "Terus berinovasi untuk menghadirkan solusi event terdepan yang memenuhi kebutuhan masa kini"
    },
    {
      title: "Kolaborasi",
      description: "Bekerja sama untuk menciptakan pengalaman event yang berkesan dan bermakna"
    },
    {
      title: "Keunggulan",
      description: "Berkomitmen memberikan kualitas terbaik dalam setiap layanan yang kami tawarkan"
    },
    {
      title: "Kreativitas",
      description: "Berpikir di luar kebiasaan untuk menjadikan setiap event unik dan tak terlupakan"
    }
  ];

  const stats = [
    { number: "10K+", label: "Event Terselenggara" },
    { number: "500K+", label: "Peserta Puas" },
    { number: "1000+", label: "Organisasi Mitra" },
    { number: "50+", label: "Kota Terjangkau" }
  ];

  return (
    <>
      {/* Animated Background - Matching Contact & HomePage */}
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
        @keyframes count-up {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.5);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-count-up {
          animation: count-up 0.8s ease-out forwards;
        }
        @keyframes pulse-scale {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        .animate-pulse-scale {
          animation: pulse-scale 2s ease-in-out infinite;
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
                Tentang DYNOTIX
              </h1>
              <p className="text-lg md:text-xl text-white/95 max-w-2xl mx-auto drop-shadow-lg">
                Platform event terdepan yang menghubungkan penyelenggara dan peserta dalam pengalaman yang tak terlupakan
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-2 border-[#4A7FA7]/20 hover:shadow-3xl hover:border-[#4A7FA7] transition-all duration-300 transform hover:scale-105 group">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[#0A1931] mb-4 text-center group-hover:text-[#4A7FA7] transition-colors">Misi Kami</h3>
              <p className="text-[#4A7FA7] leading-relaxed text-center">
              Menghadirkan solusi event digital yang efisien, inovatif, dan mudah digunakan, dengan sistem yang aman, stabil, 
              serta berorientasi pada kebutuhan pengguna untuk menciptakan pengalaman acara yang berkesan dan bermanfaat.
              </p>
            </div>

            <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-2 border-[#4A7FA7]/20 hover:shadow-3xl hover:border-[#4A7FA7] transition-all duration-300 transform hover:scale-105 group">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-[#1A3D63] to-[#0A1931] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[#0A1931] mb-4 text-center group-hover:text-[#4A7FA7] transition-colors">Visi Kami</h3>
              <p className="text-[#4A7FA7] leading-relaxed text-center">
                Menjadi platform penyedia solusi digital terpercaya di bidang event yang menghadirkan inovasi berkelanjutan, 
                serta berkontribusi dalam membangun ekosistem event modern yang adaptif terhadap perkembangan teknologi dan kebutuhan generasi digital masa kini.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-gradient-to-br from-[#1A3D63] via-[#4A7FA7] to-[#0A1931] rounded-3xl shadow-2xl p-12 mb-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-64 h-64 bg-[#B3CFE5] rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#4A7FA7] rounded-full blur-3xl"></div>
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white text-center mb-12 drop-shadow-lg">Pencapaian Kami</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <div 
                    key={index} 
                    className="text-center transform hover:scale-110 transition-all duration-300 animate-count-up"
                    style={{ animationDelay: `${index * 0.15}s` }}
                  >
                    <div className="text-5xl font-bold text-white mb-2 drop-shadow-lg animate-pulse-scale">{stat.number}</div>
                    <div className="text-[#B3CFE5] text-lg font-semibold">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Values Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-[#0A1931] mb-10">Nilai-Nilai Kami</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div 
                  key={index} 
                  className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-lg p-6 border-2 border-[#4A7FA7]/20 hover:shadow-2xl hover:border-[#4A7FA7] transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <h3 className="text-xl font-bold text-[#0A1931] mb-3 text-center group-hover:text-[#4A7FA7] transition-colors">{value.title}</h3>
                  <p className="text-sm text-[#4A7FA7] leading-relaxed text-center">{value.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-br from-[#F6FAFD]/95 via-[#B3CFE5]/30 to-[#F6FAFD]/95 backdrop-blur-xl rounded-3xl shadow-2xl p-12 text-center border-2 border-[#4A7FA7]/20">
            <h2 className="text-3xl font-bold text-[#0A1931] mb-4">Siap Memulai Perjalanan Anda?</h2>
            <p className="text-[#4A7FA7] mb-8 max-w-2xl mx-auto text-lg">
              Bergabunglah dengan ribuan penyelenggara dan peserta event yang telah mempercayai DYNOTIX
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => navigate("/events")}
                className="px-8 py-4 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 hover:from-[#1A3D63] hover:to-[#0A1931]"
              >
                Jelajahi Event
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="px-8 py-4 bg-white text-[#4A7FA7] font-bold rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-[#4A7FA7] hover:bg-[#4A7FA7] hover:text-white"
              >
                Hubungi Kami
              </button>
            </div>
          </div>
          </div>
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
                  <span>Jl. Contoh Alamat No. 123, Kota, Indonesia</span>
                </li>
                <li className="flex items-start gap-2 text-[#B3CFE5]/80 text-xs">
                  <svg className="w-4 h-4 text-[#4A7FA7] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>info@dynotix.com</span>
                </li>
                <li className="flex items-start gap-2 text-[#B3CFE5]/80 text-xs">
                  <svg className="w-4 h-4 text-[#4A7FA7] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>+62 812-3456-7890</span>
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
                <a href="#" className="w-10 h-10 bg-[#F6FAFD]/10 backdrop-blur-sm border border-[#4A7FA7]/30 rounded-lg flex items-center justify-center text-[#B3CFE5] hover:bg-[#4A7FA7] hover:text-white transition-all hover:scale-110 hover:shadow-lg group">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-[#F6FAFD]/10 backdrop-blur-sm border border-[#4A7FA7]/30 rounded-lg flex items-center justify-center text-[#B3CFE5] hover:bg-[#4A7FA7] hover:text-white transition-all hover:scale-110 hover:shadow-lg group">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-[#F6FAFD]/10 backdrop-blur-sm border border-[#4A7FA7]/30 rounded-lg flex items-center justify-center text-[#B3CFE5] hover:bg-[#4A7FA7] hover:text-white transition-all hover:scale-110 hover:shadow-lg group">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
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
