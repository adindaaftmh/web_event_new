import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import { useEvents } from "../../contexts/EventContext";
import { kategoriKegiatanService } from "../../services/apiService";

export default function AddEvent() {
  const { addEvent } = useEvents();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    judul_kegiatan: "",
    penyelenggara: "",
    lokasi_kegiatan: "",
    waktu_mulai: "",
    waktu_selesai: "",
    flyer_kegiatan: null,
    deskripsi_kegiatan: "",
    kategori: { nama_kategori: "" },
    kapasitas_peserta: "",
    harga_tiket: "",
    kontak_panitia: "",
    isFree: true,
    unlimitedParticipants: true,
    tipe_peserta: "individu",
    tickets: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    nama_tiket: "",
    harga: "",
    kuota: "",
    deskripsi: ""
  });

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await kategoriKegiatanService.getAll();
        if (response.data?.success) {
          setCategories(response.data.data);
        } else {
          console.error('Failed to load categories:', response.data?.message);
          // Fallback to hardcoded categories if API fails
          setCategories([
            { id: 1, nama_kategori: 'Olahraga' },
            { id: 2, nama_kategori: 'Edukasi' },
            { id: 3, nama_kategori: 'Seni Budaya' },
            { id: 4, nama_kategori: 'Hiburan' }
          ]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to hardcoded categories if API fails
        setCategories([
          { id: 1, nama_kategori: 'Olahraga' },
          { id: 2, nama_kategori: 'Edukasi' },
          { id: 3, nama_kategori: 'Seni Budaya' },
          { id: 4, nama_kategori: 'Hiburan' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Debug logging
      console.log('Form Data:', formData);

      // Validate form
      if (!formData.judul_kegiatan || !formData.penyelenggara || !formData.lokasi_kegiatan || !formData.waktu_mulai) {
        alert("Mohon lengkapi semua field yang wajib diisi (Judul, Penyelenggara, Lokasi, Waktu Mulai)");
        return;
      }

      if (!formData.flyer_kegiatan) {
        alert("Mohon upload flyer kegiatan");
        return;
      }

      if (!(formData.flyer_kegiatan instanceof File)) {
        alert("File flyer tidak valid. Mohon upload file gambar yang benar.");
        return;
      }

      if (!formData.kategori?.nama_kategori) {
        alert("Mohon pilih kategori kegiatan");
        return;
      }

      // Prepare data for API
      const submitData = {
        kategori: formData.kategori.nama_kategori,
        judul_kegiatan: formData.judul_kegiatan,
        penyelenggara: formData.penyelenggara,
        lokasi_kegiatan: formData.lokasi_kegiatan,
        waktu_mulai: formData.waktu_mulai,
        waktu_selesai: formData.waktu_selesai || null,
        flyer_kegiatan: formData.flyer_kegiatan,
        deskripsi_kegiatan: formData.deskripsi_kegiatan || '',
        kapasitas_peserta: formData.unlimitedParticipants ? null : (formData.kapasitas_peserta || null),
        harga_tiket: formData.isFree ? 0 : (formData.harga_tiket || 0),
        kontak_panitia: formData.kontak_panitia || null,
        tipe_peserta: formData.tipe_peserta,
        tickets: formData.tickets
      };

      console.log('Submit Data:', submitData);

      // Add event via API
      await addEvent(submitData);

      // Reset form
      setFormData({
        judul_kegiatan: "",
        penyelenggara: "",
        lokasi_kegiatan: "",
        waktu_mulai: "",
        waktu_selesai: "",
        flyer_kegiatan: null,
        deskripsi_kegiatan: "",
        kategori: { nama_kategori: "" },
        kapasitas_peserta: "",
        harga_tiket: "",
        kontak_panitia: "",
        isFree: true,
        unlimitedParticipants: true,
        tipe_peserta: "individu",
        tickets: []
      });

      alert("Event berhasil ditambahkan!");
    } catch (error) {
      console.error("Error adding event:", error);
      alert("Error: " + (error.response?.data?.message || error.message || "Gagal menambahkan event. Silakan coba lagi."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === 'kategori') {
      setFormData(prev => ({
        ...prev,
        kategori: { nama_kategori: value }
      }));
    } else if (field === 'flyer_kegiatan') {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleAddTicket = () => {
    if (!ticketForm.nama_tiket || !ticketForm.harga || !ticketForm.kuota) {
      alert("Mohon lengkapi semua field tiket (Nama, Harga, Kuota)");
      return;
    }
    
    const newTicket = {
      id: Date.now(),
      nama_tiket: ticketForm.nama_tiket,
      harga: parseInt(ticketForm.harga),
      kuota: parseInt(ticketForm.kuota),
      deskripsi: ticketForm.deskripsi
    };
    
    setFormData(prev => ({
      ...prev,
      tickets: [...prev.tickets, newTicket]
    }));
    
    setTicketForm({
      nama_tiket: "",
      harga: "",
      kuota: "",
      deskripsi: ""
    });
    
    setShowTicketForm(false);
  };

  const handleRemoveTicket = (ticketId) => {
    setFormData(prev => ({
      ...prev,
      tickets: prev.tickets.filter(ticket => ticket.id !== ticketId)
    }));
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const EventPreviewCard = () => (
    <div className="bg-white rounded-xl shadow-lg border border-[#4A7FA7]/20 overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="relative">
        {formData.flyer_kegiatan ? (
          <img
            src={URL.createObjectURL(formData.flyer_kegiatan)}
            alt="Event Flyer"
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] flex items-center justify-center">
            <svg className="w-16 h-16 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            formData.isFree
              ? 'bg-green-100 text-green-700 border-green-200'
              : 'bg-blue-100 text-blue-700 border-blue-200'
          }`}>
            {formData.isFree ? 'GRATIS' : `Rp ${parseInt(formData.harga_tiket || 0).toLocaleString()}`}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-[#0A1931] leading-tight">
            {formData.judul_kegiatan || 'Judul Event'}
          </h3>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            formData.kategori?.nama_kategori
              ? 'bg-[#4A7FA7]/10 text-[#4A7FA7] border-[#4A7FA7]/20'
              : 'bg-gray-100 text-gray-600 border-gray-200'
          }`}>
            {formData.kategori?.nama_kategori || 'Kategori'}
          </span>
        </div>

        <p className="text-sm font-semibold text-[#4A7FA7] mb-3">
          {formData.penyelenggara || 'Nama penyelenggara belum diisi'}
        </p>

        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {formData.lokasi_kegiatan || 'Lokasi belum diisi'}
          </div>

          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formData.waktu_mulai ? formatDateTime(formData.waktu_mulai) : 'Waktu belum diisi'}
          </div>

          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {formData.unlimitedParticipants ? 'Peserta tidak terbatas' : `${formData.kapasitas_peserta || 0} peserta`}
          </div>
        </div>

        {formData.deskripsi_kegiatan && (
          <p className="text-sm text-gray-700 line-clamp-2 mb-4">
            {formData.deskripsi_kegiatan}
          </p>
        )}

        {/* Tipe Peserta Badge */}
        <div className="mb-4">
          <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${
            formData.tipe_peserta === 'individu' 
              ? 'bg-blue-100 text-blue-700 border border-blue-200' 
              : 'bg-purple-100 text-purple-700 border border-purple-200'
          }`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {formData.tipe_peserta === 'individu' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              )}
            </svg>
            Pendaftaran {formData.tipe_peserta === 'individu' ? 'Individu' : 'Tim'}
          </span>
        </div>

        {/* Tickets Preview */}
        {formData.tickets.length > 0 && (
          <div className="mb-4 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-[#4A7FA7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              <span className="text-xs font-bold text-[#0A1931]">Pilihan Tiket ({formData.tickets.length})</span>
            </div>
            <div className="space-y-1.5">
              {formData.tickets.slice(0, 3).map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between text-xs">
                  <span className="text-[#4A7FA7] font-medium">{ticket.nama_tiket}</span>
                  <span className="font-bold text-[#0A1931]">Rp {ticket.harga.toLocaleString('id-ID')}</span>
                </div>
              ))}
              {formData.tickets.length > 3 && (
                <p className="text-xs text-gray-500 italic">+{formData.tickets.length - 3} tiket lainnya</p>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            Kontak: {formData.kontak_panitia || 'Belum diisi'}
          </span>
          <button className="px-4 py-2 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white text-sm font-semibold rounded-lg hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-all duration-300">
            Daftar Sekarang
          </button>
        </div>
      </div>
    </div>
  );

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

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#0A1931]">Tambah Kegiatan Baru</h1>
                <p className="text-[#4A7FA7]">Buat event baru untuk ditampilkan di homepage</p>
              </div>
            </div>
            <div className="h-1 w-32 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] rounded-full animate-pulse"></div>
          </div>

          {/* Form */}
          <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Flyer Upload - Priority Field */}
              <div>
                <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                  Upload Flyer <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-[#4A7FA7]/30 rounded-xl p-6 text-center hover:border-[#4A7FA7]/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleInputChange('flyer_kegiatan', e.target.files[0])}
                    className="hidden"
                    id="flyer-upload"
                    required
                  />
                  <label htmlFor="flyer-upload" className="cursor-pointer">
                    {formData.flyer_kegiatan ? (
                      <div className="space-y-3">
                        <img
                          src={URL.createObjectURL(formData.flyer_kegiatan)}
                          alt="Flyer Preview"
                          className="w-32 h-20 object-cover rounded-lg mx-auto border-2 border-[#4A7FA7]/20"
                        />
                        <p className="text-[#4A7FA7] font-semibold text-sm">Klik untuk mengganti flyer</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <svg className="w-12 h-12 text-[#4A7FA7]/50 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-[#4A7FA7] font-semibold text-sm">Klik untuk upload flyer</p>
                        <p className="text-xs text-gray-500">JPG, PNG, WEBP (Max 5MB)</p>
                      </div>
                    )}
                  </label>
                </div>
                <p className="text-xs text-[#4A7FA7] mt-2 italic">
                  * Upload flyer terlebih dahulu sebagai preview utama event
                </p>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                    Judul Kegiatan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.judul_kegiatan}
                    onChange={(e) => handleInputChange('judul_kegiatan', e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-[#4A7FA7]/20 rounded-xl text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors placeholder-[#4A7FA7]/50"
                    placeholder="Masukkan judul kegiatan"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                    Penyelenggara Event <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.penyelenggara}
                    onChange={(e) => handleInputChange('penyelenggara', e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-[#4A7FA7]/20 rounded-xl text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors placeholder-[#4A7FA7]/50"
                    placeholder="Nama organisasi atau instansi penyelenggara"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                    Lokasi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lokasi_kegiatan}
                    onChange={(e) => handleInputChange('lokasi_kegiatan', e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-[#4A7FA7]/20 rounded-xl text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors placeholder-[#4A7FA7]/50"
                    placeholder="Masukkan lokasi kegiatan"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                    Tanggal & Waktu Mulai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.waktu_mulai}
                    onChange={(e) => handleInputChange('waktu_mulai', e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-[#4A7FA7]/20 rounded-xl text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                    Tanggal & Waktu Selesai
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.waktu_selesai}
                    onChange={(e) => handleInputChange('waktu_selesai', e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-[#4A7FA7]/20 rounded-xl text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.kategori?.nama_kategori || ''}
                    onChange={(e) => handleInputChange('kategori', e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-[#4A7FA7]/20 rounded-xl text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors"
                    required
                    disabled={loading}
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.nama_kategori}>
                        {category.nama_kategori}
                      </option>
                    ))}
                  </select>
                  {loading && (
                    <p className="text-sm text-gray-500 mt-1">Memuat kategori...</p>
                  )}
                  {categories.length === 0 && !loading && (
                    <p className="text-sm text-red-500 mt-1">Gagal memuat kategori. Menggunakan kategori default.</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                    Kontak Panitia
                  </label>
                  <input
                    type="text"
                    value={formData.kontak_panitia}
                    onChange={(e) => handleInputChange('kontak_panitia', e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-[#4A7FA7]/20 rounded-xl text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors placeholder-[#4A7FA7]/50"
                    placeholder="Email/No. HP panitia"
                  />
                </div>
              </div>

              {/* Ticket Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#0A1931] mb-3">
                    Opsi Tiket
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={formData.isFree}
                        onChange={() => handleInputChange('isFree', true)}
                        className="mr-2 text-[#4A7FA7]"
                      />
                      <span className="text-sm">Gratis</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={!formData.isFree}
                        onChange={() => handleInputChange('isFree', false)}
                        className="mr-2 text-[#4A7FA7]"
                      />
                      <span className="text-sm">Berbayar</span>
                    </label>
                  </div>

                  {!formData.isFree && (
                    <div className="mt-3 space-y-3">
                      <input
                        type="number"
                        value={formData.harga_tiket}
                        onChange={(e) => handleInputChange('harga_tiket', e.target.value)}
                        className="w-full px-4 py-3 bg-white border-2 border-[#4A7FA7]/20 rounded-xl text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors placeholder-[#4A7FA7]/50"
                        placeholder="Masukkan harga tiket"
                        required={!formData.isFree}
                        min="0"
                      />
                      
                      {/* Informasi Komisi Admin */}
                      {formData.harga_tiket > 0 && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-[#4A7FA7]/30 rounded-xl p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-bold text-[#0A1931] mb-2">Rincian Harga</h4>
                              <div className="space-y-1.5 text-xs">
                                <div className="flex justify-between items-center">
                                  <span className="text-[#4A7FA7]">Harga Tiket:</span>
                                  <span className="font-bold text-[#0A1931]">
                                    Rp {parseInt(formData.harga_tiket).toLocaleString('id-ID')}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-[#4A7FA7]">Komisi Admin (10%):</span>
                                  <span className="font-bold text-green-600">
                                    Rp {(parseInt(formData.harga_tiket) * 0.1).toLocaleString('id-ID')}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center pt-1.5 border-t border-[#4A7FA7]/20">
                                  <span className="text-[#4A7FA7] font-semibold">Diterima Panitia:</span>
                                  <span className="font-bold text-[#0A1931]">
                                    Rp {(parseInt(formData.harga_tiket) * 0.9).toLocaleString('id-ID')}
                                  </span>
                                </div>
                              </div>
                              <p className="mt-2 text-xs text-[#4A7FA7]/80 italic">
                                * 10% dari setiap pembelian tiket menjadi pendapatan admin
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0A1931] mb-3">
                    Kapasitas Peserta
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={formData.unlimitedParticipants}
                        onChange={() => handleInputChange('unlimitedParticipants', true)}
                        className="mr-2 text-[#4A7FA7]"
                      />
                      <span className="text-sm">Tidak terbatas</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={!formData.unlimitedParticipants}
                        onChange={() => handleInputChange('unlimitedParticipants', false)}
                        className="mr-2 text-[#4A7FA7]"
                      />
                      <span className="text-sm">Terbatas</span>
                    </label>
                  </div>

                  {!formData.unlimitedParticipants && (
                    <div className="mt-3">
                      <input
                        type="number"
                        value={formData.kapasitas_peserta}
                        onChange={(e) => handleInputChange('kapasitas_peserta', e.target.value)}
                        className="w-full px-4 py-3 bg-white border-2 border-[#4A7FA7]/20 rounded-xl text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors placeholder-[#4A7FA7]/50"
                        placeholder="Jumlah maksimal peserta"
                        required={!formData.unlimitedParticipants}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Tipe Peserta */}
              <div>
                <label className="block text-sm font-semibold text-[#0A1931] mb-3">
                  Tipe Peserta <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-[#4A7FA7] hover:bg-[#4A7FA7]/5">
                    <input
                      type="radio"
                      name="tipe_peserta"
                      checked={formData.tipe_peserta === "individu"}
                      onChange={() => handleInputChange('tipe_peserta', 'individu')}
                      className="mr-3 text-[#4A7FA7]"
                    />
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#4A7FA7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="font-semibold text-[#0A1931]">Individu</span>
                    </div>
                  </label>
                  
                  <label className="flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-[#4A7FA7] hover:bg-[#4A7FA7]/5">
                    <input
                      type="radio"
                      name="tipe_peserta"
                      checked={formData.tipe_peserta === "tim"}
                      onChange={() => handleInputChange('tipe_peserta', 'tim')}
                      className="mr-3 text-[#4A7FA7]"
                    />
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#4A7FA7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="font-semibold text-[#0A1931]">Tim</span>
                    </div>
                  </label>
                </div>
                <p className="text-xs text-[#4A7FA7] mt-2">
                  {formData.tipe_peserta === "individu" 
                    ? "Pendaftaran per individu - setiap orang mendaftar sendiri" 
                    : "Pendaftaran per tim - satu pendaftaran untuk beberapa anggota tim"}
                </p>
              </div>

              {/* Pilihan Tiket */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-[#0A1931]">
                    Pilihan Tiket
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowTicketForm(!showTicketForm)}
                    className="px-4 py-2 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white text-sm font-semibold rounded-lg hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-all duration-300 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Tiket
                  </button>
                </div>

                {/* Form Tambah Tiket */}
                {showTicketForm && (
                  <div className="mb-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-[#4A7FA7]/30 space-y-3">
                    <h4 className="text-sm font-bold text-[#0A1931] mb-3">Tambah Tiket Baru</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#0A1931] mb-1">
                          Nama Tiket <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={ticketForm.nama_tiket}
                          onChange={(e) => setTicketForm({...ticketForm, nama_tiket: e.target.value})}
                          className="w-full px-3 py-2 bg-white border-2 border-[#4A7FA7]/20 rounded-lg text-sm text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors placeholder-[#4A7FA7]/50"
                          placeholder="e.g. Early Bird, Regular, VIP"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#0A1931] mb-1">
                          Harga (Rp) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={ticketForm.harga}
                          onChange={(e) => setTicketForm({...ticketForm, harga: e.target.value})}
                          className="w-full px-3 py-2 bg-white border-2 border-[#4A7FA7]/20 rounded-lg text-sm text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors placeholder-[#4A7FA7]/50"
                          placeholder="100000"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#0A1931] mb-1">
                          Kuota <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={ticketForm.kuota}
                          onChange={(e) => setTicketForm({...ticketForm, kuota: e.target.value})}
                          className="w-full px-3 py-2 bg-white border-2 border-[#4A7FA7]/20 rounded-lg text-sm text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors placeholder-[#4A7FA7]/50"
                          placeholder="50"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#0A1931] mb-1">
                          Deskripsi Singkat
                        </label>
                        <input
                          type="text"
                          value={ticketForm.deskripsi}
                          onChange={(e) => setTicketForm({...ticketForm, deskripsi: e.target.value})}
                          className="w-full px-3 py-2 bg-white border-2 border-[#4A7FA7]/20 rounded-lg text-sm text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors placeholder-[#4A7FA7]/50"
                          placeholder="Benefit tiket ini"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleAddTicket}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300"
                      >
                        Simpan Tiket
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowTicketForm(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}

                {/* Daftar Tiket */}
                {formData.tickets.length > 0 ? (
                  <div className="space-y-3">
                    {formData.tickets.map((ticket) => (
                      <div key={ticket.id} className="flex items-center justify-between p-4 bg-white border-2 border-[#4A7FA7]/20 rounded-xl hover:border-[#4A7FA7]/40 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <svg className="w-5 h-5 text-[#4A7FA7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                            <h4 className="font-bold text-[#0A1931]">{ticket.nama_tiket}</h4>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                              Rp {ticket.harga.toLocaleString('id-ID')}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-[#4A7FA7] ml-8">
                            <span>Kuota: {ticket.kuota} orang</span>
                            {ticket.deskripsi && <span className="italic">"{ticket.deskripsi}"</span>}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTicket(ticket.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                    <p className="text-sm text-gray-500">Belum ada tiket ditambahkan</p>
                    <p className="text-xs text-gray-400 mt-1">Klik tombol "Tambah Tiket" untuk menambah pilihan tiket</p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                  Deskripsi Kegiatan
                </label>
                <textarea
                  rows={4}
                  value={formData.deskripsi_kegiatan}
                  onChange={(e) => handleInputChange('deskripsi_kegiatan', e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-[#4A7FA7]/20 rounded-xl text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors placeholder-[#4A7FA7]/50 resize-none"
                  placeholder="Jelaskan detail kegiatan, tujuan, manfaat, dll"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="flex-1 px-6 py-3 bg-[#4A7FA7]/20 text-[#0A1931] font-semibold rounded-xl hover:bg-[#4A7FA7]/30 transition-colors border border-[#4A7FA7]/30"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-semibold rounded-xl hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Menyimpan..." : "Tambah Kegiatan"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <h3 className="text-lg font-bold text-[#0A1931] mb-4">Preview Event</h3>
            <p className="text-sm text-gray-600 mb-6">Begini tampilan event di homepage</p>
            <EventPreviewCard />
          </div>
        </div>
        </div>
      </div>
    </AdminLayout>
  );
}
