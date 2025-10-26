import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import oceanBg from "../assets/ocean.jpg";

export default function About() {
  const navigate = useNavigate();

  const teamMembers = [
    {
      id: 1,
      name: "Adinda Fatimah",
      role: "CEO & Founder",
      description: "Visioner di balik platform DYNOTIX dengan pengalaman 10+ tahun di industri teknologi.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400"
    },
    {
      id: 2,
      name: "Budi Santoso",
      role: "CTO",
      description: "Expert dalam pengembangan teknologi dan arsitektur sistem yang scalable.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400"
    },
    {
      id: 3,
      name: "Sari Dewi",
      role: "Head of Marketing",
      description: "Spesialis dalam strategi pemasaran digital dan community building.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400"
    }
  ];

  const features = [
    {
      icon: "🎯",
      title: "Misi Kami",
      description: "Menghubungkan orang-orang melalui pengalaman event yang tak terlupakan dan bermakna."
    },
    {
      icon: "👥",
      title: "Komunitas",
      description: "Membangun komunitas yang solid dan saling mendukung dalam setiap kegiatan."
    },
    {
      icon: "🚀",
      title: "Inovasi",
      description: "Terus berinovasi dalam teknologi untuk memberikan pengalaman terbaik."
    },
    {
      icon: "🌟",
      title: "Kualitas",
      description: "Berkomitmen memberikan layanan berkualitas tinggi untuk setiap event."
    }
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

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {features.map((feature, index) => (
                <div key={index} className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-white/60 p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  <div className="text-center">
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Team Section */}
            <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-white/60 p-12 overflow-hidden">
              <div className="relative z-10">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-gray-800 mb-4">
                    Tim Kami
                  </h2>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Bertemu dengan orang-orang hebat di balik kesuksesan DYNOTIX
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-white/60 hover:bg-white/95 transition-all duration-300 text-center group shadow-lg">
                      <div className="relative mb-6">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-24 h-24 rounded-full mx-auto object-cover shadow-xl group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute -inset-1 bg-[#1A3D63] rounded-full blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{member.name}</h3>
                      <p className="text-[#1A3D63] font-semibold mb-3">{member.role}</p>
                      <p className="text-gray-600 leading-relaxed">{member.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Back Button */}
            <div className="text-center mt-12">
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#1A3D63] text-white rounded-xl font-bold hover:bg-[#0F2942] transition-all shadow-lg hover:shadow-xl hover:scale-105 duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kembali ke Beranda
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
