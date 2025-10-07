import React, { useState } from "react";
import AdminLayout from "../components/AdminLayout";

export default function AdminDashboard() {
  // Mock data - nanti bisa diganti dengan API
  const [monthlyEvents, setMonthlyEvents] = useState([
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
  ]);

  const [topEvents, setTopEvents] = useState([
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
  ]);

  const stats = [
    {
      id: 1,
      title: "Total Events",
      value: "242",
      change: "+12.5%",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: "bg-blue-500"
    },
    {
      id: 2,
      title: "Total Participants",
      value: "8,170",
      change: "+8.3%",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: "bg-green-500"
    },
    {
      id: 3,
      title: "Active Events",
      value: "18",
      change: "+5.2%",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-purple-500"
    },
    {
      id: 4,
      title: "Revenue",
      value: "Rp 125M",
      change: "+15.8%",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-orange-500"
    }
  ];

  const exportToExcel = () => {
    // Export monthly data
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Month,Events,Participants\n"
      + monthlyEvents.map(e => `${e.month},${e.events},${e.participants}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "monthly_statistics.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportTopEvents = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Event Name,Participants\n"
      + topEvents.map(e => `"${e.name}",${e.participants}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "top_events.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Overview statistik dan analisis event</p>
          </div>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Data
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</h3>
                  <p className="text-green-600 text-sm font-semibold mt-1">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-4 rounded-xl text-white`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Events Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Jumlah Kegiatan Per Bulan</h2>
              <button
                onClick={exportToExcel}
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
              >
                Export CSV
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyEvents}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="events" fill="#8b5cf6" name="Jumlah Event" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Participants Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Jumlah Peserta Per Bulan</h2>
              <button
                onClick={exportToExcel}
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
              >
                Export CSV
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyEvents}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="participants" fill="#10b981" name="Jumlah Peserta" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 10 Events Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">10 Event dengan Peserta Terbanyak</h2>
            <button
              onClick={exportTopEvents}
              className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
            >
              Export CSV
            </button>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topEvents} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={200} />
              <Tooltip />
              <Legend />
              <Bar dataKey="participants" fill="#f59e0b" name="Jumlah Peserta" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Aktivitas Terbaru</h2>
          <div className="space-y-4">
            {[
              { action: "Event baru ditambahkan", event: "Workshop Digital Marketing", time: "2 jam lalu" },
              { action: "Peserta terdaftar", event: "Seminar Teknologi AI", time: "3 jam lalu" },
              { action: "Event diupdate", event: "Konser Musik Akustik", time: "5 jam lalu" },
              { action: "Event selesai", event: "Pelatihan Public Speaking", time: "1 hari lalu" }
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-0">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">{activity.action}</p>
                  <p className="text-gray-600 text-sm">{activity.event}</p>
                </div>
                <span className="text-gray-500 text-sm">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
