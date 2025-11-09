import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';
import {
  Mail, Eye, Trash2, Calendar, User, Phone, MessageSquare,
  Search, Filter, ChevronDown, Download, Reply
} from 'lucide-react';

const API_URL = "http://localhost:8000/api";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, read, unread
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken') || localStorage.getItem('token');
      
      const response = await axios.get(`${API_URL}/contact-messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.success) {
        setMessages(response.data.data || []);
      } else {
        setMessages([]);
      }

      // Dispatch custom event to notify sidebar
      window.dispatchEvent(new Event('messagesUpdated'));
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
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
      const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken') || localStorage.getItem('token');
      
      await axios.put(`${API_URL}/contact-messages/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update in state
      const updatedMessages = messages.map(msg => 
        msg.id === id ? { ...msg, is_read: true } : msg
      );
      setMessages(updatedMessages);

      // Dispatch custom event to notify sidebar
      window.dispatchEvent(new Event('messagesUpdated'));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pesan ini?')) return;
    
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken') || localStorage.getItem('token');
      
      await axios.delete(`${API_URL}/contact-messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update in state
      setMessages(messages.filter(msg => msg.id !== id));

      alert('Pesan berhasil dihapus');
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Gagal menghapus pesan');
    }
  };

  const handleReplyEmail = (message) => {
    console.log('=== handleReplyEmail START ===');
    console.log('Message:', message);
    
    setSelectedMessage(message);
    console.log('Selected message set');
    
    // Set default template
    const template = `Halo ${message.name},\n\nTerima kasih telah menghubungi kami.\n\n[Tulis balasan Anda di sini]\n\nSalam,\nTim Admin`;
    setReplyMessage(template);
    console.log('Reply message set:', template);
    
    setShowComposeModal(true);
    console.log('showComposeModal set to TRUE');
    console.log('=== handleReplyEmail END ===');
  };

  const handleSendEmail = async () => {
    if (!replyMessage.trim()) {
      alert('Pesan balasan tidak boleh kosong');
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken') || localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_URL}/contact-messages/${selectedMessage.id}/reply`,
        { reply_message: replyMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        alert('✓ Email berhasil dikirim!');
        setShowComposeModal(false);
        setReplyMessage('');
        
        // Mark as read in local state
        const updatedMessages = messages.map(msg => 
          msg.id === selectedMessage.id ? { ...msg, is_read: true } : msg
        );
        setMessages(updatedMessages);
      } else {
        throw new Error(response.data?.message || 'Gagal mengirim email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('❌ Gagal mengirim email: ' + (error.response?.data?.message || error.message));
    } finally {
      setSending(false);
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
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {filteredMessages.length === 0 ? (
              <div className="p-12 text-center">
                <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-[#4A7FA7] font-medium">Tidak ada pesan</p>
                <p className="text-gray-400 text-sm mt-1">Pesan yang masuk akan ditampilkan di sini</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-5 hover:bg-blue-50/30 transition-all group ${
                      !message.is_read ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-11 h-11 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-full flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">
                            {message.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-[#0A1931] text-base">{message.name}</h3>
                              {!message.is_read && (
                                <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full shadow-sm">
                                  Baru
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Mail className="w-3.5 h-3.5 text-blue-600" />
                                {message.email}
                              </p>
                              {message.phone && (
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  <Phone className="w-3.5 h-3.5 text-green-600" />
                                  {message.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="ml-14">
                          <h4 className="font-semibold text-[#0A1931] mb-2 text-sm">{message.subject}</h4>
                          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">{message.message}</p>
                          
                          <div className="flex items-center gap-1 mt-3 text-xs text-gray-500">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date(message.created_at).toLocaleDateString('id-ID', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleReplyEmail(message)}
                          className="p-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all shadow-sm hover:shadow"
                          title="Balas via Email"
                        >
                          <Reply className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleViewMessage(message)}
                          className="p-2.5 bg-[#4A7FA7] text-white rounded-lg hover:bg-[#1A3D63] transition-all shadow-sm hover:shadow"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(message.id)}
                          className="p-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-sm hover:shadow"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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

              <div className="flex gap-3 pt-4 relative z-[70]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Button clicked!');
                    handleReplyEmail(selectedMessage);
                    setShowModal(false);
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  style={{ pointerEvents: 'auto' }}
                >
                  <Reply className="w-4 h-4" />
                  Balas via Email
                </button>
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
      <style>{`
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
