import React, { useState } from "react";
import { useSidebar } from "../../contexts/SidebarContext";
import AdminLayout from "../../components/AdminLayout";
import { Plus, Edit3, Trash2, X, Save, Calendar, MapPin, Tag, Eye, CheckCircle, AlertCircle, Sparkles, Image as ImageIcon } from "lucide-react";

export default function UpdateRecommendedEvents() {
  const { isExpanded } = useSidebar();
  const [events, setEvents] = useState([
    { 
      id: 1, 
      title: "Music Festival 2024", 
      description: "Festival musik terbesar tahun ini dengan lineup artis internasional yang akan memukau penonton",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800", 
      date: "2024-12-25",
      location: "Jakarta Convention Center",
      category: "Music",
      active: true,
      order: 1
    },
    { 
      id: 2, 
      title: "Tech Summit Indonesia", 
      description: "Konferensi teknologi terbesar dengan pembicara dari perusahaan teknologi global",
      image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800", 
      date: "2024-11-15",
      location: "Bali International Convention Centre",
      category: "Technology",
      active: true,
      order: 2
    },
    { 
      id: 3, 
      title: "Food Festival Jakarta", 
      description: "Nikmati berbagai kuliner nusantara dan internasional dari chef terbaik",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800", 
      date: "2024-10-20",
      location: "Gelora Bung Karno",
      category: "Food",
      active: false,
      order: 3
    }
  ]);
  
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    date: "",
    location: "",
    category: "",
    active: true,
    order: 1
  });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleAdd = () => {
    setEditingEvent(null);
    setFormData({ 
      title: "", 
      description: "", 
      image: "", 
      date: "", 
      location: "", 
      category: "", 
      active: true,
      order: events.length + 1
    });
    setShowModal(true);
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData(event);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Yakin ingin menghapus event rekomendasi ini?")) {
      setEvents(events.filter(e => e.id !== id));
      showMessage('success', 'Event berhasil dihapus');
    }
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      showMessage('error', 'Judul event harus diisi');
      return;
    }
    if (!formData.description.trim()) {
      showMessage('error', 'Deskripsi event harus diisi');
      return;
    }
    if (!formData.image.trim()) {
      showMessage('error', 'URL gambar harus diisi');
      return;
    }
    if (!formData.date) {
      showMessage('error', 'Tanggal event harus diisi');
      return;
    }
    if (!formData.location.trim()) {
      showMessage('error', 'Lokasi event harus diisi');
      return;
    }
    if (!formData.category.trim()) {
      showMessage('error', 'Kategori event harus diisi');
      return;
    }

    if (editingEvent) {
      setEvents(events.map(e => e.id === editingEvent.id ? { ...formData, id: editingEvent.id } : e));
      showMessage('success', 'Event berhasil diperbarui');
    } else {
      setEvents([...events, { ...formData, id: Date.now() }]);
      showMessage('success', 'Event baru berhasil ditambahkan');
    }
    setShowModal(false);
  };

  const toggleActive = (id) => {
    setEvents(events.map(e => {
      if (e.id === id) {
        const newStatus = !e.active;
        showMessage('success', `Event ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
        return { ...e, active: newStatus };
      }
      return e;
    }));
  };

  const categoryColors = {
    'Music': 'from-purple-500 to-pink-500',
    'Technology': 'from-blue-500 to-cyan-500',
    'Food': 'from-orange-500 to-red-500',
    'Sport': 'from-green-500 to-teal-500',
    'Art': 'from-indigo-500 to-purple-500',
    'Education': 'from-yellow-500 to-orange-500'
  };

  return (
    <AdminLayout>
      <div className="flex-1">
        {/* CSS Animation */}
        <style>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0) translateX(0) scale(1);
              opacity: 0.6;
            }
            25% {
              transform: translateY(-30px) translateX(15px) scale(1.1);
              opacity: 0.8;
            }
            50% {
              transform: translateY(-50px) translateX(-15px) scale(0.9);
              opacity: 1;
            }
            75% {
              transform: translateY(-30px) translateX(8px) scale(1.05);
              opacity: 0.7;
            }
          }
          .animate-float {
            animation: float 8s ease-in-out infinite;
          }
        `}</style>

        {/* Animated Background Bubbles */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-blue-400/25 to-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/20 to-pink-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/3 w-[450px] h-[450px] bg-gradient-to-br from-cyan-400/20 to-blue-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-32 left-[15%] w-24 h-24 border-2 border-blue-400/50 rounded-full animate-float bg-gradient-to-br from-blue-200/20 to-indigo-300/15"></div>
          <div className="absolute top-64 right-[20%] w-32 h-32 border-2 border-purple-400/45 rounded-full animate-float bg-gradient-to-br from-purple-200/20 to-pink-300/15" style={{ animationDelay: '1.5s', animationDuration: '8s' }}></div>
        </div>

        {/* Content dengan z-index lebih tinggi */}
        <div className="relative z-10">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#0A1931]">Update Rekomendasi Event</h1>
                <p className="text-[#4A7FA7]">Kelola event menarik yang ditampilkan di section "Event Menarik" halaman utama</p>
              </div>
            </div>
            <div className="h-1 w-32 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] rounded-full animate-pulse"></div>
          </div>

          {/* Message Alert */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-fade-in-up ${
              message.type === 'success' ? 'bg-green-50 border-2 border-green-200 text-green-800' : 'bg-red-50 border-2 border-red-200 text-red-800'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="font-medium">{message.text}</span>
            </div>
          )}

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-[#4A7FA7]/20 p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-[#0A1931] flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-[#4A7FA7]" />
                  Daftar Event Rekomendasi
                </h2>
                <p className="text-sm text-[#4A7FA7] mt-1.5">Total: <span className="font-semibold">{events.length} event</span> tersedia | <span className="font-semibold">{events.filter(e => e.active).length} aktif</span> di homepage</p>
              </div>
              <button
                onClick={handleAdd}
                className="px-6 py-3.5 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white rounded-xl font-semibold hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                Tambah Event Baru
              </button>
            </div>

            {/* Event Grid */}
            {events.length === 0 ? (
              <div className="text-center py-24 border-2 border-dashed border-[#4A7FA7]/40 rounded-2xl bg-gradient-to-br from-blue-50/50 to-indigo-50/30">
                <div className="w-24 h-24 bg-gradient-to-br from-[#4A7FA7]/20 to-[#1A3D63]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-12 h-12 text-[#4A7FA7]" />
                </div>
                <p className="text-[#0A1931] text-xl font-bold mb-2">Belum ada event rekomendasi</p>
                <p className="text-[#4A7FA7] text-sm max-w-md mx-auto">
                  Klik tombol <span className="font-semibold">"Tambah Event Baru"</span> di atas untuk menambahkan event pertama Anda
                </p>
                <p className="text-xs text-[#4A7FA7]/70 mt-4">
                  💡 Tip: Event yang aktif akan otomatis tampil di section "Event Menarik" homepage
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.sort((a, b) => a.order - b.order).map((event) => (
                  <div key={event.id} className="relative bg-white border-2 border-[#4A7FA7]/20 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group hover:border-[#4A7FA7]/50">
                    {/* Image Preview */}
                    <div className="relative h-56 bg-gradient-to-br from-[#4A7FA7]/10 to-[#1A3D63]/10 overflow-hidden">
                      <img 
                        src={event.image} 
                        alt={event.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Badges */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        <div className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${
                          event.active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                        }`}>
                          {event.active ? '✓ Aktif' : '✕ Nonaktif'}
                        </div>
                      </div>
                      <div className="absolute top-3 left-3 flex gap-2">
                        <div className="px-3 py-1.5 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white rounded-full text-xs font-bold shadow-lg">
                          #{event.order}
                        </div>
                        <div className={`px-3 py-1.5 bg-gradient-to-r ${categoryColors[event.category] || 'from-gray-500 to-gray-600'} text-white rounded-full text-xs font-bold shadow-lg flex items-center gap-1`}>
                          <Tag className="w-3 h-3" />
                          {event.category}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 bg-white">
                      <h3 className="font-bold text-[#0A1931] text-lg mb-2 line-clamp-1 group-hover:text-[#4A7FA7] transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-sm text-[#4A7FA7]/80 mb-3 line-clamp-2">{event.description}</p>
                      
                      {/* Event Info */}
                      <div className="space-y-1.5 mb-4 text-xs">
                        <div className="flex items-center gap-2 text-[#4A7FA7]">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="font-medium">{new Date(event.date).toLocaleDateString('id-ID', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#4A7FA7]">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="font-medium line-clamp-1">{event.location}</span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(event)}
                          className="flex-1 px-3 py-2.5 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white rounded-lg font-semibold hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                          title="Edit Event"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span className="hidden sm:inline text-sm">Edit</span>
                        </button>
                        <button
                          onClick={() => toggleActive(event.id)}
                          className={`flex-1 px-3 py-2.5 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
                            event.active 
                              ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                              : 'bg-green-500 text-white hover:bg-green-600'
                          }`}
                          title={event.active ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline text-sm">{event.active ? 'Off' : 'On'}</span>
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="px-3 py-2.5 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
                          title="Hapus Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Form */}
          {showModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white p-5 rounded-t-2xl z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                        {editingEvent ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">
                          {editingEvent ? 'Edit Event Rekomendasi' : 'Tambah Event Baru'}
                        </h2>
                        <p className="text-xs text-white/80">Isi form di bawah untuk {editingEvent ? 'mengubah' : 'menambahkan'} event</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowModal(false)}
                      className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {/* Form Fields */}
                  <div className="space-y-5">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-bold text-[#0A1931] mb-2">
                        Judul Event <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-transparent transition-all"
                        placeholder="Contoh: Music Festival 2024"
                      />
                      <p className="text-xs text-[#4A7FA7] mt-1">Judul akan ditampilkan di card event homepage</p>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-bold text-[#0A1931] mb-2">
                        Deskripsi Event <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-transparent transition-all resize-none"
                        placeholder="Deskripsikan event ini dengan menarik..."
                      />
                    </div>

                    {/* Image URL */}
                    <div>
                      <label className="block text-sm font-bold text-[#0A1931] mb-2 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        URL Gambar Event <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="url"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-transparent transition-all"
                        placeholder="https://example.com/image.jpg"
                      />
                      {formData.image && (
                        <div className="mt-3 relative h-48 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-100">
                          <img 
                            src={formData.image} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Found';
                            }}
                          />
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">Gunakan URL gambar dari Unsplash atau Pexels (min 800px width)</p>
                    </div>

                    {/* Date, Category, Order */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-[#0A1931] mb-2">
                          Tanggal <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="w-full px-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-transparent transition-all text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#0A1931] mb-2">
                          Kategori <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-transparent transition-all text-sm"
                        >
                          <option value="">Pilih</option>
                          <option value="Music">Music</option>
                          <option value="Technology">Technology</option>
                          <option value="Food">Food</option>
                          <option value="Sport">Sport</option>
                          <option value="Art">Art</option>
                          <option value="Education">Education</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#0A1931] mb-2">
                          Urutan <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={formData.order}
                          onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                          className="w-full px-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-transparent transition-all text-sm"
                          min="1"
                        />
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-sm font-bold text-[#0A1931] mb-2">
                        Lokasi Event <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] focus:border-transparent transition-all"
                        placeholder="Contoh: Jakarta Convention Center"
                      />
                    </div>

                    {/* Active Status */}
                    <div>
                      <label className="block text-sm font-bold text-[#0A1931] mb-2">
                        Status
                      </label>
                      <label className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-all">
                        <input
                          type="checkbox"
                          checked={formData.active}
                          onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                          className="w-4 h-4 text-[#4A7FA7] rounded focus:ring-2 focus:ring-[#4A7FA7]"
                        />
                        <span className="text-sm font-semibold text-[#0A1931]">Aktif (tampilkan di homepage)</span>
                      </label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6 pt-5 border-t border-gray-200">
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all border border-gray-300 flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      <span className="text-sm">Batal</span>
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-semibold rounded-lg hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      <span className="text-sm">{editingEvent ? 'Update' : 'Tambah'} Event</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
