import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AdminLayout from "../components/AdminLayout";
import { useEvents } from "../contexts/EventContext";

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

  useEffect(() => {
    if (events.length > 0) {
      calculateDashboardStats();
    }
  }, [events]);

  const calculateDashboardStats = () => {
    // Calculate total stats
    const totalEvents = events.length;
    const totalParticipants = events.reduce((sum, event) =>
      sum + (event.kapasitas_peserta === 'unlimited' ? 0 : parseInt(event.kapasitas_peserta) || 0), 0);
    const activeEvents = events.filter(event => new Date(event.waktu_selesai || event.waktu_mulai) > new Date()).length;
    
    // Calculate revenue
    const totalRevenue = events.reduce((sum, event) => {
      const harga = parseFloat(event.harga_tiket) || 0;
      return sum + harga;
    }, 0);
    
    // Calculate admin income (10% commission)
    const adminIncome = totalRevenue * 0.1;
    
    // Calculate organizer income (90%)
    const organizerIncome = totalRevenue * 0.9;

    // Generate monthly stats (mock data for now, bisa diganti dengan data real dari API)
    const monthlyStats = [
      { month: "Jan", events: 12, participants: 450 },
      { month: "Feb", events: 15, participants: 520 },
      { month: "Mar", events: 18, participants: 680 },
      { month: "Apr", events: 14, participants: 510 },
      { month: "Mei", events: 20, participants: 750 },
      { month: "Jun", events: 22, participants: 820 },
      { month: "Jul", events: 19, participants: 710 },
      { month: "Agu", events: 16, participants: 590 },
      { month: "Sep", events: 21, participants: 780 },
      { month: "Okt", events: 17, participants: 630 },
      { month: "Nov", events: 23, participants: 850 },
      { month: "Des", events: 25, participants: 920 }
    ];

    // Get top events by participants (mock data for now)
    const topEvents = [
      { name: "Workshop Digital Marketing", participants: 320 },
      { name: "Seminar Teknologi AI", participants: 285 },
      { name: "Konser Musik Akustik", participants: 450 },
      { name: "Pelatihan Public Speaking", participants: 200 },
      { name: "Festival Seni Budaya", participants: 380 },
      { name: "Workshop Photography", participants: 150 },
      { name: "Seminar Entrepreneurship", participants: 250 },
      { name: "Music Festival 2025", participants: 500 },
      { name: "Tech Conference", participants: 420 },
      { name: "Art Exhibition", participants: 180 }
    ];

    // Generate recent activity from events
    const recentActivity = events.slice(0, 4).map((event, index) => ({
      action: index === 0 ? "Event baru ditambahkan" :
             index === 1 ? "Peserta terdaftar" :
             index === 2 ? "Event diupdate" : "Event selesai",
      event: event.judul_kegiatan,
      time: index === 0 ? "2 jam lalu" :
            index === 1 ? "3 jam lalu" :
            index === 2 ? "5 jam lalu" : "1 hari lalu",
      type: index === 0 ? "create" :
            index === 1 ? "register" :
            index === 2 ? "update" : "complete"
    }));

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
      value: `Rp ${dashboardData.totalRevenue.toLocaleString('id-ID')}`,
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
      value: `Rp ${dashboardData.adminIncome.toLocaleString('id-ID')}`,
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
      value: `Rp ${dashboardData.organizerIncome.toLocaleString('id-ID')}`,
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
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <div key={stat.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 group hover:scale-105 h-full">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-[#4A7FA7] text-sm font-semibold">{stat.title}</p>
                    {stat.subtitle && (
                      <p className="text-xs text-gray-500 font-medium">{stat.subtitle}</p>
                    )}
                    <h3 className="text-xl lg:text-2xl font-bold text-[#0A1931]">{stat.value}</h3>
                    <p className="text-green-600 text-xs font-semibold">{stat.change}</p>
                  </div>
                  <div className={`w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            </div>
          ))}
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
            <h2 className="text-lg lg:text-xl font-semibold text-[#0A1931]">10 Event dengan Peserta Terbanyak</h2>
            <p className="text-gray-600 text-sm mt-1">Ranking event berdasarkan jumlah peserta</p>
          </div>
          <div className="mt-6">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={dashboardData.topEvents} layout="horizontal" margin={{ top: 20, right: 30, left: 120, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4A7FA7/20" />
                <XAxis type="number" tick={{ fill: '#4A7FA7', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#4A7FA7', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#F6FAFD',
                    border: '2px solid #4A7FA7/20',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="participants" fill="#B3CFE5" name="Jumlah Peserta" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
