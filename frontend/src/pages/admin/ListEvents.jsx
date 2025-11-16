import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import { useEvents } from "../../contexts/EventContext";
import { kategoriKegiatanService } from "../../services/apiService";
import { useCloudinaryUpload } from "../../hooks/useCloudinaryUpload";

export default function ListEvents() {
  const { events, updateEvent, deleteEvent } = useEvents();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingEvent, setEditingEvent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newFlyerPreview, setNewFlyerPreview] = useState(null);
  const [previewFlyer, setPreviewFlyer] = useState(null);
  const { uploadImage } = useCloudinaryUpload();

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

  // Filter events based on search and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.judul_kegiatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.lokasi_kegiatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.penyelenggara || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || getEventStatus(event) === statusFilter;
    const matchesCategory = categoryFilter === "all" || event.kategori?.nama_kategori === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Get event status based on date
  const getEventStatus = (event) => {
    const now = new Date();
    const eventDate = new Date(event.waktu_mulai);

    if (eventDate < now) return "completed";
    if (eventDate.toDateString() === now.toDateString()) return "ongoing";
    return "upcoming";
  };

  const getStatusBadge = (status) => {
    const badges = {
      upcoming: "bg-blue-100 text-blue-700 border-blue-200",
      ongoing: "bg-green-100 text-green-700 border-green-200",
      completed: "bg-gray-100 text-gray-700 border-gray-200"
    };
    return badges[status] || badges.upcoming;
  };

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
    // Format datetime for datetime-local input (YYYY-MM-DDTHH:mm)
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
      closeEditModal();
    } catch (error) {
      console.error("Error updating event:", error);
      alert(`Gagal memperbarui kegiatan: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus kegiatan ini?")) {
      deleteEvent(id);
    }
  };

  const exportEvents = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "ID,Judul Kegiatan,Lokasi,Waktu Mulai,Tanggal Mulai,Waktu Selesai,Tanggal Selesai,Kategori,Kapasitas,Harga Tiket,Komisi Admin (10%),Diterima Panitia (90%),Status,Kontak Panitia,Deskripsi\n"
      + filteredEvents.map(e => {
        const harga = parseInt(e.harga_tiket || 0);
        const komisi = harga * 0.1;
        const diterimaPanitia = harga * 0.9;
        const waktuSelesai = e.waktu_selesai ? new Date(e.waktu_selesai).toLocaleTimeString('id-ID') : 'Tidak diset';
        const tanggalSelesai = e.waktu_selesai ? new Date(e.waktu_selesai).toLocaleDateString('id-ID') : 'Tidak diset';
        return `${e.id},"${e.judul_kegiatan}",${e.lokasi_kegiatan},${new Date(e.waktu_mulai).toLocaleTimeString('id-ID')},${new Date(e.waktu_mulai).toLocaleDateString('id-ID')},${waktuSelesai},${tanggalSelesai},${e.kategori?.nama_kategori || ''},${e.kapasitas_peserta || ''},${harga},${komisi},${diterimaPanitia},${getEventStatus(e)},"${e.kontak_panitia || ''}","${e.deskripsi_kegiatan || ''}"`;
      }).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "daftar_kegiatan.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[#0A1931] mb-2">Daftar Kegiatan</h1>
              <p className="text-[#4A7FA7] text-sm lg:text-base">Kelola semua kegiatan yang telah dibuat</p>
              <div className="h-1 w-32 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
          <button
            onClick={exportEvents}
            className="px-6 py-3 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-semibold rounded-xl hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#0A1931] mb-2">Cari</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari judul atau lokasi..."
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0A1931] mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors"
              >
                <option value="all">Semua Status</option>
                <option value="upcoming">Akan Datang</option>
                <option value="ongoing">Sedang Berlangsung</option>
                <option value="completed">Selesai</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0A1931] mb-2">Kategori</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors"
              >
                <option value="all">Semua Kategori</option>
                <option value="Olahraga">Olahraga</option>
                <option value="Hiburan">Hiburan</option>
                <option value="Edukasi">Edukasi</option>
                <option value="Seni Budaya">Seni Budaya</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setCategoryFilter("all");
                }}
                className="w-full px-4 py-2 bg-[#4A7FA7]/20 text-[#0A1931] font-semibold rounded-lg hover:bg-[#4A7FA7]/30 transition-colors border border-[#4A7FA7]/30"
              >
                Reset Filter
              </button>
            </div>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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
                  <th className="px-4 py-3 text-center text-xs font-bold text-[#0A1931] uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-[#4A7FA7] font-medium">Tidak ada kegiatan yang ditemukan</p>
                      <p className="text-gray-400 text-sm mt-1">Coba ubah filter pencarian</p>
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((event, index) => (
                    <tr key={event.id} className="hover:bg-blue-50/30 transition-colors duration-200 group">
                      {/* No */}
                      <td className="px-4 py-4 text-center">
                        <span className="font-bold text-[#0A1931] text-sm">
                          {index + 1}
                        </span>
                      </td>
                      
                      {/* Kegiatan */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 cursor-pointer hover:border-[#4A7FA7] transition-all duration-200 group-hover:shadow-md"
                            onClick={() => setPreviewFlyer(event.flyer_kegiatan)}
                          >
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
                            <p className="text-xs text-[#4A7FA7] font-medium line-clamp-1" title={event.penyelenggara}>
                              {event.penyelenggara || 'Penyelenggara belum diisi'}
                            </p>
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
                            <span className="text-gray-700 font-medium">{new Date(event.waktu_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs">
                            <svg className="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            <span className="text-gray-600 line-clamp-1" title={event.lokasi_kegiatan}>{event.lokasi_kegiatan}</span>
                          </div>
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
                          getEventStatus(event) === 'upcoming' ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-300/50 shadow-sm' :
                          getEventStatus(event) === 'ongoing' ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-300/50 shadow-sm' :
                          'bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 border-violet-300/50 shadow-sm'
                        }`}>
                          {getEventStatus(event) === 'upcoming' ? 'Akan Datang' :
                           getEventStatus(event) === 'ongoing' ? 'Berlangsung' : 'Selesai'}
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

                {editFormData.tickets?.length > 0 && (
                  <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl space-y-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#4A7FA7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                      <h4 className="text-sm font-bold text-[#0A1931]">Daftar Tiket ({editFormData.tickets.length})</h4>
                    </div>
                    <div className="space-y-2">
                      {editFormData.tickets.map((ticket, index) => (
                        <div key={ticket.id || index} className="flex items-center justify-between bg-white rounded-lg px-4 py-2 border border-[#4A7FA7]/20">
                          <div>
                            <div className="font-semibold text-[#0A1931]">{ticket.nama_tiket}</div>
                            {ticket.deskripsi && (
                              <div className="text-xs text-gray-500 italic">{ticket.deskripsi}</div>
                            )}
                          </div>
                          <div className="text-xs text-right text-[#4A7FA7] space-y-0.5">
                            <div className="font-semibold">Rp {Number(ticket.harga || 0).toLocaleString('id-ID')}</div>
                            <div>Kuota: {ticket.kuota}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-[#4A7FA7] italic">Perubahan detail tiket belum tersedia di menu ini.</p>
                  </div>
                )}

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

        {/* Flyer Preview Modal */}
        {previewFlyer && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setPreviewFlyer(null)}
          >
            <div className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
              <button
                onClick={() => setPreviewFlyer(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-gray-800 hover:text-red-600 transition-all shadow-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="p-4">
                <img
                  src={previewFlyer}
                  alt="Flyer Preview"
                  className="w-full h-auto rounded-lg shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </AdminLayout>
  );
}
