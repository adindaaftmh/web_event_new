import React, { useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { useEvents } from "../../contexts/EventContext";

export default function AddEvent() {
  const { addEvent } = useEvents();
  const [formData, setFormData] = useState({
    judul_kegiatan: "",
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
    unlimitedParticipants: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Debug logging
      console.log('Form Data:', formData);

      // Validate form
      if (!formData.judul_kegiatan || !formData.lokasi_kegiatan || !formData.waktu_mulai) {
        alert("Mohon lengkapi semua field yang wajib diisi (Judul, Lokasi, Waktu Mulai)");
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
        lokasi_kegiatan: formData.lokasi_kegiatan,
        waktu_mulai: formData.waktu_mulai,
        waktu_selesai: formData.waktu_selesai || null,
        flyer_kegiatan: formData.flyer_kegiatan,
        deskripsi_kegiatan: formData.deskripsi_kegiatan || '',
        kapasitas_peserta: formData.unlimitedParticipants ? null : (formData.kapasitas_peserta || null),
        harga_tiket: formData.isFree ? 0 : (formData.harga_tiket || 0),
        kontak_panitia: formData.kontak_panitia || null,
      };

      console.log('Submit Data:', submitData);

      // Add event via API
      await addEvent(submitData);

      // Reset form
      setFormData({
        judul_kegiatan: "",
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
        unlimitedParticipants: true
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
        flyer_kegiatan: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
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
                  >
                    <option value="">Pilih Kategori</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Konser">Konser</option>
                    <option value="Pelatihan">Pelatihan</option>
                    <option value="Festival">Festival</option>
                    <option value="Konferensi">Konferensi</option>
                    <option value="Webinar">Webinar</option>
                    <option value="Kompetisi">Kompetisi</option>
                    <option value="Pameran">Pameran</option>
                  </select>
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
                    <div className="mt-3">
                      <input
                        type="number"
                        value={formData.harga_tiket}
                        onChange={(e) => handleInputChange('harga_tiket', e.target.value)}
                        className="w-full px-4 py-3 bg-white border-2 border-[#4A7FA7]/20 rounded-xl text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors placeholder-[#4A7FA7]/50"
                        placeholder="Masukkan harga tiket"
                        required={!formData.isFree}
                      />
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

              {/* Flyer Upload */}
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
                        <p className="text-[#4A7FA7] font-semibold">Klik untuk mengganti flyer</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <svg className="w-12 h-12 text-[#4A7FA7]/50 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-[#4A7FA7] font-semibold">Klik untuk upload flyer</p>
                        <p className="text-sm text-gray-500">Format: JPG, PNG, WEBP (Max 5MB)</p>
                      </div>
                    )}
                  </label>
                </div>
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
