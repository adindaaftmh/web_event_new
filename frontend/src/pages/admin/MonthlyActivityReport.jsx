import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import {
  Calendar, TrendingUp, Users, Award, Activity, Download,
  Filter, ChevronDown, FileText, BarChart3, PieChartIcon,
  Eye, CheckCircle, XCircle, Clock, ArrowUp, ArrowDown
} from 'lucide-react';

const API_URL = "https://dynotix-production.up.railway.app/api";

export default function MonthlyActivityReport() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [chartType, setChartType] = useState('bar'); // bar, line, area, pie
  const [showFilters, setShowFilters] = useState(false);

  // Generate months and years for filter
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    fetchEvents();
  }, [selectedMonth, selectedYear]);

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

  // Filter events by selected month and year
  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.waktu_mulai);
    return eventDate.getMonth() === selectedMonth && eventDate.getFullYear() === selectedYear;
  });

  // Calculate statistics
  const stats = {
    total: filteredEvents.length,
    active: filteredEvents.filter(e => e.status === 'active' || e.status === 'ongoing').length,
    completed: filteredEvents.filter(e => e.status === 'completed').length,
    cancelled: filteredEvents.filter(e => e.status === 'cancelled').length,
    totalParticipants: filteredEvents.reduce((sum, e) => sum + (e.max_peserta || 0), 0),
    avgParticipants: filteredEvents.length > 0 
      ? Math.round(filteredEvents.reduce((sum, e) => sum + (e.max_peserta || 0), 0) / filteredEvents.length)
      : 0
  };

  // Group events by category
  const categoryData = filteredEvents.reduce((acc, event) => {
    const category = event.kategori_kegiatan?.nama || 'Lainnya';
    const existing = acc.find(item => item.name === category);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: category, value: 1 });
    }
    return acc;
  }, []);

  // Group events by week - with safety checks
  const weekData = Array.from({ length: 4 }, (_, i) => {
    const weekEvents = filteredEvents.filter(event => {
      if (!event.waktu_mulai) return false;
      try {
        const eventDate = new Date(event.waktu_mulai);
        if (isNaN(eventDate.getTime())) return false;
        const weekNumber = Math.floor((eventDate.getDate() - 1) / 7);
        return weekNumber === i;
      } catch (error) {
        return false;
      }
    });
    return {
      name: `Minggu ${i + 1}`,
      jumlah: weekEvents.length || 0,
      peserta: weekEvents.reduce((sum, e) => sum + (e.max_peserta || 0), 0) || 0
    };
  });

  // Colors for charts
  const COLORS = ['#4A7FA7', '#1A3D63', '#0A1931', '#6B9FC4', '#2E5C7F', '#15283E'];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (!percent || percent === 0) return null;
    
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Check if we have valid data for charts
  const hasWeekData = weekData && weekData.some(d => d.jumlah > 0);
  const hasCategoryData = categoryData && categoryData.length > 0;

  const handleExport = () => {
    // Prepare CSV data
    const csvData = [
      ['No', 'Nama Kegiatan', 'Kategori', 'Tanggal', 'Waktu', 'Lokasi', 'Peserta', 'Status'],
      ...filteredEvents.map((event, index) => [
        index + 1,
        event.nama_kegiatan,
        event.kategori_kegiatan?.nama || '-',
        new Date(event.waktu_mulai).toLocaleDateString('id-ID'),
        new Date(event.waktu_mulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        event.lokasi || '-',
        event.max_peserta || 0,
        event.status || '-'
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rekap-kegiatan-${months[selectedMonth]}-${selectedYear}.csv`;
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
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                Rekap Kegiatan Bulanan
              </h1>
              <p className="text-[#4A7FA7]">
                Laporan dan statistik kegiatan bulan {months[selectedMonth]} {selectedYear}
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0A1931] mb-2">Bulan</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 bg-white border-2 border-[#4A7FA7]/20 rounded-lg focus:border-[#4A7FA7] focus:outline-none transition-colors"
                  >
                    {months.map((month, index) => (
                      <option key={index} value={index}>{month}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0A1931] mb-2">Tahun</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 bg-white border-2 border-[#4A7FA7]/20 rounded-lg focus:border-[#4A7FA7] focus:outline-none transition-colors"
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0A1931] mb-2">Tipe Chart</label>
                  <select
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border-2 border-[#4A7FA7]/20 rounded-lg focus:border-[#4A7FA7] focus:outline-none transition-colors"
                  >
                    <option value="bar">Bar Chart</option>
                    <option value="line">Line Chart</option>
                    <option value="area">Area Chart</option>
                    <option value="pie">Pie Chart</option>
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
                <Calendar className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-white/80 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>Total</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-1">{stats.total}</h3>
            <p className="text-white/80 text-sm">Total Kegiatan</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-white/80 text-sm">
                <ArrowUp className="w-4 h-4" />
                <span>{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-1">{stats.completed}</h3>
            <p className="text-white/80 text-sm">Kegiatan Selesai</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-white/80 text-sm">
                <Activity className="w-4 h-4" />
                <span>Aktif</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-1">{stats.active}</h3>
            <p className="text-white/80 text-sm">Kegiatan Berlangsung</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-white/80 text-sm">
                <Award className="w-4 h-4" />
                <span>Rata-rata</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-1">{stats.avgParticipants}</h3>
            <p className="text-white/80 text-sm">Peserta/Kegiatan</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Main Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-[#4A7FA7]/10">
            <h3 className="text-xl font-bold text-[#0A1931] mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#4A7FA7]" />
              Kegiatan Per Minggu
            </h3>
            {!hasWeekData ? (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Tidak ada data untuk ditampilkan</p>
                </div>
              </div>
            ) : (
              <>
                {chartType === 'bar' && (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weekData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="name" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '2px solid #4A7FA7',
                          borderRadius: '8px'
                        }} 
                      />
                      <Legend />
                      <Bar dataKey="jumlah" fill="#4A7FA7" name="Jumlah Kegiatan" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
                
                {chartType === 'line' && (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={weekData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="name" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '2px solid #4A7FA7',
                          borderRadius: '8px'
                        }} 
                      />
                      <Legend />
                      <Line type="monotone" dataKey="jumlah" stroke="#4A7FA7" strokeWidth={3} name="Jumlah Kegiatan" />
                    </LineChart>
                  </ResponsiveContainer>
                )}

                {chartType === 'area' && (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={weekData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="name" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '2px solid #4A7FA7',
                          borderRadius: '8px'
                        }} 
                      />
                      <Legend />
                      <Area type="monotone" dataKey="jumlah" fill="#4A7FA7" stroke="#1A3D63" strokeWidth={2} name="Jumlah Kegiatan" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}

                {chartType === 'pie' && (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={weekData.filter(d => d.jumlah > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="jumlah"
                      >
                        {weekData.filter(d => d.jumlah > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </>
            )}
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-[#4A7FA7]/10">
            <h3 className="text-xl font-bold text-[#0A1931] mb-4 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-[#4A7FA7]" />
              Distribusi Kategori
            </h3>
            {!hasCategoryData ? (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                <div className="text-center">
                  <PieChartIcon className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Tidak ada data kategori</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-[#4A7FA7]/10">
          <div className="p-6 border-b-2 border-[#4A7FA7]/10">
            <h3 className="text-xl font-bold text-[#0A1931] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#4A7FA7]" />
              Daftar Kegiatan
            </h3>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Tidak ada kegiatan di bulan ini</p>
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
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Peserta</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEvents.map((event, index) => (
                    <tr key={event.id} className="hover:bg-[#4A7FA7]/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#0A1931]">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#0A1931] font-semibold">
                        {event.nama_kegiatan}
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
                        {event.lokasi || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#4A7FA7]">
                        {event.max_peserta || 0} orang
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          event.status === 'completed' 
                            ? 'bg-green-100 text-green-700' 
                            : event.status === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {event.status === 'completed' ? 'Selesai' : 
                           event.status === 'cancelled' ? 'Dibatalkan' : 'Aktif'}
                        </span>
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
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm mb-1">Total Peserta</p>
              <p className="text-3xl font-bold">{stats.totalParticipants}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm mb-1">Tingkat Penyelesaian</p>
              <p className="text-3xl font-bold">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </p>
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
