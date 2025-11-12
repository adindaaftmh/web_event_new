import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Users, TrendingUp, UserCheck, Activity, Download,
  Filter, ChevronDown, FileText
} from 'lucide-react';

const API_URL = "https://dynotix-production.up.railway.app/api";

export default function EventParticipantRecap() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
      const response = await axios.get(`${API_URL}/kegiatan`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setEvents(Array.isArray(response.data) ? response.data : response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter events
  const filteredEvents = selectedEvent === 'all' 
    ? events 
    : events.filter(e => e.id === parseInt(selectedEvent));

  // Calculate statistics
  const stats = {
    totalEvents: filteredEvents.length,
    totalParticipants: filteredEvents.reduce((sum, e) => sum + (e.max_peserta || 0), 0),
    avgParticipants: filteredEvents.length > 0 
      ? Math.round(filteredEvents.reduce((sum, e) => sum + (e.max_peserta || 0), 0) / filteredEvents.length)
      : 0,
    maxCapacity: Math.max(...filteredEvents.map(e => e.max_peserta || 0), 0)
  };

  // Prepare chart data
  const chartData = filteredEvents.map(event => ({
    name: event.nama_kegiatan?.substring(0, 20) || event.judul_kegiatan?.substring(0, 20) || 'Event',
    peserta: event.max_peserta || 0,
    kategori: event.kategori_kegiatan?.nama || 'Lainnya'
  })).slice(0, 10);

  const COLORS = ['#4A7FA7', '#1A3D63', '#0A1931', '#6B9FC4', '#2E5C7F', '#15283E'];

  const handleExport = () => {
    const csvData = [
      ['No', 'Nama Kegiatan', 'Kategori', 'Jumlah Peserta', 'Tanggal', 'Lokasi'],
      ...filteredEvents.map((event, index) => [
        index + 1,
        event.nama_kegiatan || event.judul_kegiatan,
        event.kategori_kegiatan?.nama || '-',
        event.max_peserta || 0,
        new Date(event.waktu_mulai).toLocaleDateString('id-ID'),
        event.lokasi || event.lokasi_kegiatan || '-'
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rekap-peserta-kegiatan-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A7FA7]"></div>
        </div>
      </AdminLayout>
    );
  }

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
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#0A1931] mb-2 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                Rekap Peserta per Kegiatan
              </h1>
              <p className="text-[#4A7FA7]">
                Laporan dan statistik peserta setiap kegiatan
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-[#4A7FA7] text-[#4A7FA7] rounded-xl hover:bg-[#4A7FA7] hover:text-white transition-all duration-300 font-semibold"
              >
                <Filter className="w-4 h-4" />
                Filter
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white rounded-xl border-2 border-[#4A7FA7]/20 animate-fade-in">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0A1931] mb-2">Pilih Kegiatan</label>
                  <select
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border-2 border-[#4A7FA7]/20 rounded-lg focus:border-[#4A7FA7] focus:outline-none transition-colors"
                  >
                    <option value="all">Semua Kegiatan</option>
                    {events.map(event => (
                      <option key={event.id} value={event.id}>
                        {event.nama_kegiatan || event.judul_kegiatan}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex items-center gap-1 text-white/80 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>Total</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-1">{stats.totalEvents}</h3>
            <p className="text-white/80 text-sm">Total Kegiatan</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-white/80 text-sm">
                <Activity className="w-4 h-4" />
                <span>Peserta</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-1">{stats.totalParticipants}</h3>
            <p className="text-white/80 text-sm">Total Peserta</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-white/80 text-sm">
                <Activity className="w-4 h-4" />
                <span>Rata-rata</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-1">{stats.avgParticipants}</h3>
            <p className="text-white/80 text-sm">Rata-rata Peserta</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-white/80 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>Maksimal</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-1">{stats.maxCapacity}</h3>
            <p className="text-white/80 text-sm">Kapasitas Terbesar</p>
          </div>
        </div>

        {/* Chart Section - Pie Chart Only */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-[#4A7FA7]/10">
          <h3 className="text-xl font-bold text-[#0A1931] mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#4A7FA7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            Distribusi Peserta per Kegiatan
          </h3>
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-[500px] text-gray-400">
              <div className="text-center">
                <Users className="w-16 h-16 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Tidak ada data untuk ditampilkan</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={500}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent, peserta }) => `${name.substring(0, 20)}: ${peserta} (${(percent * 100).toFixed(1)}%)`}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="peserta"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '2px solid #4A7FA7',
                    borderRadius: '8px',
                    padding: '10px'
                  }}
                  formatter={(value, name, props) => [
                    `${value} peserta`,
                    props.payload.name
                  ]}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => `${entry.payload.name}: ${entry.payload.peserta} peserta`}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Events Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-[#4A7FA7]/10">
          <div className="p-6 border-b-2 border-[#4A7FA7]/10">
            <h3 className="text-xl font-bold text-[#0A1931] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#4A7FA7]" />
              Daftar Kegiatan dan Peserta
            </h3>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Tidak ada data kegiatan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">No</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Nama Kegiatan</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Kategori</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Lokasi</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Jumlah Peserta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEvents.map((event, index) => (
                    <tr key={event.id} className="hover:bg-[#4A7FA7]/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#0A1931]">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#0A1931] font-semibold">
                        {event.nama_kegiatan || event.judul_kegiatan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-[#4A7FA7]/10 text-[#4A7FA7] text-xs font-semibold rounded-full">
                          {event.kategori_kegiatan?.nama || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(event.waktu_mulai).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {event.lokasi || event.lokasi_kegiatan || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#4A7FA7]">
                        {event.max_peserta || 0} orang
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Footer */}
        <div className="mt-6 p-6 bg-gradient-to-r from-[#0A1931] to-[#1A3D63] rounded-xl text-white">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-white/70 text-sm mb-1">Total Kegiatan</p>
              <p className="text-3xl font-bold">{stats.totalEvents}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm mb-1">Total Peserta</p>
              <p className="text-3xl font-bold">{stats.totalParticipants}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm mb-1">Rata-rata Peserta</p>
              <p className="text-3xl font-bold">{stats.avgParticipants}</p>
            </div>
          </div>
        </div>

        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </AdminLayout>
  );
}
