 import React, { useState, useMemo, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import { useEvents } from "../../contexts/EventContext";
import { kategoriKegiatanService } from "../../services/apiService";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { useCloudinaryUpload } from "../../hooks/useCloudinaryUpload";

export default function EventRecap() {
  const { events, updateEvent, deleteEvent, refreshEvents } = useEvents();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly' or 'yearly'
  
  // Filter states for detailed event list
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'upcoming', 'completed'
  const [categoryFilter, setCategoryFilter] = useState('all');

  // CRUD states
  const [editingEvent, setEditingEvent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newFlyerPreview, setNewFlyerPreview] = useState(null);
  const { uploadImage } = useCloudinaryUpload();

  // Calculate event statistics
  const stats = useMemo(() => {
    const filteredEvents = events.filter(event => {
      const eventDate = new Date(event.waktu_mulai);
      if (viewMode === 'yearly') {
        return eventDate.getFullYear() === selectedYear;
      } else {
        return eventDate.getMonth() + 1 === selectedMonth && eventDate.getFullYear() === selectedYear;
      }
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
  }, [events, selectedMonth, selectedYear, viewMode]);

  // Get unique categories for filter
  const uniqueCategories = useMemo(() => {
    const categories = new Set();
    events.forEach(event => {
      if (event.kategori?.nama_kategori) {
        categories.add(event.kategori.nama_kategori);
      }
    });
    return Array.from(categories).sort();
  }, [events]);

  // Load categories for edit form
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await kategoriKegiatanService.getAll();
        if (response.data?.success) {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Apply additional filters to the detailed event list
  const filteredDetailedEvents = useMemo(() => {
    return stats.filteredEvents.filter(event => {
      // Search filter
      const matchesSearch = event.judul_kegiatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.penyelenggara && event.penyelenggara.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Status filter
      const eventDate = new Date(event.waktu_mulai);
      const isCompleted = eventDate < new Date();
      const matchesStatus = 
        statusFilter === 'all' ||
        (statusFilter === 'completed' && isCompleted) ||
        (statusFilter === 'upcoming' && !isCompleted);
      
      // Category filter
      const matchesCategory = 
        categoryFilter === 'all' ||
        event.kategori?.nama_kategori === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [stats.filteredEvents, searchTerm, statusFilter, categoryFilter]);

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
  };

  // CRUD Functions
  const normalizeTickets = (tickets) => {
    if (Array.isArray(tickets)) {
      return tickets;
    }
    if (typeof tickets === "string" && tickets.trim() !== "") {
      try {
        return JSON.parse(tickets);
      } catch (error) {
        console.warn("Gagal mengonversi data tiket kegiatan:", error);
      }
    }
    return [];
  };

  const handleEdit = (event) => {
    if (newFlyerPreview) {
      URL.revokeObjectURL(newFlyerPreview);
      setNewFlyerPreview(null);
    }
    setEditingEvent(event);
    
    const formatDateTime = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const tickets = normalizeTickets(event.tickets);

    setEditFormData({
      judul_kegiatan: event.judul_kegiatan || "",
      penyelenggara: event.penyelenggara || "",
      lokasi_kegiatan: event.lokasi_kegiatan || "",
      waktu_mulai: formatDateTime(event.waktu_mulai),
      waktu_selesai: formatDateTime(event.waktu_selesai),
      deskripsi_kegiatan: event.deskripsi_kegiatan || "",
      kategori: event.kategori?.nama_kategori || "",
      kapasitas_peserta: event.kapasitas_peserta || "",
      harga_tiket: event.harga_tiket && parseFloat(event.harga_tiket) > 0 ? parseInt(event.harga_tiket, 10) : "",
      kontak_panitia: event.kontak_panitia || "",
      tipe_peserta: event.tipe_peserta || "individu",
      isFree: !event.harga_tiket || parseFloat(event.harga_tiket) === 0,
      unlimitedParticipants: !event.kapasitas_peserta,
      tickets,
      newFlyer: null,
      existingFlyer: event.flyer_kegiatan || null,
    });
    setShowEditModal(true);
  };

  const handleFlyerChange = async (file) => {
    if (newFlyerPreview) {
      URL.revokeObjectURL(newFlyerPreview);
      setNewFlyerPreview(null);
    }

    if (!file) {
      setEditFormData((prev) => ({
        ...prev,
        newFlyer: null,
        newFlyerUrl: null,
      }));
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setNewFlyerPreview(localPreview);

    try {
      const result = await uploadImage(file, {
        folder: "events/flyers",
      });

      setEditFormData((prev) => ({
        ...prev,
        newFlyer: file,
        newFlyerUrl: result.url,
      }));
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      setEditFormData((prev) => ({
        ...prev,
        newFlyer: null,
        newFlyerUrl: null,
      }));
      alert(error?.message || "Gagal upload ke Cloudinary. Silakan coba lagi.");
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingEvent(null);
    setEditFormData({});
    if (newFlyerPreview) {
      URL.revokeObjectURL(newFlyerPreview);
      setNewFlyerPreview(null);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingEvent) return;

    try {
      setIsUpdating(true);

      const kapasitasValue = editFormData.unlimitedParticipants ? null : Number(editFormData.kapasitas_peserta);
      const hargaValue = editFormData.isFree ? 0 : Number(editFormData.harga_tiket);

      const payload = {
        kategori: editFormData.kategori,
        judul_kegiatan: editFormData.judul_kegiatan,
        penyelenggara: editFormData.penyelenggara,
        deskripsi_kegiatan: editFormData.deskripsi_kegiatan,
        lokasi_kegiatan: editFormData.lokasi_kegiatan,
        waktu_mulai: editFormData.waktu_mulai,
        waktu_selesai: editFormData.waktu_selesai || null,
        kapasitas_peserta: editFormData.unlimitedParticipants ? null : (Number.isFinite(kapasitasValue) && kapasitasValue > 0 ? kapasitasValue : null),
        harga_tiket: editFormData.isFree ? 0 : (Number.isFinite(hargaValue) && hargaValue >= 0 ? hargaValue : 0),
        kontak_panitia: editFormData.kontak_panitia || null,
        tipe_peserta: editFormData.tipe_peserta || 'individu',
        tickets: editFormData.tickets?.length ? editFormData.tickets : [],
      };

      if (editFormData.newFlyerUrl) {
        payload.flyer_kegiatan = editFormData.newFlyerUrl;
      }

      await updateEvent(editingEvent.id, payload);
      await refreshEvents();
      closeEditModal();
      alert('Kegiatan berhasil diperbarui!');
    } catch (error) {
      console.error("Error updating event:", error);
      alert(`Gagal memperbarui kegiatan: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus kegiatan ini?")) {
      try {
        await deleteEvent(id);
        await refreshEvents();
        alert('Kegiatan berhasil dihapus!');
      } catch (error) {
        console.error("Error deleting event:", error);
        alert(`Gagal menghapus kegiatan: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const exportRecap = () => {
    const headers = [
      'ID',
      'Judul Kegiatan',
      'Penyelenggara',
      'Lokasi',
      'Tanggal Mulai',
      'Waktu Mulai',
      'Tanggal Selesai',
      'Waktu Selesai',
      'Kategori',
      'Kapasitas',
      'Harga Tiket',
      'Kontak Panitia',
      'Tipe Peserta',
      'Status',
      'Deskripsi'
    ];

    const csvRows = [
      headers.join(','),
      ...filteredDetailedEvents.map(e => {
        const harga = parseFloat(e.harga_tiket) || 0;
        const tanggalMulai = new Date(e.waktu_mulai).toLocaleDateString('id-ID');
        const waktuMulai = new Date(e.waktu_mulai).toLocaleTimeString('id-ID');
        const tanggalSelesai = e.waktu_selesai ? new Date(e.waktu_selesai).toLocaleDateString('id-ID') : '';
        const waktuSelesai = e.waktu_selesai ? new Date(e.waktu_selesai).toLocaleTimeString('id-ID') : '';
        const status = new Date(e.waktu_mulai) < new Date() ? 'Selesai' : 'Akan Datang';
        const deskripsi = (e.deskripsi_kegiatan || '').replace(/"/g, '""'); // Escape quotes for CSV
        
        return [
          e.id,
          `"${e.judul_kegiatan}"`,
          `"${e.penyelenggara || ''}"`,
          `"${e.lokasi_kegiatan}"`,
          tanggalMulai,
          waktuMulai,
          tanggalSelesai,
          waktuSelesai,
          `"${e.kategori?.nama_kategori || ''}"`,
          e.kapasitas_peserta || 'Tidak Terbatas',
          harga,
          `"${e.kontak_panitia || ''}"`,
          e.tipe_peserta || 'individu',
          status,
          `"${deskripsi}"`
        ].join(',');
      })
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    const filename = viewMode === 'yearly' 
      ? `rekap_kegiatan_${selectedYear}.csv`
      : `rekap_kegiatan_${selectedMonth}_${selectedYear}.csv`;
    
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Colors for charts - Soft and consistent palette
  const COLORS = [
    '#60A5FA', // Soft blue
    '#34D399', // Soft emerald
    '#A78BFA', // Soft violet
    '#F472B6', // Soft pink
    '#FBBF24', // Soft amber
    '#FB923C', // Soft orange
  ];

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
              <p className="text-[#4A7FA7] text-sm lg:text-base">
                {viewMode === 'yearly' ? 'Statistik dan analisis kegiatan setahun penuh' : 'Statistik dan analisis kegiatan per bulan'}
              </p>
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
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#0A1931] mb-3">Tampilan Data</label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  checked={viewMode === 'monthly'}
                  onChange={() => setViewMode('monthly')}
                  className="w-4 h-4 text-[#4A7FA7] border-gray-300 focus:ring-[#4A7FA7]"
                />
                <span className="ml-2 text-sm text-[#0A1931] font-medium">Per Bulan</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  checked={viewMode === 'yearly'}
                  onChange={() => setViewMode('yearly')}
                  className="w-4 h-4 text-[#4A7FA7] border-gray-300 focus:ring-[#4A7FA7]"
                />
                <span className="ml-2 text-sm text-[#0A1931] font-medium">Setahun Penuh</span>
              </label>
            </div>
          </div>

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

            {viewMode === 'monthly' && (
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
            )}

            <div className="flex items-end">
              <div className="w-full text-center p-4 bg-[#4A7FA7]/10 rounded-lg border border-[#4A7FA7]/30">
                <p className="text-sm text-[#4A7FA7] mb-1">
                  {viewMode === 'yearly' ? `Total Kegiatan Tahun ${selectedYear}` : 'Total Kegiatan Bulan Ini'}
                </p>
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
                <p className="text-green-600 text-sm font-semibold">
                  {viewMode === 'yearly' ? `Tahun ${selectedYear}` : 'Bulan ini'}
                </p>
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
            {stats.monthlyTrend && stats.monthlyTrend.length > 0 ? (
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
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                <p className="font-medium">Tidak ada data untuk ditampilkan</p>
              </div>
            )}
          </div>

          {/* Category Distribution Chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#0A1931]">Distribusi Kategori</h2>
              <p className="text-[#4A7FA7] text-sm mt-1">Kegiatan berdasarkan kategori</p>
            </div>
            {Object.keys(stats.categoryStats).length > 0 ? (
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
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                <p className="font-medium">Tidak ada data kategori</p>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Event List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#0A1931]">
                  Detail Kegiatan {viewMode === 'yearly' ? `Tahun ${selectedYear}` : new Date(selectedYear, selectedMonth - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </h3>
                <p className="text-sm text-[#4A7FA7] mt-1">Daftar lengkap semua kegiatan pada periode ini</p>
              </div>
              <div className="px-4 py-2 bg-[#4A7FA7] text-white rounded-lg font-semibold">
                {filteredDetailedEvents.length} / {stats.filteredEvents.length} Kegiatan
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="p-6 border-b border-gray-200 bg-gray-50/50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2 relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Cari judul kegiatan atau penyelenggara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors"
                />
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors"
                >
                  <option value="all">Semua Status</option>
                  <option value="upcoming">Akan Datang</option>
                  <option value="completed">Selesai</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors"
                >
                  <option value="all">Semua Kategori</option>
                  {uniqueCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reset Button - Show only when filters are active */}
            {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all') && (
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset Filter
                </button>
                <span className="text-sm text-gray-600">
                  Menampilkan {filteredDetailedEvents.length} dari {stats.filteredEvents.length} kegiatan
                </span>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-[#4A7FA7]/20">
                <tr>
                  <th className="px-4 py-3 text-center text-xs font-bold text-[#0A1931] uppercase tracking-wider">No</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#0A1931] uppercase tracking-wider">Kegiatan</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#0A1931] uppercase tracking-wider">Waktu & Lokasi</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-[#0A1931] uppercase tracking-wider">Kategori</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-[#0A1931] uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-[#0A1931] uppercase tracking-wider">Harga</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-[#0A1931] uppercase tracking-wider">Kapasitas</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-[#0A1931] uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDetailedEvents.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-[#4A7FA7] font-medium">Tidak ada kegiatan yang sesuai dengan filter</p>
                      <p className="text-gray-400 text-sm mt-1">Coba ubah filter pencarian atau reset filter</p>
                    </td>
                  </tr>
                ) : (
                  filteredDetailedEvents.map((event, index) => (
                    <tr key={event.id} className="hover:bg-blue-50/30 transition-colors duration-200 group">
                      {/* No */}
                      <td className="px-4 py-4 text-center">
                        <span className="font-bold text-[#0A1931] text-sm">{index + 1}</span>
                      </td>

                      {/* Kegiatan */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 group-hover:border-[#4A7FA7] transition-all duration-200 group-hover:shadow-md">
                            <img
                              src={event.flyer_kegiatan}
                              alt="Flyer"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                              }}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-[#0A1931] text-sm line-clamp-2 leading-snug mb-1" title={event.judul_kegiatan}>
                              {event.judul_kegiatan}
                            </h4>
                            <p className="text-xs text-[#4A7FA7] font-medium line-clamp-1 mb-1" title={event.penyelenggara}>
                              <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              {event.penyelenggara || 'Penyelenggara belum diisi'}
                            </p>
                            {event.tipe_peserta && (
                              <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                {event.tipe_peserta === 'individu' ? 'Individu' : event.tipe_peserta === 'tim' ? 'Tim' : 'Campuran'}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Waktu & Lokasi */}
                      <td className="px-4 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-xs">
                            <svg className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <div>
                              <div className="text-gray-700 font-medium">
                                {new Date(event.waktu_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </div>
                              <div className="text-gray-500 text-[10px]">
                                {new Date(event.waktu_mulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                {event.waktu_selesai && ` - ${new Date(event.waktu_selesai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs">
                            <svg className="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            <span className="text-gray-600 line-clamp-1" title={event.lokasi_kegiatan}>
                              {event.lokasi_kegiatan}
                            </span>
                          </div>
                          {event.kontak_panitia && (
                            <div className="flex items-center gap-1.5 text-xs">
                              <svg className="w-3.5 h-3.5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <span className="text-gray-600 line-clamp-1" title={event.kontak_panitia}>
                                {event.kontak_panitia}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Kategori */}
                      <td className="px-4 py-4 text-center">
                        <span className="inline-block px-3 py-1.5 bg-gradient-to-r from-[#4A7FA7]/10 to-[#1A3D63]/10 text-[#0A1931] rounded-full text-xs font-bold border border-[#4A7FA7]/30">
                          {event.kategori?.nama_kategori || 'N/A'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold border ${
                          new Date(event.waktu_mulai) < new Date()
                            ? 'bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 border-violet-300/50 shadow-sm'
                            : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-300/50 shadow-sm'
                        }`}>
                          {new Date(event.waktu_mulai) < new Date() ? 'Selesai' : 'Akan Datang'}
                        </span>
                      </td>

                      {/* Harga */}
                      <td className="px-4 py-4 text-right">
                        {event.harga_tiket && event.harga_tiket > 0 ? (
                          <div>
                            <div className="font-bold text-[#0A1931] text-sm">
                              Rp {parseInt(event.harga_tiket).toLocaleString('id-ID')}
                            </div>
                            <div className="text-xs text-green-600 font-medium">
                              Komisi: Rp {(parseInt(event.harga_tiket) * 0.1).toLocaleString('id-ID')}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-block px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold text-xs">
                            GRATIS
                          </span>
                        )}
                      </td>

                      {/* Kapasitas */}
                      <td className="px-4 py-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          <svg className="w-4 h-4 text-[#4A7FA7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="text-gray-900 font-medium text-sm">
                            {event.kapasitas_peserta ? `${event.kapasitas_peserta}` : '∞'}
                          </span>
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="px-4 py-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(event)}
                            className="p-2 bg-[#4A7FA7] text-white rounded-lg hover:bg-[#1A3D63] transition-all duration-200 shadow-sm hover:shadow"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 shadow-sm hover:shadow"
                            title="Hapus"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#0A1931]">Edit Kegiatan</h2>
                <button
                  onClick={closeEditModal}
                  className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-[#0A1931] hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                      Judul Kegiatan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.judul_kegiatan || ""}
                      onChange={(e) => setEditFormData({...editFormData, judul_kegiatan: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors placeholder:text-gray-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                      Penyelenggara Event <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.penyelenggara || ""}
                      onChange={(e) => setEditFormData({...editFormData, penyelenggara: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors placeholder:text-gray-400"
                      placeholder="Nama organisasi atau instansi penyelenggara"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                      Kategori <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editFormData.kategori || ""}
                      onChange={(e) => setEditFormData({...editFormData, kategori: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors"
                      required
                      disabled={isLoadingCategories && categories.length === 0}
                    >
                      <option value="">Pilih Kategori</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.nama_kategori}>
                          {category.nama_kategori}
                        </option>
                      ))}
                      {editFormData.kategori && !categories.some((category) => category.nama_kategori === editFormData.kategori) && (
                        <option value={editFormData.kategori}>{editFormData.kategori}</option>
                      )}
                    </select>
                    {isLoadingCategories && (
                      <p className="text-xs text-gray-500 mt-1">Memuat kategori...</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                      Lokasi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.lokasi_kegiatan || ""}
                      onChange={(e) => setEditFormData({...editFormData, lokasi_kegiatan: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors placeholder:text-gray-400"
                      placeholder="Lokasi kegiatan berlangsung"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                      Waktu Mulai <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={editFormData.waktu_mulai || ""}
                      onChange={(e) => setEditFormData({...editFormData, waktu_mulai: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0A1931] mb-2">Waktu Selesai</label>
                    <input
                      type="datetime-local"
                      value={editFormData.waktu_selesai || ""}
                      onChange={(e) => setEditFormData({...editFormData, waktu_selesai: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-1 italic">Opsional - Kosongkan jika tidak ada waktu selesai</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#0A1931] mb-2">Status Harga</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          checked={!!editFormData.isFree}
                          onChange={() => setEditFormData({...editFormData, isFree: true, harga_tiket: ""})}
                        />
                        Gratis
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          checked={!editFormData.isFree}
                          onChange={() => setEditFormData({...editFormData, isFree: false})}
                        />
                        Berbayar
                      </label>
                    </div>
                    {!editFormData.isFree && (
                      <input
                        type="number"
                        min="0"
                        value={editFormData.harga_tiket ?? ""}
                        onChange={(e) => setEditFormData({...editFormData, harga_tiket: e.target.value})}
                        className="mt-3 w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors placeholder:text-gray-400"
                        placeholder="Harga tiket dalam Rupiah"
                        required
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0A1931] mb-2">Kapasitas Peserta</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          checked={!!editFormData.unlimitedParticipants}
                          onChange={() => setEditFormData({...editFormData, unlimitedParticipants: true, kapasitas_peserta: ""})}
                        />
                        Tidak terbatas
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          checked={!editFormData.unlimitedParticipants}
                          onChange={() => setEditFormData({...editFormData, unlimitedParticipants: false})}
                        />
                        Batasi jumlah peserta
                      </label>
                    </div>
                    {!editFormData.unlimitedParticipants && (
                      <input
                        type="number"
                        min="1"
                        value={editFormData.kapasitas_peserta ?? ""}
                        onChange={(e) => setEditFormData({...editFormData, kapasitas_peserta: e.target.value})}
                        className="mt-3 w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors placeholder:text-gray-400"
                        placeholder="Jumlah maksimal peserta"
                        required
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#0A1931] mb-2">Tipe Peserta</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name="tipe_peserta"
                          value="individu"
                          checked={editFormData.tipe_peserta === "individu"}
                          onChange={() => setEditFormData({...editFormData, tipe_peserta: "individu"})}
                        />
                        Individu
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name="tipe_peserta"
                          value="tim"
                          checked={editFormData.tipe_peserta === "tim"}
                          onChange={() => setEditFormData({...editFormData, tipe_peserta: "tim"})}
                        />
                        Tim
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0A1931] mb-2">Kontak Panitia</label>
                    <input
                      type="text"
                      value={editFormData.kontak_panitia || ""}
                      onChange={(e) => setEditFormData({...editFormData, kontak_panitia: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors placeholder:text-gray-400"
                      placeholder="Email atau nomor telepon panitia"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0A1931] mb-2">Deskripsi Kegiatan</label>
                  <textarea
                    rows={4}
                    value={editFormData.deskripsi_kegiatan || ""}
                    onChange={(e) => setEditFormData({...editFormData, deskripsi_kegiatan: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors placeholder:text-gray-400 resize-none"
                    placeholder="Ringkasan kegiatan, tujuan, dan informasi penting lainnya"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0A1931] mb-2">Flyer Kegiatan</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="border-2 border-dashed border-[#4A7FA7]/30 rounded-xl p-4 text-center hover:border-[#4A7FA7]/50 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          id="edit-flyer-upload"
                          className="hidden"
                          onChange={(e) => handleFlyerChange(e.target.files?.[0] || null)}
                        />
                        <label htmlFor="edit-flyer-upload" className="cursor-pointer space-y-2">
                          {editFormData.newFlyer ? (
                            <>
                              <p className="text-sm font-semibold text-[#4A7FA7]">File baru dipilih</p>
                              <p className="text-xs text-gray-500">{editFormData.newFlyer.name}</p>
                              <p className="text-xs text-gray-400">Klik untuk mengganti</p>
                            </>
                          ) : (
                            <>
                              <svg className="w-10 h-10 text-[#4A7FA7]/60 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              <p className="text-sm font-semibold text-[#4A7FA7]">Klik untuk upload flyer baru</p>
                              <p className="text-xs text-gray-500">JPG, PNG, WEBP (maks. 5MB)</p>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                    {(newFlyerPreview || editFormData.existingFlyer) && (
                      <div className="rounded-xl overflow-hidden border border-gray-200">
                        <img
                          src={newFlyerPreview || editFormData.existingFlyer}
                          alt="Preview Flyer"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="flex-1 px-6 py-3 bg-gray-100 text-[#0A1931] font-semibold rounded-xl hover:bg-gray-200 transition-colors border border-gray-300"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-semibold rounded-xl hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? "Menyimpan..." : "Update Kegiatan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        </div>
      </div>
    </AdminLayout>
  );
}
