import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { kegiatanService, daftarHadirService } from '../../services/apiService';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function RevenueRecap() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [allParticipants, setAllParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventSearchTerm, setEventSearchTerm] = useState('');
  const [showEventDropdown, setShowEventDropdown] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const COLORS = ['#10B981', '#F59E0B'];
  const CHART_COLORS = ['#4A7FA7', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await kegiatanService.getAll();
        if (response.data?.success) {
          setEvents(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchAllParticipants = async () => {
      try {
        const response = await daftarHadirService.getAll();
        if (response.data?.success) {
          setAllParticipants(response.data.data.map(p => ({
            id: p.id,
            kegiatan_id: p.kegiatan_id,
            total_harga: parseFloat(p.total_harga || 0),
            status_verifikasi: p.status_verifikasi
          })));
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchAllParticipants();
  }, []);

  useEffect(() => {
    if (selectedEvent) fetchParticipants();
  }, [selectedEvent]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const response = await daftarHadirService.getByKegiatan(selectedEvent.id);
      if (response.data?.success) {
        setParticipants(response.data.data.map(p => ({
          id: p.id,
          namaLengkap: p.nama_lengkap,
          email: p.email,
          tiket_dipilih: p.tiket_dipilih,
          jumlah_tiket: p.jumlah_tiket || 1,
          total_harga: parseFloat(p.total_harga || 0),
          status_verifikasi: p.status_verifikasi,
          created_at: p.created_at
        })));
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    if (!eventSearchTerm.trim()) return true;
    return event.judul_kegiatan.toLowerCase().includes(eventSearchTerm.toLowerCase());
  });

  const filteredParticipants = participants.filter(p => {
    const matchSearch = p.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       p.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status_verifikasi === filterStatus;
    return matchSearch && matchStatus;
  });

  const revenueStats = useMemo(() => {
    const verifiedRevenue = participants.filter(p => p.status_verifikasi === 'verified')
      .reduce((sum, p) => sum + p.total_harga, 0);
    const pendingRevenue = participants.filter(p => p.status_verifikasi === 'pending')
      .reduce((sum, p) => sum + p.total_harga, 0);
    
    const ticketBreakdown = {};
    participants.forEach(p => {
      const ticketName = p.tiket_dipilih || 'Tiket Umum';
      if (!ticketBreakdown[ticketName]) {
        ticketBreakdown[ticketName] = { count: 0, revenue: 0, verified: 0, pending: 0 };
      }
      ticketBreakdown[ticketName].count += p.jumlah_tiket;
      ticketBreakdown[ticketName].revenue += p.total_harga;
      if (p.status_verifikasi === 'verified') ticketBreakdown[ticketName].verified += p.total_harga;
      else ticketBreakdown[ticketName].pending += p.total_harga;
    });

    return {
      totalRevenue: verifiedRevenue + pendingRevenue,
      verifiedRevenue,
      pendingRevenue,
      verifiedCount: participants.filter(p => p.status_verifikasi === 'verified').length,
      pendingCount: participants.filter(p => p.status_verifikasi === 'pending').length,
      ticketBreakdown
    };
  }, [participants]);

  const ticketChartData = Object.entries(revenueStats.ticketBreakdown).map(([name, data]) => ({
    name, verified: data.verified, pending: data.pending
  }));

  const statusPieData = [
    { name: 'Terverifikasi', value: revenueStats.verifiedRevenue },
    { name: 'Pending', value: revenueStats.pendingRevenue }
  ];

  const overviewRevenueByEvent = useMemo(() => {
    const revenueMap = {};
    allParticipants.forEach(p => {
      const event = events.find(e => e.id === p.kegiatan_id);
      if (event) {
        if (!revenueMap[p.kegiatan_id]) {
          revenueMap[p.kegiatan_id] = {
            name: event.judul_kegiatan.length > 15 ? event.judul_kegiatan.substring(0, 15) + '...' : event.judul_kegiatan,
            fullName: event.judul_kegiatan,
            verified: 0,
            pending: 0,
            total: 0
          };
        }
        if (p.status_verifikasi === 'verified') {
          revenueMap[p.kegiatan_id].verified += p.total_harga;
        } else {
          revenueMap[p.kegiatan_id].pending += p.total_harga;
        }
        revenueMap[p.kegiatan_id].total += p.total_harga;
      }
    });
    return Object.values(revenueMap).sort((a, b) => b.total - a.total).slice(0, 10);
  }, [allParticipants, events]);

  const exportToCSV = () => {
    if (!selectedEvent || filteredParticipants.length === 0) {
      alert('Tidak ada data untuk diekspor');
      return;
    }

    const headers = ['No', 'Nama Lengkap', 'Email', 'Tiket', 'Jumlah Tiket', 'Total Harga', 'Status Verifikasi', 'Tanggal Registrasi'];
    const csvRows = [
      headers.join(','),
      ...filteredParticipants.map((p, index) => [
        index + 1,
        `"${p.namaLengkap || ''}"`,
        `"${p.email || ''}"`,
        `"${p.tiket_dipilih || 'Tiket Umum'}"`,
        p.jumlah_tiket,
        p.total_harga,
        p.status_verifikasi === 'verified' ? 'Terverifikasi' : 'Pending',
        `"${new Date(p.created_at).toLocaleDateString('id-ID')}"`
      ].join(','))
    ];

    csvRows.push('');
    csvRows.push('RINGKASAN PENDAPATAN');
    csvRows.push(`Total Peserta,${participants.length}`);
    csvRows.push(`Total Terverifikasi,${revenueStats.verifiedCount}`);
    csvRows.push(`Total Pending,${revenueStats.pendingCount}`);
    csvRows.push(`Pendapatan Terverifikasi,Rp ${revenueStats.verifiedRevenue.toLocaleString('id-ID')}`);
    csvRows.push(`Pendapatan Pending,Rp ${revenueStats.pendingRevenue.toLocaleString('id-ID')}`);
    csvRows.push(`Total Pendapatan,Rp ${revenueStats.totalRevenue.toLocaleString('id-ID')}`);

    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const eventSlug = selectedEvent.judul_kegiatan.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `pendapatan_${eventSlug}_${dateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setEventSearchTerm(event.judul_kegiatan);
    setShowEventDropdown(false);
    setParticipants([]);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.event-selector-container')) setShowEventDropdown(false);
    };
    if (showEventDropdown) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEventDropdown]);

  return (
    <AdminLayout>
      <div className="min-h-screen relative bg-gradient-to-br from-slate-100 via-blue-50/30 to-indigo-100/40">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-blue-400/25 to-indigo-500/20 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-10 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/20 to-pink-500/15 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#0A1931]">Rekap Pendapatan</h1>
                <p className="text-[#4A7FA7]">Ringkasan pendapatan dari penjualan tiket</p>
              </div>
            </div>
            {selectedEvent && participants.length > 0 && (
              <button
                onClick={exportToCSV}
                className="px-6 py-3 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-semibold rounded-xl hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
            )}
          </div>

          <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 event-selector-container relative z-50">
            <label className="block text-sm font-bold text-[#0A1931] mb-3">Pilih Event</label>
            <div className="relative">
              <input
                type="text"
                value={selectedEvent ? selectedEvent.judul_kegiatan : eventSearchTerm}
                onChange={(e) => {
                  setEventSearchTerm(e.target.value);
                  setSelectedEvent(null);
                  setShowEventDropdown(true);
                }}
                onFocus={() => !selectedEvent && setShowEventDropdown(true)}
                placeholder="Cari atau pilih event..."
                className="w-full pl-10 pr-10 py-3 bg-white border-2 border-[#4A7FA7]/20 rounded-xl text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none"
                readOnly={!!selectedEvent}
              />
              <svg className="w-5 h-5 text-[#4A7FA7] absolute left-3 top-1/2 -translate-y-1/2 z-20 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {selectedEvent && (
                <button
                  onClick={() => { setSelectedEvent(null); setEventSearchTerm(''); setParticipants([]); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 z-20"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              {showEventDropdown && !selectedEvent && (
                <div className="absolute top-full left-0 right-0 z-[9999] mt-2 bg-white border-2 border-[#4A7FA7]/20 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                  {filteredEvents.length > 0 ? filteredEvents.map(event => (
                    <button key={event.id} onClick={() => handleEventSelect(event)}
                      className="w-full px-4 py-3 text-left hover:bg-[#4A7FA7]/10 border-b border-gray-100 last:border-b-0">
                      <div className="font-semibold text-[#0A1931]">{event.judul_kegiatan}</div>
                      <div className="text-sm text-[#4A7FA7]">
                        {new Date(event.waktu_mulai).toLocaleDateString('id-ID')} • {event.lokasi_kegiatan}
                      </div>
                    </button>
                  )) : (
                    <div className="px-4 py-3 text-center text-gray-500 text-sm">Tidak ada event yang ditemukan</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {!selectedEvent && overviewRevenueByEvent.length > 0 && (
            <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
              <h2 className="text-xl font-bold text-[#0A1931] mb-4">Overview Pendapatan - Top 10 Event</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={overviewRevenueByEvent}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`}
                    labelFormatter={(label) => {
                      const event = overviewRevenueByEvent.find(e => e.name === label);
                      return event?.fullName || label;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="verified" stackId="a" fill="#10B981" name="Terverifikasi" />
                  <Bar dataKey="pending" stackId="a" fill="#F59E0B" name="Pending" />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-center text-[#4A7FA7] mt-4 text-sm">Pilih event di atas untuk melihat detail pendapatan</p>
            </div>
          )}

          {selectedEvent && (
            <>
              {participants.length === 0 || revenueStats.totalRevenue === 0 ? (
                <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#4A7FA7]/20 to-[#1A3D63]/20 rounded-full flex items-center justify-center mb-6">
                      <svg className="w-10 h-10 text-[#4A7FA7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-[#0A1931] mb-3">Belum Ada Pendapatan</h3>
                    <p className="text-[#4A7FA7] text-lg mb-2">Event <span className="font-semibold">"{selectedEvent.judul_kegiatan}"</span> belum memiliki data pendapatan.</p>
                    <p className="text-[#4A7FA7]">Pendapatan akan muncul setelah ada peserta yang melakukan pembayaran tiket.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl border-2 border-green-400/30 p-6 shadow-lg hover:shadow-2xl transition-all hover:scale-105">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-600 text-xs font-semibold mb-1">Terverifikasi</p>
                          <h3 className="text-xl font-bold text-[#0A1931]">Rp {revenueStats.verifiedRevenue.toLocaleString('id-ID')}</h3>
                          <p className="text-green-600 text-xs mt-1">{revenueStats.verifiedCount} transaksi</p>
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl border-2 border-yellow-400/30 p-6 shadow-lg hover:shadow-2xl transition-all hover:scale-105">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-yellow-600 text-xs font-semibold mb-1">Pending</p>
                          <h3 className="text-xl font-bold text-[#0A1931]">Rp {revenueStats.pendingRevenue.toLocaleString('id-ID')}</h3>
                          <p className="text-yellow-600 text-xs mt-1">{revenueStats.pendingCount} transaksi</p>
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl border-2 border-[#4A7FA7]/20 p-6 shadow-lg hover:shadow-2xl transition-all hover:scale-105">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[#4A7FA7] text-xs font-semibold mb-1">Total Pendapatan</p>
                          <h3 className="text-xl font-bold text-[#0A1931]">Rp {revenueStats.totalRevenue.toLocaleString('id-ID')}</h3>
                          <p className="text-[#4A7FA7] text-xs mt-1">{participants.length} peserta</p>
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-xl flex items-center justify-center text-white shadow-lg">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl border-2 border-purple-400/30 p-6 shadow-lg hover:shadow-2xl transition-all hover:scale-105">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-600 text-xs font-semibold mb-1">Rata-rata</p>
                          <h3 className="text-xl font-bold text-[#0A1931]">
                            Rp {participants.length > 0 ? (revenueStats.totalRevenue / participants.length).toFixed(0).toLocaleString('id-ID') : 0}
                          </h3>
                          <p className="text-purple-600 text-xs mt-1">Per transaksi</p>
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {ticketChartData.length > 0 && (
                      <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                        <h2 className="text-xl font-bold text-[#0A1931] mb-4">Pendapatan per Tiket</h2>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={ticketChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                            <YAxis />
                            <Tooltip formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
                            <Legend />
                            <Bar dataKey="verified" fill="#10B981" name="Terverifikasi" />
                            <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                      <h2 className="text-xl font-bold text-[#0A1931] mb-4">Status Pembayaran</h2>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie data={statusPieData} cx="50%" cy="50%" labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80} dataKey="value">
                            {statusPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-semibold text-[#0A1931] mb-2">Cari Peserta</label>
                        <div className="relative">
                          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari berdasarkan nama atau email..."
                            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-[#4A7FA7]/20 rounded-xl focus:border-[#4A7FA7] focus:outline-none" />
                          <svg className="w-5 h-5 text-[#4A7FA7] absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#0A1931] mb-2">Filter Status</label>
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                          className="w-full px-4 py-3 bg-white border-2 border-[#4A7FA7]/20 rounded-xl focus:border-[#4A7FA7] focus:outline-none">
                          <option value="all">Semua Status</option>
                          <option value="verified">Terverifikasi</option>
                          <option value="pending">Pending</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                    <div className="p-6 border-b border-[#4A7FA7]/10">
                      <h2 className="text-xl font-bold text-[#0A1931]">Detail Transaksi</h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-[#4A7FA7]/10">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-[#0A1931] uppercase">No</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-[#0A1931] uppercase">Nama</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-[#0A1931] uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-[#0A1931] uppercase">Tiket</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-[#0A1931] uppercase">Jumlah</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-[#0A1931] uppercase">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-[#0A1931] uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white/50 divide-y divide-gray-200">
                          {filteredParticipants.map((p, idx) => (
                            <tr key={p.id} className="hover:bg-[#4A7FA7]/5">
                              <td className="px-6 py-4 text-sm text-[#0A1931]">{idx + 1}</td>
                              <td className="px-6 py-4 text-sm font-medium text-[#0A1931]">{p.namaLengkap}</td>
                              <td className="px-6 py-4 text-sm text-[#4A7FA7]">{p.email}</td>
                              <td className="px-6 py-4 text-sm text-[#0A1931]">{p.tiket_dipilih || 'Tiket Umum'}</td>
                              <td className="px-6 py-4 text-sm text-[#0A1931]">{p.jumlah_tiket}</td>
                              <td className="px-6 py-4 text-sm font-semibold text-[#0A1931]">Rp {p.total_harga.toLocaleString('id-ID')}</td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  p.status_verifikasi === 'verified' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {p.status_verifikasi === 'verified' ? 'Terverifikasi' : 'Pending'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}