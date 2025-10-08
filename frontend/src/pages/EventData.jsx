import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AssistiveTouchNav from "../components/AssistiveTouchNav";
import Navbar from "../components/Navbar";
import { kegiatanService } from "../services/apiService";

export default function EventData() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await kegiatanService.getAll();
        if (response.data?.success) {
          setEvents(response.data.data || []);
        } else {
          setError("Gagal memuat data event");
        }
      } catch (e) {
        setError("Gagal memuat data event");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
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
        
        {/* Floating Transparent Bubbles - Gradient Theme */}
        <div className="absolute top-32 left-[15%] w-24 h-24 border-2 border-blue-400/50 rounded-full animate-float bg-gradient-to-br from-blue-200/20 to-indigo-300/15"></div>
        <div className="absolute top-64 right-[20%] w-32 h-32 border-2 border-purple-400/45 rounded-full animate-float bg-gradient-to-br from-purple-200/20 to-pink-300/15" style={{ animationDelay: '1.5s', animationDuration: '8s' }}></div>
        <div className="absolute bottom-40 left-[25%] w-20 h-20 border-2 border-cyan-400/50 rounded-full animate-float bg-gradient-to-br from-cyan-200/20 to-blue-300/15" style={{ animationDelay: '3s', animationDuration: '10s' }}></div>
        <div className="absolute top-[45%] left-[8%] w-16 h-16 border border-violet-400/60 rounded-full animate-float bg-gradient-to-br from-violet-200/25 to-purple-300/20" style={{ animationDelay: '2s', animationDuration: '9s' }}></div>
        
        {/* Additional Gradient Overlays */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-cyan-500/8 to-transparent pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-r from-indigo-500/6 to-transparent pointer-events-none"></div>
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
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
      `}</style>

      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#0A1931]">Semua Event</h1>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-[#F6FAFD]/90 backdrop-blur-xl text-[#0A1931] rounded-full shadow border border-white/20 hover:bg-[#F6FAFD] transition-all"
          >
            Kembali ke Beranda
          </button>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-xl border-2 border-[#4A7FA7]/20 overflow-hidden shadow animate-pulse">
                <div className="h-48 bg-[#4A7FA7]/20" />
                <div className="p-4">
                  <div className="h-4 bg-[#4A7FA7]/20 rounded mb-2" />
                  <div className="h-4 bg-[#4A7FA7]/20 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="text-center text-red-600 font-semibold">{error}</div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => navigate(`/event/${event.id}`)}
                className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-xl border-2 border-[#4A7FA7]/20 overflow-hidden shadow-lg cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all hover:border-[#4A7FA7] hover:ring-2 hover:ring-[#4A7FA7]/50"
              >
                <div className="relative h-48 bg-gradient-to-br from-[#1A3D63] via-[#4A7FA7] to-[#0A1931] overflow-hidden">
                  {event.flyer_kegiatan && (
                    <img
                      src={event.flyer_kegiatan}
                      alt={event.judul_kegiatan}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 bg-[#B3CFE5] text-[#0A1931] text-xs font-bold rounded-full shadow">Tersedia</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-xs text-[#4A7FA7] mb-1">
                    {event.kategori?.nama_kategori || "Event"}
                  </div>
                  <h3 className="text-lg font-bold text-[#0A1931] line-clamp-2 mb-2">
                    {event.judul_kegiatan}
                  </h3>
                  <div className="flex items-center gap-2 text-[#4A7FA7] text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{event.lokasi_kegiatan || "TBA"}</span>
                  </div>
                  <div className="mt-2 text-sm text-[#4A7FA7]">
                    {event.waktu_mulai ? new Date(event.waktu_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "Tanggal menyusul"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AssistiveTouchNav />
    </div>
  );
}
