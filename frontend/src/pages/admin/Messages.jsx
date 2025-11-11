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
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

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
        setShowComposeModal(false);
        setReplyMessage('');
        setShowSuccessPopup(true);
        
        // Mark as read in local state
        const updatedMessages = messages.map(msg => 
          msg.id === selectedMessage.id ? { ...msg, is_read: true } : msg
        );
        setMessages(updatedMessages);
        
        // Auto hide popup after 3 seconds
        setTimeout(() => {
          setShowSuccessPopup(false);
        }, 3000);
      } else {
        throw new Error(response.data?.message || 'Gagal mengirim email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message;
      const debugInfo = error.response?.data?.debug;
      
      let alertMessage = '❌ Gagal mengirim email: ' + errorMsg;
      if (debugInfo) {
        alertMessage += '\n\nDebug Info:\nFile: ' + debugInfo.file + '\nLine: ' + debugInfo.line + '\nClass: ' + debugInfo.class;
      }
      
      alert(alertMessage);
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
            )}
          </div>
        </div>
      </div>

      {/* Detail Message Modal */}
      {showModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-[#0A1931] flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-[#4A7FA7]" />
                Detail Pesan
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-[#0A1931] hover:bg-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
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

      {/* Compose Email Modal */}
      {showComposeModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[70]" onClick={() => setShowComposeModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] p-6 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Reply className="w-6 h-6" />
                Balas Pesan
              </h2>
              <button
                onClick={() => setShowComposeModal(false)}
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Recipient Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border-2 border-blue-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {selectedMessage.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Kepada:</p>
                    <p className="font-bold text-[#0A1931] text-lg">{selectedMessage.name}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <Mail className="w-3.5 h-3.5" />
                      {selectedMessage.email}
                    </p>
                  </div>
                </div>
                <div className="bg-white/80 p-3 rounded-lg border border-blue-200">
                  <p className="text-xs text-gray-500 mb-1">Pesan Asli:</p>
                  <p className="text-sm text-gray-700 font-medium"><strong>Subjek:</strong> {selectedMessage.subject}</p>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{selectedMessage.message}</p>
                </div>
              </div>

              {/* Reply Message */}
              <div>
                <label className="block text-sm font-bold text-[#0A1931] mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#4A7FA7]" />
                  Pesan Balasan
                </label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={12}
                  className="w-full px-4 py-3 border-2 border-[#4A7FA7]/30 rounded-xl focus:border-[#4A7FA7] focus:outline-none transition-all resize-none font-mono text-sm leading-relaxed"
                  placeholder="Tulis balasan email Anda di sini..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Tips: Gunakan bahasa yang sopan dan jelas dalam menjawab pesan.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleSendEmail}
                  disabled={sending || !replyMessage.trim()}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Reply className="w-5 h-5" />
                      Kirim Email
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowComposeModal(false)}
                  disabled={sending}
                  className="px-6 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-[80] bg-black/20">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform animate-bounce-in">
            <div className="text-center">
              {/* Success Icon */}
              <div className="mx-auto flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full mb-4 animate-scale-in">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              {/* Success Message */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Email Berhasil Dikirim!
              </h3>
              <p className="text-gray-600 mb-2">
                Balasan Anda telah berhasil dikirim ke
              </p>
              <p className="font-semibold text-[#4A7FA7] mb-4">
                {selectedMessage?.email}
              </p>
              
              {/* Success Details */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-center gap-2 text-green-700">
                  <Mail className="w-5 h-5" />
                  <span className="text-sm font-medium">Pesan telah sampai ke inbox penerima</span>
                </div>
              </div>
              
              {/* Close Button */}
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                Tutup
              </button>
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
        
        @keyframes bounce-in {
          0% {
            transform: scale(0.3) translateY(-50px);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.95);
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        @keyframes scale-in {
          0% {
            transform: scale(0) rotate(0deg);
          }
          50% {
            transform: scale(1.2) rotate(180deg);
          }
          100% {
            transform: scale(1) rotate(360deg);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.6s ease-out 0.2s both;
        }
      `}</style>
    </AdminLayout>
  );
}
