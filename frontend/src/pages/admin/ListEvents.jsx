import React, { useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { useEvents } from "../../contexts/EventContext";

export default function ListEvents() {
  const { events, updateEvent, deleteEvent } = useEvents();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingEvent, setEditingEvent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  // Filter events based on search and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.judul_kegiatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.lokasi_kegiatan.toLowerCase().includes(searchTerm.toLowerCase());
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

  const handleEdit = (event) => {
    setEditingEvent(event);
    setEditFormData({
      judul_kegiatan: event.judul_kegiatan,
      lokasi_kegiatan: event.lokasi_kegiatan,
      waktu_mulai: event.waktu_mulai,
      waktu_selesai: event.waktu_selesai || "",
      flyer_kegiatan: event.flyer_kegiatan,
      deskripsi_kegiatan: event.deskripsi_kegiatan || "",
      kategori: event.kategori,
      kapasitas_peserta: event.kapasitas_peserta || "",
      harga_tiket: event.harga_tiket || "",
      kontak_panitia: event.kontak_panitia || ""
    });
    setShowEditModal(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    updateEvent(editingEvent.id, editFormData);
    setShowEditModal(false);
    setEditingEvent(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus kegiatan ini?")) {
      deleteEvent(id);
    }
  };

  const exportEvents = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "ID,Judul Kegiatan,Lokasi,Tanggal,Waktu,Kategori,Kapasitas,Harga Tiket,Komisi Admin (10%),Diterima Panitia (90%),Status,Kontak Panitia,Deskripsi\n"
      + filteredEvents.map(e => {
        const harga = parseInt(e.harga_tiket || 0);
        const komisi = harga * 0.1;
        const diterimaPanitia = harga * 0.9;
        return `${e.id},"${e.judul_kegiatan}",${e.lokasi_kegiatan},${new Date(e.waktu_mulai).toLocaleDateString()},${new Date(e.waktu_mulai).toLocaleTimeString()},${e.kategori?.nama_kategori || ''},${e.kapasitas_peserta || ''},${harga},${komisi},${diterimaPanitia},${getEventStatus(e)},"${e.kontak_panitia || ''}","${e.deskripsi_kegiatan || ''}"`;
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
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0A1931] uppercase tracking-wider">Kegiatan</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0A1931] uppercase tracking-wider">Tanggal & Waktu</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0A1931] uppercase tracking-wider">Lokasi</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0A1931] uppercase tracking-wider">Kategori</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0A1931] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0A1931] uppercase tracking-wider">Kapasitas</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0A1931] uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-[#4A7FA7]">
                      Tidak ada kegiatan yang ditemukan
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50 transition-all duration-300 group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-300">
                            <img
                              src={event.flyer_kegiatan}
                              alt="Flyer"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-[#0A1931] group-hover:text-[#4A7FA7] transition-colors">
                              {event.judul_kegiatan}
                            </div>
                            {event.harga_tiket && event.harga_tiket > 0 ? (
                              <div className="text-sm space-y-0.5">
                                <div className="font-bold text-[#0A1931]">
                                  Rp {parseInt(event.harga_tiket).toLocaleString('id-ID')}
                                </div>
                                <div className="text-xs text-green-600">
                                  Komisi: Rp {(parseInt(event.harga_tiket) * 0.1).toLocaleString('id-ID')} (10%)
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-600 font-medium">Gratis</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900">
                          <div>{new Date(event.waktu_mulai).toLocaleDateString('id-ID')}</div>
                          <div className="text-sm text-gray-600">{new Date(event.waktu_mulai).toLocaleTimeString('id-ID')}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900 font-medium">{event.lokasi_kegiatan}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-[#4A7FA7]/10 text-[#0A1931] rounded-full text-sm font-semibold border border-[#4A7FA7]/30">
                          {event.kategori?.nama_kategori || 'Tidak ada kategori'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                          getEventStatus(event) === 'upcoming' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                          getEventStatus(event) === 'ongoing' ? 'bg-green-100 text-green-700 border-green-200' :
                          'bg-gray-100 text-gray-700 border-gray-200'
                        }`}>
                          {getEventStatus(event) === 'upcoming' ? 'Akan Datang' :
                           getEventStatus(event) === 'ongoing' ? 'Sedang Berlangsung' : 'Selesai'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900 font-medium">
                          {event.kapasitas_peserta ? `${event.kapasitas_peserta} orang` : 'Tidak terbatas'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(event)}
                            className="p-2 bg-[#4A7FA7]/10 text-[#0A1931] rounded-lg hover:bg-[#4A7FA7]/20 transition-all duration-300"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all duration-300"
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
                  onClick={() => setShowEditModal(false)}
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
                    <label className="block text-sm font-semibold text-[#0A1931] mb-2">Judul Kegiatan</label>
                    <input
                      type="text"
                      value={editFormData.judul_kegiatan}
                      onChange={(e) => setEditFormData({...editFormData, judul_kegiatan: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0A1931] mb-2">Lokasi</label>
                    <input
                      type="text"
                      value={editFormData.lokasi_kegiatan}
                      onChange={(e) => setEditFormData({...editFormData, lokasi_kegiatan: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-100 text-[#0A1931] font-semibold rounded-xl hover:bg-gray-200 transition-colors border border-gray-300"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-semibold rounded-xl hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Update Kegiatan
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
