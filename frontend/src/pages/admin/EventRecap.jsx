import React, { useState, useMemo } from "react";
import AdminLayout from "../../components/AdminLayout";
import { useEvents } from "../../contexts/EventContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function EventRecap() {
  const { events } = useEvents();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Calculate event statistics
  const stats = useMemo(() => {
    const filteredEvents = events.filter(event => {
      const eventDate = new Date(event.waktu_mulai);
      return eventDate.getMonth() + 1 === selectedMonth && eventDate.getFullYear() === selectedYear;
    });

    const totalEvents = filteredEvents.length;
    const completedEvents = filteredEvents.filter(e => new Date(e.waktu_mulai) < new Date()).length;
    const upcomingEvents = filteredEvents.filter(e => new Date(e.waktu_mulai) >= new Date()).length;

    // Category statistics
    const categoryStats = filteredEvents.reduce((acc, event) => {
      const category = event.kategori?.nama_kategori || 'Tidak ada kategori';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    // Monthly trend data
    const monthlyTrend = [];
    for (let i = 1; i <= 12; i++) {
      const monthEvents = events.filter(event => {
        const eventDate = new Date(event.waktu_mulai);
        return eventDate.getMonth() + 1 === i && eventDate.getFullYear() === selectedYear;
      });
      monthlyTrend.push({
        month: new Date(selectedYear, i - 1).toLocaleDateString('id-ID', { month: 'short' }),
        events: monthEvents.length
      });
    }

    return {
      totalEvents,
      completedEvents,
      upcomingEvents,
      categoryStats,
      monthlyTrend,
      filteredEvents
    };
  }, [events, selectedMonth, selectedYear]);

  const exportRecap = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "ID,Judul Kegiatan,Lokasi,Tanggal,Waktu,Kategori,Kapasitas,Harga,Status\n"
      + stats.filteredEvents.map(e => `${e.id},"${e.judul_kegiatan}",${e.lokasi_kegiatan},${new Date(e.waktu_mulai).toLocaleDateString()},${new Date(e.waktu_mulai).toLocaleTimeString()},${e.kategori?.nama_kategori || ''},${e.kapasitas_peserta || ''},${e.harga_tiket || ''},${new Date(e.waktu_mulai) < new Date() ? 'Selesai' : 'Akan Datang'}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rekap_kegiatan_${selectedMonth}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Colors for charts
  const COLORS = ['#4A7FA7', '#1A3D63', '#B3CFE5', '#0A1931', '#F6FAFD'];

  return (
    <AdminLayout>
      <div className="min-h-screen relative bg-gradient-to-br from-slate-100 via-blue-50/30 to-indigo-100/40 overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-blue-400/25 to-indigo-500/20 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-10 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/20 to-pink-500/15 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/3 w-[450px] h-[450px] bg-gradient-to-br from-cyan-400/20 to-blue-500/15 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-32 left-[15%] w-24 h-24 border-2 border-blue-400/50 rounded-full animate-float bg-gradient-to-br from-blue-200/20 to-indigo-300/15"></div>
        </div>

        <div className="relative z-10 space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[#0A1931] mb-2">Rekap Kegiatan</h1>
              <p className="text-[#4A7FA7] text-sm lg:text-base">Statistik dan analisis kegiatan per bulan</p>
              <div className="h-1 w-32 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
          <button
            onClick={exportRecap}
            className="px-6 py-3 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-semibold rounded-xl hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Data
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#0A1931] mb-2">Tahun</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors"
              >
                {Array.from({ length: 5 }, (_, i) => selectedYear - 2 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0A1931] mb-2">Bulan</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>
                    {new Date(selectedYear, month - 1).toLocaleDateString('id-ID', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <div className="w-full text-center p-4 bg-[#4A7FA7]/10 rounded-lg border border-[#4A7FA7]/30">
                <p className="text-sm text-[#4A7FA7] mb-1">Total Kegiatan Bulan Ini</p>
                <p className="text-2xl font-bold text-[#0A1931]">{stats.totalEvents}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#4A7FA7] text-sm font-semibold mb-1">Total Kegiatan</p>
                <h3 className="text-3xl font-bold text-[#0A1931] mb-2">{stats.totalEvents}</h3>
                <p className="text-green-600 text-sm font-semibold">Bulan ini</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-xl flex items-center justify-center text-white shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#4A7FA7] text-sm font-semibold mb-1">Kegiatan Selesai</p>
                <h3 className="text-3xl font-bold text-[#0A1931] mb-2">{stats.completedEvents}</h3>
                <p className="text-green-600 text-sm font-semibold">Sudah berlangsung</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#4A7FA7] text-sm font-semibold mb-1">Kegiatan Akan Datang</p>
                <h3 className="text-3xl font-bold text-[#0A1931] mb-2">{stats.upcomingEvents}</h3>
                <p className="text-blue-600 text-sm font-semibold">Belum berlangsung</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Trend Chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#0A1931]">Trend Kegiatan {selectedYear}</h2>
              <p className="text-[#4A7FA7] text-sm mt-1">Jumlah kegiatan per bulan</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="events" fill="#4A7FA7" name="Jumlah Kegiatan" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution Chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#0A1931]">Distribusi Kategori</h2>
              <p className="text-[#4A7FA7] text-sm mt-1">Kegiatan berdasarkan kategori</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(stats.categoryStats).map(([category, count], index) => ({
                    name: category,
                    value: count,
                    fill: COLORS[index % COLORS.length]
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(stats.categoryStats).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Event List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-[#0A1931]">Detail Kegiatan Bulan {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0A1931] uppercase tracking-wider">Judul</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0A1931] uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0A1931] uppercase tracking-wider">Lokasi</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0A1931] uppercase tracking-wider">Kategori</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0A1931] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0A1931] uppercase tracking-wider">Kapasitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-[#4A7FA7]">
                      Tidak ada kegiatan pada bulan ini
                    </td>
                  </tr>
                ) : (
                  stats.filteredEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50 transition-all duration-300">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-[#0A1931]">{event.judul_kegiatan}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900">
                          {new Date(event.waktu_mulai).toLocaleDateString('id-ID')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900 font-medium">{event.lokasi_kegiatan}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-[#4A7FA7]/10 text-[#0A1931] rounded-full text-sm font-semibold border border-[#4A7FA7]/30">
                          {event.kategori?.nama_kategori || 'Tidak ada kategori'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          new Date(event.waktu_mulai) < new Date()
                            ? 'bg-gray-100 text-gray-700 border border-gray-200'
                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}>
                          {new Date(event.waktu_mulai) < new Date() ? 'Selesai' : 'Akan Datang'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900 font-medium">
                          {event.kapasitas_peserta ? `${event.kapasitas_peserta} orang` : 'Tidak terbatas'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>
    </AdminLayout>
  );
}
