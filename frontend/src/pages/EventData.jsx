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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-violet-50/40">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Semua Event</h1>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-white text-gray-800 rounded-full shadow border border-gray-200 hover:bg-gray-50"
          >
            Kembali ke Beranda
          </button>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
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
                className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-lg cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="relative h-48 bg-gradient-to-br from-purple-400 via-violet-500 to-indigo-600 overflow-hidden">
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
                    <span className="px-3 py-1 bg-lime-400 text-gray-900 text-xs font-bold rounded-full shadow">Tersedia</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-xs text-gray-500 mb-1">
                    {event.kategori?.nama_kategori || "Event"}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-2">
                    {event.judul_kegiatan}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{event.lokasi_kegiatan || "TBA"}</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
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
