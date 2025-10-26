import React, { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { useEvents } from "../contexts/EventContext";

export default function AdminEvents() {
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    judul_kegiatan: "",
    lokasi_kegiatan: "",
    waktu_mulai: "",
    flyer_kegiatan: "",
    kategori: { nama_kategori: "" },
    tickets: []
  });

  const handleOpenModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        judul_kegiatan: event.judul_kegiatan,
        lokasi_kegiatan: event.lokasi_kegiatan,
        waktu_mulai: event.waktu_mulai,
        flyer_kegiatan: event.flyer_kegiatan,
        kategori: event.kategori,
        tickets: event.tickets || []
      });
    } else {
      setEditingEvent(null);
      setFormData({
        judul_kegiatan: "",
        lokasi_kegiatan: "",
        waktu_mulai: "",
        flyer_kegiatan: "",
        kategori: { nama_kategori: "" },
        tickets: []
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingEvent) {
      // Update existing event
      updateEvent(editingEvent.id, formData);
    } else {
      // Add new event
      addEvent(formData);
    }

    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus event ini?")) {
      deleteEvent(id);
    }
  };

  const exportEventsCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "ID,Judul Kegiatan,Lokasi,Tanggal,Waktu,Kategori,Flyer\n"
      + events.map(e => `${e.id},"${e.judul_kegiatan}",${e.lokasi_kegiatan},${new Date(e.waktu_mulai).toLocaleDateString()},${new Date(e.waktu_mulai).toLocaleTimeString()},${e.kategori?.nama_kategori || ''},${e.flyer_kegiatan}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "events_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Ticket management functions
  const addTicket = () => {
    const newTicket = {
      id: Date.now(),
      name: "",
      price: 0,
      features: [""],
      quota: 0,
      available: 0
    };
    setFormData({
      ...formData,
      tickets: [...formData.tickets, newTicket]
    });
  };

  const removeTicket = (ticketId) => {
    setFormData({
      ...formData,
      tickets: formData.tickets.filter(t => t.id !== ticketId)
    });
  };

  const updateTicket = (ticketId, field, value) => {
    setFormData({
      ...formData,
      tickets: formData.tickets.map(ticket =>
        ticket.id === ticketId ? { ...ticket, [field]: value } : ticket
      )
    });
  };

  const addFeature = (ticketId) => {
    setFormData({
      ...formData,
      tickets: formData.tickets.map(ticket =>
        ticket.id === ticketId 
          ? { ...ticket, features: [...ticket.features, ""] }
          : ticket
      )
    });
  };

  const removeFeature = (ticketId, featureIndex) => {
    setFormData({
      ...formData,
      tickets: formData.tickets.map(ticket =>
        ticket.id === ticketId 
          ? { ...ticket, features: ticket.features.filter((_, idx) => idx !== featureIndex) }
          : ticket
      )
    });
  };

  const updateFeature = (ticketId, featureIndex, value) => {
    setFormData({
      ...formData,
      tickets: formData.tickets.map(ticket =>
        ticket.id === ticketId 
          ? {
              ...ticket,
              features: ticket.features.map((feature, idx) =>
                idx === featureIndex ? value : feature
              )
            }
          : ticket
      )
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0A1931]">Event Management</h1>
            <p className="text-[#4A7FA7] mt-1">Kelola semua event yang akan ditampilkan di homepage</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportEventsCSV}
              className="px-6 py-3 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-semibold rounded-xl hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="px-6 py-3 bg-gradient-to-r from-[#B3CFE5] to-[#4A7FA7] text-[#0A1931] font-semibold rounded-xl hover:from-[#4A7FA7] hover:to-[#0A1931] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Event
            </button>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#4A7FA7]/10 to-[#1A3D63]/10 border-b border-white/20">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0A1931] uppercase tracking-wider">Event Name</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0A1931] uppercase tracking-wider">Tanggal & Waktu</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0A1931] uppercase tracking-wider">Lokasi</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0A1931] uppercase tracking-wider">Kategori</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0A1931] uppercase tracking-wider">Flyer</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0A1931] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-white/20 transition-all duration-300 group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#0A1931] group-hover:text-[#4A7FA7] transition-colors">{event.judul_kegiatan}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[#4A7FA7]">
                        <div>{new Date(event.waktu_mulai).toLocaleDateString('id-ID')}</div>
                        <div className="text-sm">{new Date(event.waktu_mulai).toLocaleTimeString('id-ID')}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#4A7FA7] font-medium">{event.lokasi_kegiatan}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-gradient-to-r from-[#4A7FA7]/20 to-[#1A3D63]/20 text-[#0A1931] rounded-full text-sm font-semibold border border-[#4A7FA7]/30">
                        {event.kategori?.nama_kategori || 'Tidak ada kategori'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-[#4A7FA7]/20">
                        <img
                          src={event.flyer_kegiatan}
                          alt="Flyer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenModal(event)}
                          className="p-3 bg-gradient-to-r from-[#4A7FA7]/20 to-[#1A3D63]/20 text-[#0A1931] rounded-xl hover:from-[#4A7FA7]/30 hover:to-[#0A1931]/30 transition-all duration-300 shadow-lg hover:shadow-xl group"
                          title="Edit"
                        >
                          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="p-3 bg-gradient-to-r from-red-400/20 to-red-600/20 text-red-600 rounded-xl hover:from-red-400/30 hover:to-red-600/30 transition-all duration-300 shadow-lg hover:shadow-xl group"
                          title="Delete"
                        >
                          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Form */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#F6FAFD]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#0A1931]">
                  {editingEvent ? "Edit Event" : "Tambah Event Baru"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="w-10 h-10 bg-[#4A7FA7]/20 rounded-xl flex items-center justify-center text-[#0A1931] hover:bg-[#4A7FA7]/30 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#0A1931] mb-2">Judul Event</label>
                    <input
                      type="text"
                      value={formData.judul_kegiatan}
                      onChange={(e) => setFormData({...formData, judul_kegiatan: e.target.value})}
                      className="w-full px-4 py-3 bg-white border-2 border-[#4A7FA7]/20 rounded-xl text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors placeholder-[#4A7FA7]/50"
                      placeholder="Masukkan judul event"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0A1931] mb-2">Lokasi</label>
                    <input
                      type="text"
                      value={formData.lokasi_kegiatan}
                      onChange={(e) => setFormData({...formData, lokasi_kegiatan: e.target.value})}
                      className="w-full px-4 py-3 bg-white border-2 border-[#4A7FA7]/20 rounded-xl text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors placeholder-[#4A7FA7]/50"
                      placeholder="Masukkan lokasi event"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0A1931] mb-2">Tanggal & Waktu</label>
                    <input
                      type="datetime-local"
                      value={formData.waktu_mulai}
                      onChange={(e) => setFormData({...formData, waktu_mulai: e.target.value})}
                      className="w-full px-4 py-3 bg-white border-2 border-[#4A7FA7]/20 rounded-xl text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0A1931] mb-2">Kategori</label>
                    <select
                      value={formData.kategori?.nama_kategori || ''}
                      onChange={(e) => setFormData({...formData, kategori: { nama_kategori: e.target.value }})}
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
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0A1931] mb-2">URL Flyer</label>
                  <input
                    type="url"
                    value={formData.flyer_kegiatan}
                    onChange={(e) => setFormData({...formData, flyer_kegiatan: e.target.value})}
                    className="w-full px-4 py-3 bg-white border-2 border-[#4A7FA7]/20 rounded-xl text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors placeholder-[#4A7FA7]/50"
                    placeholder="https://example.com/flyer.jpg"
                    required
                  />
                </div>

                {/* Tickets Section */}
                <div className="border-t-2 border-[#4A7FA7]/20 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#0A1931]">Paket Tiket</h3>
                    <button
                      type="button"
                      onClick={addTicket}
                      className="px-4 py-2 bg-gradient-to-r from-[#B3CFE5] to-[#4A7FA7] text-[#0A1931] font-semibold rounded-lg hover:from-[#4A7FA7] hover:to-[#0A1931] hover:text-white transition-all flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Tambah Tiket
                    </button>
                  </div>

                  {formData.tickets.length === 0 ? (
                    <div className="bg-[#4A7FA7]/10 rounded-xl p-6 text-center">
                      <p className="text-[#4A7FA7]">Belum ada tiket. Klik "Tambah Tiket" untuk menambahkan paket tiket.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.tickets.map((ticket, ticketIndex) => (
                        <div key={ticket.id} className="bg-[#F6FAFD] border-2 border-[#4A7FA7]/20 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-[#0A1931]">Tiket #{ticketIndex + 1}</h4>
                            <button
                              type="button"
                              onClick={() => removeTicket(ticket.id)}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <label className="block text-xs font-semibold text-[#0A1931] mb-1">Nama Tiket</label>
                              <input
                                type="text"
                                value={ticket.name}
                                onChange={(e) => updateTicket(ticket.id, 'name', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-[#4A7FA7]/20 rounded-lg text-sm"
                                placeholder="e.g., Early Bird"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-[#0A1931] mb-1">Harga (Rp)</label>
                              <input
                                type="number"
                                value={ticket.price}
                                onChange={(e) => updateTicket(ticket.id, 'price', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 bg-white border border-[#4A7FA7]/20 rounded-lg text-sm"
                                placeholder="100000"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-[#0A1931] mb-1">Kuota Total</label>
                              <input
                                type="number"
                                value={ticket.quota}
                                onChange={(e) => updateTicket(ticket.id, 'quota', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 bg-white border border-[#4A7FA7]/20 rounded-lg text-sm"
                                placeholder="100"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-[#0A1931] mb-1">Tersedia</label>
                              <input
                                type="number"
                                value={ticket.available}
                                onChange={(e) => updateTicket(ticket.id, 'available', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 bg-white border border-[#4A7FA7]/20 rounded-lg text-sm"
                                placeholder="100"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-xs font-semibold text-[#0A1931]">Fitur Tiket</label>
                              <button
                                type="button"
                                onClick={() => addFeature(ticket.id)}
                                className="text-xs text-[#4A7FA7] hover:text-[#0A1931] font-semibold"
                              >
                                + Tambah Fitur
                              </button>
                            </div>
                            <div className="space-y-2">
                              {ticket.features.map((feature, featureIndex) => (
                                <div key={featureIndex} className="flex gap-2">
                                  <input
                                    type="text"
                                    value={feature}
                                    onChange={(e) => updateFeature(ticket.id, featureIndex, e.target.value)}
                                    className="flex-1 px-3 py-2 bg-white border border-[#4A7FA7]/20 rounded-lg text-sm"
                                    placeholder="e.g., Akses semua sesi"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeFeature(ticket.id, featureIndex)}
                                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 bg-[#4A7FA7]/20 text-[#0A1931] font-semibold rounded-xl hover:bg-[#4A7FA7]/30 transition-colors border border-[#4A7FA7]/30"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-semibold rounded-xl hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    {editingEvent ? "Update Event" : "Tambah Event"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
