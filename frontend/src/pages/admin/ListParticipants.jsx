import React, { useState, useEffect, useMemo } from "react";
import AdminLayout from "../../components/AdminLayout";
import { daftarHadirService } from "../../services/apiService";

export default function ListParticipants() {
  const [participants, setParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // Status Pendaftaran
  const [attendanceFilter, setAttendanceFilter] = useState("all"); // Status Kehadiran
  const [eventFilter, setEventFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [participantToDelete, setParticipantToDelete] = useState(null);

  // Fetch participants data from API
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setLoading(true);
        console.log('Fetching all participants...');
        
        const response = await daftarHadirService.getAll();
        console.log('All participants response:', response);
        
        if (response.data?.success) {
          const participantData = response.data.data.map(p => ({
            id: p.id,
            nama_lengkap: p.nama_lengkap,
            email: p.email,
            no_telepon: p.no_telepon,
            alamat: p.alamat,
            pendidikan_terakhir: p.pendidikan_terakhir,
            foto_profil: p.foto_profil || p.user?.foto_profil || null,
            event_joined: p.kegiatan ? [p.kegiatan.judul_kegiatan] : [],
            status_verifikasi: p.status_verifikasi || 'pending',
            status_kehadiran: p.status_kehadiran,
            tanggal_daftar: p.created_at,
            token_kehadiran: p.otp,
            sertifikat_diterbitkan: false,
            tipe_peserta: p.tipe_peserta,
            nama_tim: p.nama_tim,
            data_tim: p.data_tim ? (typeof p.data_tim === 'string' ? JSON.parse(p.data_tim) : p.data_tim) : null,
            tiket_dipilih: p.tiket_dipilih,
            jumlah_tiket: p.jumlah_tiket,
            total_harga: p.total_harga
          }));
          
          console.log('Mapped all participants:', participantData);
          setParticipants(participantData);
        }
      } catch (error) {
        console.error('Error fetching participants:', error);
        setParticipants([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchParticipants();
  }, []);

  // Get unique events from participants
  const uniqueEvents = [...new Set(participants.flatMap(p => p.event_joined))].sort();

  // Helper function: Format rupiah dengan format lengkap (angka penuh)
  const formatCompactRupiah = (value) => {
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  // Calculate revenue statistics from all registered participants
  const revenueStats = useMemo(() => {
    // Count all participants who have registered (all participants that have total_harga data)
    const registeredParticipants = participants.filter(p => {
      // Include all participants that have total_harga (either > 0 or = 0 for free tickets)
      return p.total_harga !== null && p.total_harga !== undefined;
    });
    
    const totalRevenue = registeredParticipants.reduce((sum, p) => {
      const harga = parseFloat(p.total_harga) || 0;
      return sum + harga;
    }, 0);
    
    const adminIncome = totalRevenue * 0.1; // 10% commission
    const organizerIncome = totalRevenue * 0.9; // 90% for organizer

    return {
      totalRevenue,
      adminIncome,
      organizerIncome,
      totalRegistered: registeredParticipants.length
    };
  }, [participants]);

  // Filter participants with enhanced search (includes event name)
  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = participant.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participant.no_telepon.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participant.event_joined.some(event => event.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || participant.status_verifikasi === statusFilter;
    const matchesAttendance = attendanceFilter === "all" || 
                             (attendanceFilter === "hadir" && participant.status_kehadiran === "hadir") ||
                             (attendanceFilter === "tidak_hadir" && participant.status_kehadiran === "tidak_hadir") ||
                             (attendanceFilter === "pending" && (!participant.status_kehadiran || participant.status_kehadiran === "pending"));
    const matchesEvent = eventFilter === "all" || participant.event_joined.some(event => event === eventFilter);

    return matchesSearch && matchesStatus && matchesAttendance && matchesEvent;
  });

  const getStatusBadge = (status) => {
    return status === 'verified'
      ? "bg-green-100 text-green-700 border-green-200"
      : "bg-yellow-100 text-yellow-700 border-yellow-200";
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      // TODO: Update via API
      // await daftarHadirService.updateStatus(id, newStatus);
      setParticipants(prev => prev.map(p =>
        p.id === id ? { ...p, status_verifikasi: newStatus } : p
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async () => {
    if (!participantToDelete) return;
    try {
      // TODO: Delete via API
      // await daftarHadirService.delete(participantToDelete.id);
      setParticipants(prev => prev.filter(p => p.id !== participantToDelete.id));
      setShowDeleteModal(false);
      setParticipantToDelete(null);
    } catch (error) {
      console.error('Error deleting participant:', error);
    }
  };

  const confirmDelete = (participant) => {
    setParticipantToDelete(participant);
    setShowDeleteModal(true);
  };

  const exportParticipants = () => {
    const headers = [
      'No',
      'ID',
      'Nama Lengkap',
      'Email',
      'No. Telepon',
      'Alamat',
      'Pendidikan Terakhir',
      'Event',
      'Tanggal Daftar',
      'Tiket Dipilih',
      'Jumlah Tiket',
      'Harga Tiket',
      'Total Harga',
      'Status Verifikasi',
      'Status Kehadiran',
      'Tipe Peserta',
      'Nama Tim'
    ];

    const csvRows = [
      headers.join(','),
      ...filteredParticipants.map((participant, index) => {
        const eventNames = participant.event_joined.join('; ');
        const hargaTiket = participant.total_harga && participant.jumlah_tiket 
          ? (parseFloat(participant.total_harga) / participant.jumlah_tiket).toFixed(0)
          : participant.total_harga || '0';
        const totalHarga = parseFloat(participant.total_harga) || 0;
        const statusVerifikasi = participant.status_verifikasi === 'verified' ? 'Terverifikasi' : 
                                 participant.status_verifikasi === 'pending' ? 'Pending' : 'Ditolak';
        const statusKehadiran = participant.status_kehadiran === 'hadir' ? 'Hadir' :
                                participant.status_kehadiran === 'tidak_hadir' ? 'Tidak Hadir' : 'Belum';
        const dateObj = new Date(participant.tanggal_daftar);
        const tanggalDaftar = dateObj.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) + ' ' + dateObj.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit'
        });

        return [
          index + 1,
          participant.id,
          `"${participant.nama_lengkap || ''}"`,
          `"${participant.email || ''}"`,
          `"${participant.no_telepon || ''}"`,
          `"${(participant.alamat || '').replace(/"/g, '""')}"`,
          `"${participant.pendidikan_terakhir || ''}"`,
          `"${eventNames}"`,
          tanggalDaftar,
          `"${participant.tiket_dipilih || 'General'}"`,
          participant.jumlah_tiket || 1,
          hargaTiket,
          totalHarga,
          statusVerifikasi,
          statusKehadiran,
          participant.tipe_peserta || 'individu',
          `"${participant.nama_tim || ''}"`
        ].join(',');
      })
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const filename = `data_peserta_${dateStr}.csv`;
    
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A7FA7] mx-auto mb-4"></div>
            <p className="text-[#4A7FA7]">Memuat data peserta...</p>
          </div>
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
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#0A1931]">Daftar Peserta</h1>
              <p className="text-[#4A7FA7]">Kelola data peserta dari seluruh kegiatan</p>
            </div>
          </div>
          <button
            onClick={exportParticipants}
            className="px-6 py-3 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-semibold rounded-xl hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl border-2 border-[#4A7FA7]/20 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group hover:scale-105">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#4A7FA7] text-sm font-semibold mb-1">Total Peserta</p>
                  <h3 className="text-3xl font-bold text-[#0A1931] mb-2">{participants.length}</h3>
                  <p className="text-green-600 text-sm font-semibold">+{Math.floor(Math.random() * 10)}% dari bulan lalu</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl border-2 border-[#4A7FA7]/20 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group hover:scale-105">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#4A7FA7] text-sm font-semibold mb-1">Terverifikasi</p>
                  <h3 className="text-3xl font-bold text-[#0A1931] mb-2">
                    {participants.filter(p => p.status_verifikasi === 'verified').length}
                  </h3>
                  <p className="text-green-600 text-sm font-semibold">Akun aktif</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-[#0A1931] to-[#4A7FA7] rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl border-2 border-[#4A7FA7]/20 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group hover:scale-105">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#4A7FA7] text-sm font-semibold mb-1">Pending</p>
                  <h3 className="text-3xl font-bold text-[#0A1931] mb-2">
                    {participants.filter(p => p.status_verifikasi === 'pending').length}
                  </h3>
                  <p className="text-yellow-600 text-sm font-semibold">Perlu verifikasi</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-[#B3CFE5] to-[#4A7FA7] rounded-xl flex items-center justify-center text-[#0A1931] shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl border-2 border-[#4A7FA7]/20 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group hover:scale-105">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#4A7FA7] text-sm font-semibold mb-1">Hadir</p>
                  <h3 className="text-3xl font-bold text-[#0A1931] mb-2">
                    {participants.filter(p => p.status_kehadiran === 'hadir').length}
                  </h3>
                  <p className="text-green-600 text-sm font-semibold">Sudah hadir</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-[#4A7FA7] to-[#0A1931] rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl border-2 border-[#4A7FA7]/20 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group hover:scale-105">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 pr-4">
                  <p className="text-[#4A7FA7] text-sm font-semibold mb-1">Total Pendapatan</p>
                  <h3 className="text-sm lg:text-base font-bold text-[#0A1931] mb-2 break-words">
                    {formatCompactRupiah(revenueStats.totalRevenue)}
                  </h3>
                  <p className="text-gray-600 text-xs font-semibold">Dari {revenueStats.totalRegistered} peserta terdaftar</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl border-2 border-[#4A7FA7]/20 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group hover:scale-105">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 pr-4">
                  <p className="text-[#4A7FA7] text-sm font-semibold mb-1">Pendapatan Admin</p>
                  <h3 className="text-sm lg:text-base font-bold text-[#0A1931] mb-2 break-words">
                    {formatCompactRupiah(revenueStats.adminIncome)}
                  </h3>
                  <p className="text-green-600 text-xs font-semibold">Komisi 10%</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl border-2 border-[#4A7FA7]/20 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group hover:scale-105">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 pr-4">
                  <p className="text-[#4A7FA7] text-sm font-semibold mb-1">Pendapatan Panitia</p>
                  <h3 className="text-sm lg:text-base font-bold text-[#0A1931] mb-2 break-words">
                    {formatCompactRupiah(revenueStats.organizerIncome)}
                  </h3>
                  <p className="text-blue-600 text-xs font-semibold">Total 90%</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#0A1931] mb-2">Cari Peserta</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama, email, telepon, atau event..."
                className="w-full px-4 py-2 bg-white border-2 border-[#4A7FA7]/20 rounded-lg text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0A1931] mb-2">Status Verifikasi</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 bg-white border-2 border-[#4A7FA7]/20 rounded-lg text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors"
              >
                <option value="all">Semua Status</option>
                <option value="verified">Terverifikasi</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0A1931] mb-2">Status Kehadiran</label>
              <select
                value={attendanceFilter}
                onChange={(e) => setAttendanceFilter(e.target.value)}
                className="w-full px-4 py-2 bg-white border-2 border-[#4A7FA7]/20 rounded-lg text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors"
              >
                <option value="all">Semua Status</option>
                <option value="hadir">Hadir</option>
                <option value="tidak_hadir">Tidak Hadir</option>
                <option value="pending">Belum</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0A1931] mb-2">Event</label>
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                className="w-full px-4 py-2 bg-white border-2 border-[#4A7FA7]/20 rounded-lg text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors"
              >
                <option value="all">Semua Event</option>
                {uniqueEvents.map(event => (
                  <option key={event} value={event}>{event}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setAttendanceFilter("all");
                  setEventFilter("all");
                }}
                className="w-full px-4 py-2 bg-[#4A7FA7]/20 text-[#0A1931] font-semibold rounded-lg hover:bg-[#4A7FA7]/30 transition-colors border border-[#4A7FA7]/30"
              >
                Reset Filter
              </button>
            </div>
          </div>
        </div>

        {/* Participants Table */}
        <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63]">
                <tr>
                  <th className="px-4 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">No</th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Nama Lengkap</th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Email</th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">No. Telepon</th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Event</th>
                  <th className="px-4 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">Tgl. Daftar</th>
                  <th className="px-4 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">Harga Tiket</th>
                  <th className="px-4 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">Status Pendaftaran</th>
                  <th className="px-4 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">Status Kehadiran</th>
                  <th className="px-4 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {filteredParticipants.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-12 text-center">
                      <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p className="text-[#4A7FA7] font-medium">Tidak ada peserta yang ditemukan</p>
                      <p className="text-gray-400 text-sm mt-1">Coba ubah filter pencarian</p>
                    </td>
                  </tr>
                ) : (
                  filteredParticipants.map((participant, index) => {
                    return (
                      <tr 
                        key={participant.id}
                        className="hover:bg-blue-50/30 transition-colors duration-200 border-b border-gray-200"
                      >
                        {/* No */}
                        <td className="px-4 py-4 text-center">
                          <span className="font-semibold text-[#0A1931]">{index + 1}</span>
                        </td>

                        {/* Nama Lengkap */}
                        <td className="px-4 py-4">
                          <div>
                            <div className="font-semibold text-[#0A1931] text-sm">
                              {participant.nama_lengkap}
                            </div>
                            <div className="text-xs text-gray-500">
                              Daftar: {new Date(participant.tanggal_daftar).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-4 py-4">
                          <span className="text-gray-700 text-sm">{participant.email}</span>
                        </td>

                        {/* No. Telepon */}
                        <td className="px-4 py-4">
                          <span className="text-gray-700 text-sm">{participant.no_telepon}</span>
                        </td>

                        {/* Event */}
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            {participant.event_joined.length > 0 ? (
                              participant.event_joined.map((event, idx) => (
                                <div key={idx} className="text-[#0A1931] text-sm font-medium">
                                  {event}
                                </div>
                              ))
                            ) : (
                              <span className="text-gray-400 text-sm italic">Tidak ada event</span>
                            )}
                          </div>
                        </td>

                        {/* Tanggal Daftar */}
                        <td className="px-4 py-4 text-center">
                          <span className="text-gray-700 text-sm">
                            {new Date(participant.tanggal_daftar).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </td>

                        {/* Harga Tiket */}
                        <td className="px-4 py-4 text-center">
                          {participant.total_harga && parseFloat(participant.total_harga) > 0 ? (
                            <div>
                              <div className="font-bold text-[#0A1931] text-sm">
                                Rp {parseInt(participant.total_harga).toLocaleString('id-ID')}
                              </div>
                              {participant.tiket_dipilih && (
                                <div className="text-xs text-[#4A7FA7] mt-1">
                                  {participant.tiket_dipilih}
                                </div>
                              )}
                              {participant.jumlah_tiket > 1 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  ({participant.jumlah_tiket} tiket)
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="inline-block px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold text-xs">
                              GRATIS
                            </span>
                          )}
                        </td>

                        {/* Status Pendaftaran */}
                        <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={participant.status_verifikasi}
                            onChange={(e) => handleStatusChange(participant.id, e.target.value)}
                            className={`inline-block px-3 py-1.5 rounded-md text-xs font-semibold border cursor-pointer ${getStatusBadge(participant.status_verifikasi)}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="verified">Verified</option>
                          </select>
                        </td>

                        {/* Status Kehadiran */}
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-block px-3 py-1.5 rounded-md text-xs font-semibold ${
                            participant.status_kehadiran === 'hadir'
                              ? 'bg-green-100 text-green-700'
                              : participant.status_kehadiran === 'tidak_hadir'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {participant.status_kehadiran === 'hadir' ? 'Hadir' : participant.status_kehadiran === 'tidak_hadir' ? 'Tidak Hadir' : 'Belum'}
                          </span>
                        </td>

                        {/* Aksi CRUD */}
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {/* View Button */}
                            <button
                              onClick={() => {
                                setSelectedParticipant(participant);
                                setShowDetailModal(true);
                              }}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                              title="Lihat Detail"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => confirmDelete(participant)}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                              title="Hapus"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        </div>

        {/* Detail Modal Pop-up */}
        {showDetailModal && selectedParticipant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowDetailModal(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Detail Peserta</h2>
                    <p className="text-white/80 text-sm">Informasi lengkap pendaftaran</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 space-y-6">
                {/* Registration Badge - Glassmorphism */}
                <div className="bg-white/40 backdrop-blur-md rounded-xl p-5 border border-white/60 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#4A7FA7] font-semibold uppercase mb-1">Tipe Pendaftaran</p>
                      <p className="text-[#0A1931] font-bold text-2xl capitalize">{selectedParticipant.tipe_peserta}</p>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-xl flex items-center justify-center shadow-lg">
                      {selectedParticipant.tipe_peserta === 'tim' ? (
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      ) : (
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>

                {/* Personal Info for Individual OR Team Name */}
                {selectedParticipant.tipe_peserta === 'tim' ? (
                  <div>
                    <h3 className="text-xl font-bold text-[#0A1931] mb-4 flex items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-lg flex items-center justify-center shadow-md">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <span>Informasi Tim</span>
                    </h3>
                    <div className="bg-white/50 backdrop-blur-md p-6 rounded-xl border border-white/60 shadow-lg">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-xl flex items-center justify-center shadow-md">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                          </svg>
                        </div>
                        <div>
                          <label className="text-xs text-[#4A7FA7] font-bold uppercase">Nama Tim</label>
                          <p className="text-[#0A1931] font-bold text-2xl">{selectedParticipant.nama_tim}</p>
                        </div>
                      </div>

                      {/* Team Leader */}
                      {selectedParticipant.data_tim && selectedParticipant.data_tim.ketua && (
                        <div className="bg-white/70 backdrop-blur-md rounded-xl p-5 border border-white/60 shadow-md mb-4">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-lg flex items-center justify-center shadow">
                              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </div>
                            <span className="font-bold text-[#0A1931] text-lg">Ketua Tim</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs text-[#4A7FA7] font-semibold uppercase">Nama Lengkap</label>
                              <p className="text-[#0A1931] font-bold mt-1">{selectedParticipant.data_tim.ketua.namaLengkap}</p>
                            </div>
                            <div>
                              <label className="text-xs text-[#4A7FA7] font-semibold uppercase">Email</label>
                              <p className="text-[#0A1931] font-semibold text-sm mt-1">{selectedParticipant.data_tim.ketua.email}</p>
                            </div>
                            <div>
                              <label className="text-xs text-[#4A7FA7] font-semibold uppercase">No. Telepon</label>
                              <p className="text-[#0A1931] font-semibold mt-1">{selectedParticipant.data_tim.ketua.nomorTelepon}</p>
                            </div>
                            <div>
                              <label className="text-xs text-[#4A7FA7] font-semibold uppercase">Pendidikan Terakhir</label>
                              <p className="text-[#0A1931] font-semibold mt-1">{selectedParticipant.data_tim.ketua.pendidikanTerakhir || '-'}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Team Members */}
                      {selectedParticipant.data_tim && selectedParticipant.data_tim.anggota && selectedParticipant.data_tim.anggota.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-lg flex items-center justify-center shadow">
                              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                              </svg>
                            </div>
                            <span className="font-bold text-[#0A1931] text-lg">Anggota Tim ({selectedParticipant.data_tim.anggota.length})</span>
                          </div>
                          <div className="space-y-3">
                            {selectedParticipant.data_tim.anggota.map((anggota, index) => (
                              <div key={index} className="bg-white/60 backdrop-blur-md rounded-lg p-4 border border-white/60 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-6 h-6 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-md flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">{index + 1}</span>
                                  </div>
                                  <span className="font-bold text-[#0A1931] text-sm">Anggota {index + 1}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <label className="text-[#4A7FA7] font-semibold uppercase text-xs">Nama</label>
                                    <p className="text-[#0A1931] font-bold mt-1">{anggota.namaLengkap}</p>
                                  </div>
                                  <div>
                                    <label className="text-[#4A7FA7] font-semibold uppercase text-xs">Email</label>
                                    <p className="text-[#0A1931] font-semibold truncate mt-1">{anggota.email}</p>
                                  </div>
                                  <div>
                                    <label className="text-[#4A7FA7] font-semibold uppercase text-xs">Telepon</label>
                                    <p className="text-[#0A1931] font-semibold mt-1">{anggota.nomorTelepon}</p>
                                  </div>
                                  <div>
                                    <label className="text-[#4A7FA7] font-semibold uppercase text-xs">Pendidikan</label>
                                    <p className="text-[#0A1931] font-semibold mt-1">{anggota.pendidikanTerakhir || '-'}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xl font-bold text-[#0A1931] mb-4 flex items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-lg flex items-center justify-center shadow-md">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span>Informasi Pribadi</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/50 backdrop-blur-md p-5 rounded-xl border border-white/60 shadow-md">
                        <label className="text-xs text-[#4A7FA7] font-bold uppercase flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Nama Lengkap
                        </label>
                        <p className="text-[#0A1931] font-bold text-lg mt-1">{selectedParticipant.nama_lengkap}</p>
                      </div>
                      <div className="bg-white/50 backdrop-blur-md p-5 rounded-xl border border-white/60 shadow-md">
                        <label className="text-xs text-[#4A7FA7] font-bold uppercase flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Email
                        </label>
                        <p className="text-[#0A1931] font-semibold mt-1 truncate">{selectedParticipant.email}</p>
                      </div>
                      <div className="bg-white/50 backdrop-blur-md p-5 rounded-xl border border-white/60 shadow-md">
                        <label className="text-xs text-[#4A7FA7] font-bold uppercase flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          No. Telepon
                        </label>
                        <p className="text-[#0A1931] font-semibold mt-1">{selectedParticipant.no_telepon}</p>
                      </div>
                      <div className="bg-white/50 backdrop-blur-md p-5 rounded-xl border border-white/60 shadow-md">
                        <label className="text-xs text-[#4A7FA7] font-bold uppercase flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Pendidikan
                        </label>
                        <p className="text-[#0A1931] font-semibold mt-1">{selectedParticipant.pendidikan_terakhir || '-'}</p>
                      </div>
                      {selectedParticipant.alamat && (
                        <div className="md:col-span-2 bg-white/50 backdrop-blur-md p-5 rounded-xl border border-white/60 shadow-md">
                          <label className="text-xs text-[#4A7FA7] font-bold uppercase flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Alamat
                          </label>
                          <p className="text-[#0A1931] font-semibold mt-1">{selectedParticipant.alamat}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Event & Registration Info */}
                <div>
                  <h3 className="text-xl font-bold text-[#0A1931] mb-4 flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-lg flex items-center justify-center shadow-md">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span>Informasi Event & Pendaftaran</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-white/50 backdrop-blur-md p-5 rounded-xl border border-white/60 shadow-md">
                      <label className="text-xs text-[#4A7FA7] font-bold uppercase flex items-center gap-1 mb-3">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Event yang Diikuti
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedParticipant.event_joined.map((event, index) => (
                          <span key={index} className="px-4 py-2 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white rounded-full text-sm font-bold shadow-md">
                            {event}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/40 backdrop-blur-md p-4 rounded-xl border border-white/60 shadow-md">
                        <label className="text-xs text-[#4A7FA7] font-bold uppercase flex items-center gap-1 mb-2">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Tanggal Daftar
                        </label>
                        <p className="text-[#0A1931] font-bold text-lg mt-1">
                          {new Date(selectedParticipant.tanggal_daftar).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="bg-white/40 backdrop-blur-md p-4 rounded-xl border border-white/60 shadow-md">
                        <label className="text-xs text-[#4A7FA7] font-bold uppercase flex items-center gap-1 mb-2">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          ID Peserta
                        </label>
                        <p className="text-[#0A1931] font-bold text-lg mt-1">#{selectedParticipant.id}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ticket & Payment Info */}
                <div>
                  <h3 className="text-xl font-bold text-[#0A1931] mb-4 flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-lg flex items-center justify-center shadow-md">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                    </div>
                    <span>Informasi Tiket & Pembayaran</span>
                  </h3>
                  <div className="bg-white/50 backdrop-blur-md p-6 rounded-xl border border-white/60 shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/60 backdrop-blur-md p-5 rounded-lg border border-white/60 shadow-sm">
                        <label className="text-xs text-[#4A7FA7] font-bold uppercase flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                          </svg>
                          Jenis Tiket
                        </label>
                        <p className="text-[#0A1931] font-bold text-lg mt-2">{selectedParticipant.tiket_dipilih || 'General'}</p>
                      </div>
                      <div className="bg-white/60 backdrop-blur-md p-5 rounded-lg border border-white/60 shadow-sm">
                        <label className="text-xs text-[#4A7FA7] font-bold uppercase flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                          Jumlah
                        </label>
                        <p className="text-[#0A1931] font-bold text-lg mt-2">{selectedParticipant.jumlah_tiket || 1} Tiket</p>
                      </div>
                      <div className="bg-white/60 backdrop-blur-md p-5 rounded-lg border border-white/60 shadow-sm">
                        <label className="text-xs text-[#4A7FA7] font-bold uppercase flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Total Bayar
                        </label>
                        <p className="text-[#0A1931] font-bold text-xl mt-1">
                          {selectedParticipant.total_harga > 0 
                            ? `Rp ${selectedParticipant.total_harga.toLocaleString('id-ID')}`
                            : <span className="text-green-600">GRATIS</span>
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Info */}
                <div>
                  <h3 className="text-xl font-bold text-[#0A1931] mb-4 flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-lg flex items-center justify-center shadow-md">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span>Status & Token Kehadiran</span>
                  </h3>
                  <div className="space-y-4">
                    {/* Token Kehadiran - Featured */}
                    <div className="bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] p-6 rounded-xl shadow-lg">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-white font-bold uppercase text-sm flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                          Token Kehadiran
                        </label>
                        <div className="bg-white/20 px-3 py-1 rounded-full">
                          <span className="text-white text-xs font-bold">QR Code</span>
                        </div>
                      </div>
                      <div className="bg-white/95 backdrop-blur-md rounded-xl p-5 border-2 border-white shadow-md">
                        <p className="text-[#0A1931] font-mono font-bold text-3xl text-center tracking-wider">
                          {selectedParticipant.token_kehadiran}
                        </p>
                      </div>
                    </div>

                    {/* Status Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/50 backdrop-blur-md p-5 rounded-xl border border-white/60 shadow-md">
                        <label className="text-xs text-[#4A7FA7] font-bold uppercase flex items-center gap-1 mb-2">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Verifikasi
                        </label>
                        <span className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-bold shadow-sm ${
                          selectedParticipant.status_verifikasi === 'verified'
                            ? 'bg-green-500 text-white'
                            : 'bg-yellow-400 text-yellow-900'
                        }`}>
                          {selectedParticipant.status_verifikasi === 'verified' ? (
                            <>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Verified
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              Pending
                            </>
                          )}
                        </span>
                      </div>

                      <div className="bg-white/50 backdrop-blur-md p-5 rounded-xl border border-white/60 shadow-md">
                        <label className="text-xs text-[#4A7FA7] font-bold uppercase flex items-center gap-1 mb-2">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Kehadiran
                        </label>
                        <span className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-bold shadow-sm ${
                          selectedParticipant.status_kehadiran === 'hadir'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-300 text-gray-700'
                        }`}>
                          {selectedParticipant.status_kehadiran === 'hadir' ? (
                            <>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Hadir
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                              Belum Hadir
                            </>
                          )}
                        </span>
                      </div>

                      <div className="bg-white/50 backdrop-blur-md p-5 rounded-xl border border-white/60 shadow-md">
                        <label className="text-xs text-[#4A7FA7] font-bold uppercase flex items-center gap-1 mb-2">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Sertifikat
                        </label>
                        <span className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-bold shadow-sm ${
                          selectedParticipant.sertifikat_diterbitkan
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-300 text-gray-700'
                        }`}>
                          {selectedParticipant.sertifikat_diterbitkan ? (
                            <>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                                <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                              </svg>
                              Diterbitkan
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                              </svg>
                              Belum
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-bold rounded-xl hover:from-[#4A7FA7]/90 hover:to-[#0A1931] transition-all shadow-lg hover:shadow-xl"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
