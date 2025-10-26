import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import oceanBg from "../assets/ocean.jpg";

export default function AboutUs() {
  const navigate = useNavigate();

  const teamMembers = [
    {
      name: "Adinda Aftmh",
      role: "CEO & Founder",
      image: null,
      description: "Visionary leader with 10+ years experience in event management"
    },
    {
      name: "Sarah Wilson",
      role: "CTO",
      image: null,
      description: "Tech innovator passionate about creating seamless experiences"
    },
    {
      name: "Michael Chen",
      role: "Head of Operations",
      image: null,
      description: "Expert in logistics and event coordination"
    },
    {
      name: "Emily Rodriguez",
      role: "Marketing Director",
      image: null,
      description: "Creative strategist driving brand growth"
    }
  ];

  const values = [
    {
      title: "Innovation",
      description: "Constantly pushing boundaries to deliver cutting-edge event solutions"
    },
    {
      title: "Collaboration",
      description: "Working together to create memorable experiences"
    },
    {
      title: "Excellence",
      description: "Committed to delivering the highest quality in everything we do"
    },
    {
      title: "Creativity",
      description: "Thinking outside the box to make every event unique"
    }
  ];

  const stats = [
    { number: "10K+", label: "Events Hosted" },
    { number: "500K+", label: "Happy Participants" },
    { number: "1000+", label: "Partner Organizations" },
    { number: "50+", label: "Cities Covered" }
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
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/40 hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Misi Kami</h3>
              <p className="text-gray-600 leading-relaxed">
                Memberdayakan komunitas dengan menyediakan platform yang inovatif dan mudah digunakan untuk menemukan, 
                mengorganisir, dan berpartisipasi dalam berbagai event yang menginspirasi dan membangun koneksi bermakna.
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/40 hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Visi Kami</h3>
              <p className="text-gray-600 leading-relaxed">
                Menjadi platform event terkemuka di Indonesia yang menghubungkan jutaan orang dengan 
                pengalaman yang mengubah hidup, menciptakan komunitas yang solid, dan membangun ekosistem event yang berkelanjutan.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-12 mb-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white text-center mb-12">Pencapaian Kami</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-5xl font-bold text-white mb-2">{stat.number}</div>
                    <div className="text-white/80 text-lg">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Values Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Nilai-Nilai Kami</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div key={index} className="bg-white/90 backdrop-blur-xl rounded-xl shadow-lg p-5 border border-white/40 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{value.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">Tim Kami</h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Bertemu dengan orang-orang luar biasa di balik DYNOTIX yang berdedikasi untuk membuat setiap event Anda sukses
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="h-48 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 flex items-center justify-center">
                    {member.image ? (
                      <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/40">
                        <span className="text-4xl font-bold text-white">{member.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{member.name}</h3>
                    <p className="text-indigo-600 font-semibold mb-3">{member.role}</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{member.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-white/95 via-blue-50/90 to-indigo-50/95 backdrop-blur-xl rounded-3xl shadow-2xl p-12 text-center border border-white/40">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Siap Memulai Perjalanan Anda?</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Bergabunglah dengan ribuan penyelenggara dan peserta event yang telah mempercayai DYNOTIX
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => navigate("/events")}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Jelajahi Event
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="px-8 py-4 bg-white text-blue-600 font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-blue-600"
              >
                Hubungi Kami
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
