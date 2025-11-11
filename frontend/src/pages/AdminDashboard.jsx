import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AdminLayout from "../components/AdminLayout";
import { useEvents } from "../contexts/EventContext";
import apiClient from "../config/api";

export default function AdminDashboard() {
  const { events, loading, error } = useEvents();
  const [dashboardData, setDashboardData] = useState({
    monthlyStats: [],
    topEvents: [],
    recentActivity: [],
    totalEvents: 0,
    totalParticipants: 0,
    activeEvents: 0,
    totalRevenue: 0,
    adminIncome: 0,
    organizerIncome: 0
  });
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    fetchParticipants();
  }, []);

  useEffect(() => {
    if (events.length > 0 && participants.length >= 0) {
      calculateDashboardStats();
    }
  }, [events, participants]);

  const fetchParticipants = async () => {
    try {
      const response = await apiClient.get('/daftar-hadir');
      setParticipants(response.data.data || []);
    } catch (error) {
      console.error('Error fetching participants:', error);
      setParticipants([]);
    }
  };

  // Helper function: Format rupiah dengan format lengkap (angka penuh)
  const formatCompactRupiah = (value) => {
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  const exportDashboardData = () => {
    const csvRows = [];
    
    // ===== SECTION 1: RINGKASAN STATISTIK =====
    csvRows.push('===== RINGKASAN STATISTIK DASHBOARD =====');
    csvRows.push('Tanggal Export,' + new Date().toLocaleString('id-ID'));
    csvRows.push('');
    
    csvRows.push('Metrik,Nilai');
    csvRows.push('Total Events,' + dashboardData.totalEvents);
    csvRows.push('Total Participants,' + dashboardData.totalParticipants);
    csvRows.push('Active Events,' + dashboardData.activeEvents);
    csvRows.push('Total Revenue,Rp ' + dashboardData.totalRevenue.toLocaleString('id-ID'));
    csvRows.push('Pendapatan Admin (10%),Rp ' + dashboardData.adminIncome.toLocaleString('id-ID'));
    csvRows.push('Pendapatan Panitia (90%),Rp ' + dashboardData.organizerIncome.toLocaleString('id-ID'));
    csvRows.push('');
    csvRows.push('');
    
    // ===== SECTION 2: STATISTIK BULANAN =====
    csvRows.push('===== STATISTIK PER BULAN (2025) =====');
    csvRows.push('Bulan,Jumlah Event,Jumlah Peserta,Total Pendapatan,Pendapatan Admin (10%),Pendapatan Panitia (90%)');
    
    dashboardData.monthlyStats.forEach((stat) => {
      // Calculate revenue for this month
      const monthParticipants = participants.filter(participant => {
        if (!participant.created_at) return false;
        const registrationDate = new Date(participant.created_at);
        const monthIndex = dashboardData.monthlyStats.findIndex(s => s.month === stat.month);
        return registrationDate.getMonth() === monthIndex && registrationDate.getFullYear() === 2025;
      });
      
      const monthRevenue = monthParticipants.reduce((sum, p) => {
        const harga = parseFloat(p.total_harga) || 0;
        return sum + harga;
      }, 0);
      
      const monthAdminIncome = monthRevenue * 0.1;
      const monthOrganizerIncome = monthRevenue * 0.9;

      csvRows.push([
        stat.month,
        stat.events,
        stat.participants,
        'Rp ' + monthRevenue.toLocaleString('id-ID'),
        'Rp ' + monthAdminIncome.toLocaleString('id-ID'),
        'Rp ' + monthOrganizerIncome.toLocaleString('id-ID')
      ].join(','));
    });
    
    csvRows.push('');
    csvRows.push('TOTAL,' + dashboardData.totalEvents + ',' + dashboardData.totalParticipants + 
                ',Rp ' + dashboardData.totalRevenue.toLocaleString('id-ID') + 
                ',Rp ' + dashboardData.adminIncome.toLocaleString('id-ID') + 
                ',Rp ' + dashboardData.organizerIncome.toLocaleString('id-ID'));
    csvRows.push('');
    csvRows.push('');
    
    // ===== SECTION 3: TOP 10 EVENTS =====
    csvRows.push('===== TOP 10 EVENT DENGAN PESERTA TERBANYAK =====');
    csvRows.push('Ranking,Nama Event,Jumlah Peserta');
    
    dashboardData.topEvents.forEach((event, index) => {
      let rankDisplay = (index + 1).toString();
      if (index === 0) rankDisplay = '1 (Gold)';
      else if (index === 1) rankDisplay = '2 (Silver)';
      else if (index === 2) rankDisplay = '3 (Bronze)';
      
      csvRows.push([
        rankDisplay,
        '"' + event.name.replace(/"/g, '""') + '"', // Escape quotes in event name
        event.participants
      ].join(','));
    });
    
    csvRows.push('');
    csvRows.push('');
    
    // ===== SECTION 4: RECENT ACTIVITY =====
    csvRows.push('===== AKTIVITAS TERBARU =====');
    csvRows.push('Aktivitas,Event,Waktu');
    
    dashboardData.recentActivity.forEach((activity) => {
      csvRows.push([
        '"' + activity.action.replace(/"/g, '""') + '"',
        '"' + activity.event.replace(/"/g, '""') + '"',
        activity.time
      ].join(','));
    });
    
    csvRows.push('');
    csvRows.push('');
    csvRows.push('===== END OF REPORT =====');

    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    const filename = `dashboard_complete_report_${dateStr}_${timeStr}.csv`;
    
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const calculateDashboardStats = () => {
    // Calculate total stats from real data
    const totalEvents = events.length;
    const totalParticipants = participants.length; // Real participant count from database
    const activeEvents = events.filter(event => new Date(event.waktu_selesai || event.waktu_mulai) > new Date()).length;
    
    // Calculate revenue based on actual participants with total_harga (matching ListParticipants page)
    const registeredParticipants = participants.filter(p => {
      // Include all participants that have total_harga (either > 0 or = 0 for free tickets)
      return p.total_harga !== null && p.total_harga !== undefined;
    });
    
    const totalRevenue = registeredParticipants.reduce((sum, p) => {
      const harga = parseFloat(p.total_harga) || 0;
      return sum + harga;
    }, 0);
    
    // Calculate admin income (10% commission)
    const adminIncome = totalRevenue * 0.1;
    
    // Calculate organizer income (90%)
    const organizerIncome = totalRevenue * 0.9;

    // Generate monthly stats from real data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    // Gunakan tahun 2025 untuk data yang sudah di-seed
    const targetYear = 2025;
    
    const monthlyStats = months.map((month, index) => {
      // Filter events berdasarkan waktu_mulai
      const monthEvents = events.filter(event => {
        const eventDate = new Date(event.waktu_mulai);
        return eventDate.getMonth() === index && eventDate.getFullYear() === targetYear;
      });

      // PERBAIKAN: Filter participants berdasarkan created_at (tanggal pendaftaran), BUKAN event.waktu_mulai
      const monthParticipants = participants.filter(participant => {
        if (!participant.created_at) return false;
        const registrationDate = new Date(participant.created_at);
        return registrationDate.getMonth() === index && registrationDate.getFullYear() === targetYear;
      });

      return {
        month,
        events: monthEvents.length,
        participants: monthParticipants.length
      };
    });

    // Get top events by real participant count
    const eventParticipantCounts = events.map(event => {
      const count = participants.filter(p => p.kegiatan_id === event.id).length;
      return {
        name: event.judul_kegiatan,
        participants: count
      };
    });

    const topEvents = eventParticipantCounts
      .sort((a, b) => b.participants - a.participants)
      .slice(0, 10);

    // Generate recent activity from real events and participants
    const sortedEvents = [...events]
      .sort((a, b) => new Date(b.created_at || b.waktu_mulai) - new Date(a.created_at || a.waktu_mulai))
      .slice(0, 4);

    const recentActivity = sortedEvents.map((event) => {
      const participantCount = participants.filter(p => p.kegiatan_id === event.id).length;
      const eventDate = new Date(event.created_at || event.waktu_mulai);
      const now = new Date();
      const diffMs = now - eventDate;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      let timeAgo;
      if (diffDays > 0) {
        timeAgo = `${diffDays} hari lalu`;
      } else if (diffHours > 0) {
        timeAgo = `${diffHours} jam lalu`;
      } else {
        timeAgo = 'Baru saja';
      }

      return {
        action: participantCount > 0 ? `${participantCount} peserta terdaftar` : "Event baru ditambahkan",
        event: event.judul_kegiatan,
        time: timeAgo,
        type: participantCount > 50 ? 'register' : 'create'
      };
    });

    setDashboardData({
      monthlyStats,
      topEvents,
      recentActivity,
      totalEvents,
      totalParticipants,
      activeEvents,
      totalRevenue,
      adminIncome,
      organizerIncome
    });
  };

  const stats = [
    {
      id: 1,
      title: "Total Events",
      value: dashboardData.totalEvents.toString(),
      change: "+12.5%",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: "from-[#4A7FA7] to-[#1A3D63]"
    },
    {
      id: 2,
      title: "Total Participants",
      value: dashboardData.totalParticipants.toLocaleString(),
      change: "+8.3%",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: "from-[#0A1931] to-[#4A7FA7]"
    },
    {
      id: 3,
      title: "Active Events",
      value: dashboardData.activeEvents.toString(),
      change: "+5.2%",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "from-[#B3CFE5] to-[#4A7FA7]"
    },
    {
      id: 4,
      title: "Total Revenue",
      value: formatCompactRupiah(dashboardData.totalRevenue),
      change: "+15.8%",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "from-[#4A7FA7] to-[#0A1931]"
    },
    {
      id: 5,
      title: "Pendapatan Admin",
      value: formatCompactRupiah(dashboardData.adminIncome),
      change: "+15.8%",
      subtitle: "Komisi 10%",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: "from-green-500 to-green-600"
    },
    {
      id: 6,
      title: "Pendapatan Panitia",
      value: formatCompactRupiah(dashboardData.organizerIncome),
      change: "+15.8%",
      subtitle: "Total 90%",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: "from-blue-500 to-blue-600"
    }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A7FA7] mx-auto mb-4"></div>
            <p className="text-[#4A7FA7]">Memuat dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600">Error: {error}</p>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-[#0A1931] mb-2">Admin Dashboard</h1>
            <p className="text-[#4A7FA7] text-sm lg:text-base">Overview statistik dan analisis event</p>
            <div className="h-1 w-32 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] rounded-full mt-2 animate-pulse"></div>
          </div>
          <button
            onClick={exportDashboardData}
            className="px-6 py-3 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-semibold rounded-xl hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat) => {
            // Check if this is a revenue card (has "Rp" in value)
            const isRevenueCard = stat.value.includes('Rp');
            
            return (
              <div key={stat.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 group hover:scale-105 h-full">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1 pr-4">
                      <p className="text-[#4A7FA7] text-sm font-semibold">{stat.title}</p>
                      {stat.subtitle && (
                        <p className="text-xs text-gray-500 font-medium">{stat.subtitle}</p>
                      )}
                      {/* Font kecil hanya untuk card revenue, card lainnya tetap besar */}
                      <h3 className={`${
                        isRevenueCard 
                          ? 'text-sm lg:text-base' 
                          : 'text-xl lg:text-2xl'
                      } font-bold text-[#0A1931] break-words`}>
                        {stat.value}
                      </h3>
                      <p className="text-green-600 text-xs font-semibold">{stat.change}</p>
                    </div>
                    <div className={`w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Monthly Events Chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:p-8 h-full">
            <div className="mb-6">
              <h2 className="text-lg lg:text-xl font-semibold text-[#0A1931]">Jumlah Kegiatan Per Bulan</h2>
              <p className="text-gray-600 text-sm mt-1">Statistik kegiatan bulanan tahun 2025</p>
            </div>
            <div className="mt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData.monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4A7FA7/20" />
                  <XAxis dataKey="month" tick={{ fill: '#4A7FA7', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#4A7FA7', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#F6FAFD',
                      border: '2px solid #4A7FA7/20',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="events" fill="#4A7FA7" name="Jumlah Event" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Participants Chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:p-8 h-full">
            <div className="mb-6">
              <h2 className="text-lg lg:text-xl font-semibold text-[#0A1931]">Jumlah Peserta Per Bulan</h2>
              <p className="text-gray-600 text-sm mt-1">Total peserta yang hadir setiap bulan</p>
            </div>
            <div className="mt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData.monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4A7FA7/20" />
                  <XAxis dataKey="month" tick={{ fill: '#4A7FA7', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#4A7FA7', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#F6FAFD',
                      border: '2px solid #4A7FA7/20',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="participants" fill="#0A1931" name="Jumlah Peserta" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top 10 Events Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:p-8">
          <div className="mb-6">
            <h2 className="text-lg lg:text-xl font-semibold text-[#0A1931] flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              10 Event dengan Peserta Terbanyak
            </h2>
            <p className="text-gray-600 text-sm mt-2 ml-13">Ranking event berdasarkan jumlah peserta terdaftar</p>
          </div>
          
          {/* Chart */}
          <div className="mt-6 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-xl p-6">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={dashboardData.topEvents} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <defs>
                  <linearGradient id="colorParticipants" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4A7FA7" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#1A3D63" stopOpacity={0.7}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#4A7FA7" opacity={0.2} />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  interval={0}
                  tick={{ fill: '#4A7FA7', fontSize: 10 }}
                  tickFormatter={(value) => value.length > 20 ? value.substring(0, 20) + '...' : value}
                />
                <YAxis tick={{ fill: '#4A7FA7', fontSize: 12 }} label={{ value: 'Jumlah Peserta', angle: -90, position: 'insideLeft', style: { fill: '#4A7FA7' } }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '2px solid #4A7FA7',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    padding: '12px'
                  }}
                  labelStyle={{ color: '#0A1931', fontWeight: 'bold', marginBottom: '8px' }}
                  itemStyle={{ color: '#4A7FA7' }}
                  formatter={(value, name) => [
                    `${value} peserta`,
                    'Total Peserta'
                  ]}
                />
                <Bar 
                  dataKey="participants" 
                  fill="url(#colorParticipants)" 
                  name="Jumlah Peserta" 
                  radius={[8, 8, 0, 0]}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table View */}
          <div className="mt-8">
            <h3 className="text-md font-semibold text-[#0A1931] mb-4">Detail Ranking Event</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white">
                    <th className="px-4 py-3 text-left text-sm font-semibold rounded-tl-lg">Rank</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Nama Event</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold rounded-tr-lg">Jumlah Peserta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dashboardData.topEvents.map((event, index) => (
                    <tr key={index} className="hover:bg-blue-50 transition-colors duration-200">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {index === 0 && (
                            <span className="text-2xl">🥇</span>
                          )}
                          {index === 1 && (
                            <span className="text-2xl">🥈</span>
                          )}
                          {index === 2 && (
                            <span className="text-2xl">🥉</span>
                          )}
                          {index > 2 && (
                            <span className="w-8 h-8 bg-gradient-to-br from-[#B3CFE5] to-[#4A7FA7] text-white rounded-full flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-[#0A1931]">{event.name}</p>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-bold rounded-full text-sm shadow-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {event.participants}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg lg:text-xl font-semibold text-[#0A1931]">Aktivitas Terbaru</h2>
              <p className="text-gray-600 text-sm">Update terkini sistem event</p>
            </div>
          </div>

          <div className="space-y-4">
            {dashboardData.recentActivity.length > 0 ? (
              dashboardData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-all duration-300 group">
                  <div className={`w-3 h-3 rounded-full ${
                    activity.type === 'create' ? 'bg-green-500' :
                    activity.type === 'register' ? 'bg-blue-500' :
                    activity.type === 'update' ? 'bg-yellow-500' : 'bg-purple-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-[#0A1931] font-semibold group-hover:text-[#4A7FA7] transition-colors">{activity.action}</p>
                    <p className="text-[#4A7FA7] text-sm">{activity.event}</p>
                  </div>
                  <span className="text-[#4A7FA7] text-xs lg:text-sm bg-white px-3 py-1 rounded-full">{activity.time}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Belum ada aktivitas terkini</p>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </AdminLayout>
  );
}
