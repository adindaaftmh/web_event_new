import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';
import {
  Mail, Eye, Trash2, Calendar, User, Phone, MessageSquare,
  Search, Filter, ChevronDown, Download
} from 'lucide-react';

const API_URL = "http://localhost:8000/api";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, read, unread
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      // First, get messages from localStorage
      const localMessages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
      
      // Mock data for demonstration
      const mockMessages = [
        {
          id: 999,
          name: 'John Doe',
          email: 'john@example.com',
          phone: '081234567890',
          subject: 'Pertanyaan tentang Event',
          message: 'Halo, saya ingin bertanya tentang pendaftaran event yang akan datang. Apakah masih ada slot yang tersedia?',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          is_read: false
        },
        {
          id: 998,
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '082345678901',
          subject: 'Feedback Website',
          message: 'Website sangat informatif dan mudah digunakan. Terima kasih!',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          is_read: true
        }
      ];

      // Combine localStorage messages with mock data
      const combinedMessages = [...localMessages, ...mockMessages];
      setMessages(combinedMessages);

      /* Uncomment when backend ready:
      const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/contact-messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        const apiMessages = Array.isArray(response.data) ? response.data : response.data.data || [];
        // Merge API messages with localStorage messages
        const allMessages = [...localMessages, ...apiMessages];
        setMessages(allMessages);
      }
      */
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Fallback to localStorage only
      const localMessages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
      setMessages(localMessages);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setShowModal(true);
    
    // Mark as read
    if (!message.is_read) {
      markAsRead(message.id);
    }
  };

  const markAsRead = async (id) => {
    try {
      // Update in state
      const updatedMessages = messages.map(msg => 
        msg.id === id ? { ...msg, is_read: true } : msg
      );
      setMessages(updatedMessages);

      // Update in localStorage
      const localMessages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
      const updatedLocalMessages = localMessages.map(msg =>
        msg.id === id ? { ...msg, is_read: true } : msg
      );
      localStorage.setItem('contactMessages', JSON.stringify(updatedLocalMessages));

      /* Uncomment when backend ready:
      const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken') || localStorage.getItem('token');
      await axios.put(`${API_URL}/contact-messages/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      */
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pesan ini?')) return;
    
    try {
      // Update in state
      setMessages(messages.filter(msg => msg.id !== id));

      // Update in localStorage
      const localMessages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
      const updatedLocalMessages = localMessages.filter(msg => msg.id !== id);
      localStorage.setItem('contactMessages', JSON.stringify(updatedLocalMessages));

      alert('Pesan berhasil dihapus');

      /* Uncomment when backend ready:
      const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken') || localStorage.getItem('token');
      await axios.delete(`${API_URL}/contact-messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      */
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const exportMessages = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "ID,Nama,Email,Telepon,Subjek,Pesan,Tanggal,Status\n"
      + filteredMessages.map(m => 
        `${m.id},"${m.name}","${m.email}","${m.phone || '-'}","${m.subject}","${m.message}","${new Date(m.created_at).toLocaleString('id-ID')}","${m.is_read ? 'Sudah Dibaca' : 'Belum Dibaca'}"`
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pesan_kontak_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter messages
  const filteredMessages = messages.filter(msg => {
    const matchesSearch = 
      msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'read' && msg.is_read) ||
      (filterStatus === 'unread' && !msg.is_read);

    return matchesSearch && matchesStatus;
  });

  const unreadCount = messages.filter(m => !m.is_read).length;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A7FA7]"></div>
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
            <div>
              <h1 className="text-3xl font-bold text-[#0A1931] mb-2 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                Pesan Kontak
                {unreadCount > 0 && (
                  <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h1>
              <p className="text-[#4A7FA7]">
                Kelola pesan dari pengunjung website
              </p>
            </div>

            <button
              onClick={exportMessages}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-[#4A7FA7]/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari nama, email, subjek, atau pesan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-[#4A7FA7]/20 rounded-lg focus:border-[#4A7FA7] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-[#4A7FA7]/20 rounded-lg focus:border-[#4A7FA7] focus:outline-none transition-colors"
                >
                  <option value="all">Semua Pesan</option>
                  <option value="unread">Belum Dibaca</option>
                  <option value="read">Sudah Dibaca</option>
                </select>
              </div>
            </div>
          </div>

          {/* Messages List */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-[#4A7FA7]/10">
            {filteredMessages.length === 0 ? (
              <div className="p-12 text-center">
                <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Tidak ada pesan</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-6 hover:bg-[#4A7FA7]/5 transition-all cursor-pointer ${
                      !message.is_read ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-full flex items-center justify-center text-white font-bold">
                            {message.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-[#0A1931]">{message.name}</h3>
                              {!message.is_read && (
                                <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                                  Baru
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{message.email}</p>
                          </div>
                        </div>

                        <div className="ml-13">
                          <h4 className="font-semibold text-[#0A1931] mb-1">{message.subject}</h4>
                          <p className="text-gray-600 text-sm line-clamp-2">{message.message}</p>
                          
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(message.created_at).toLocaleDateString('id-ID')}
                            </span>
                            {message.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {message.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewMessage(message)}
                          className="p-2 bg-[#4A7FA7]/10 text-[#4A7FA7] rounded-lg hover:bg-[#4A7FA7] hover:text-white transition-all"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(message.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                          title="Hapus"
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
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#0A1931]">Detail Pesan</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-[#0A1931] hover:bg-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {selectedMessage.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-[#0A1931]">{selectedMessage.name}</h3>
                  <p className="text-sm text-gray-600">{selectedMessage.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {selectedMessage.phone && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      Telepon
                    </p>
                    <p className="font-semibold text-[#0A1931]">{selectedMessage.phone}</p>
                  </div>
                )}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Tanggal
                  </p>
                  <p className="font-semibold text-[#0A1931]">
                    {new Date(selectedMessage.created_at).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0A1931] mb-2">Subjek</label>
                <p className="p-4 bg-gray-50 rounded-xl font-medium text-[#0A1931]">
                  {selectedMessage.subject}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0A1931] mb-2">Pesan</label>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <a
                  href={`mailto:${selectedMessage.email}`}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-semibold rounded-xl hover:shadow-lg transition-all text-center"
                >
                  Balas via Email
                </a>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </AdminLayout>
  );
}
