import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import { userService } from "../../services/apiService";

export default function ListAccounts() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  // Fetch users data from API
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();
      console.log('Users data from API:', response.data);
      
      // Transform API data to match UI format if needed
      const transformedUsers = response.data.map(user => ({
        id: user.id,
        nama_lengkap: user.nama_lengkap || user.name || '-',
        email: user.email,
        no_telepon: user.no_telepon || user.phone || '-',
        tanggal_daftar: user.created_at,
        status_akun: user.status || 'active',
        role: user.role || 'user',
        last_login: user.last_login_at,
        events_joined: user.events_count || 0,
        total_spending: user.total_spending || 0
      }));
      
      console.log('Transformed users:', transformedUsers);
      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Gagal memuat data pengguna. ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || user.status_akun === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const badges = {
      active: "bg-green-100 text-green-700 border-green-200",
      inactive: "bg-red-100 text-red-700 border-red-200",
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200"
    };
    return badges[status] || badges.active;
  };

  const getStatusText = (status) => {
    const texts = {
      active: "Aktif",
      inactive: "Nonaktif",
      pending: "Pending"
    };
    return texts[status] || status;
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      // Call API to update status
      await userService.updateUserStatus(userId, newStatus);
      
      // Update local state
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, status_akun: newStatus } : u
      ));

      const user = users.find(u => u.id === userId);
      alert(`Status akun ${user.nama_lengkap} berhasil diubah menjadi ${getStatusText(newStatus)}`);
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Gagal mengubah status akun. ' + (error.response?.data?.message || error.message));
    }
  };

  const handleResetPassword = (user) => {
    setSelectedUser(user);
    setNewPassword("");
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert("Password minimal 6 karakter");
      return;
    }

    try {
      // Call API to reset password
      await userService.resetPassword(selectedUser.id, newPassword);
      
      alert(`Password untuk ${selectedUser.nama_lengkap} berhasil direset`);
      setShowPasswordModal(false);
      setSelectedUser(null);
      setNewPassword("");
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Gagal mereset password. ' + (error.response?.data?.message || error.message));
    }
  };

  const exportUsers = async () => {
    try {
      const response = await userService.exportUsersToExcel();
      
      // Create blob from response
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Daftar_Akun_Pengguna_${new Date().toISOString().slice(0,10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting users:', error);
      alert('Gagal export data. ' + (error.response?.data?.message || error.message));
    }
  };

  const exportUsersToCSV = () => {
    const headers = [
      'No',
      'ID',
      'Nama Lengkap',
      'Email',
      'No. Telepon',
      'Role',
      'Status Akun',
      'Tanggal Daftar',
      'Last Login',
      'Event Diikuti',
      'Total Pengeluaran (Rp)'
    ];

    const csvRows = [
      headers.join(','),
      ...filteredUsers.map((user, index) => {
        const dateObj = new Date(user.tanggal_daftar);
        const tanggalDaftar = dateObj.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) + ' ' + dateObj.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit'
        });
        
        const lastLogin = user.last_login 
          ? (() => {
              const loginDate = new Date(user.last_login);
              return loginDate.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              }) + ' ' + loginDate.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
              });
            })()
          : 'Belum pernah login';

        const statusAkun = getStatusText(user.status_akun);
        const roleText = user.role === 'admin' ? 'Admin' : 'User';
        const totalSpending = parseFloat(user.total_spending) || 0;

        return [
          index + 1,
          user.id,
          `"${user.nama_lengkap || ''}"`,
          `"${user.email || ''}"`,
          `"${user.no_telepon || ''}"`,
          roleText,
          statusAkun,
          tanggalDaftar,
          lastLogin,
          user.events_joined || 0,
          totalSpending
        ].join(',');
      })
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const filename = `daftar_akun_pengguna_${dateStr}.csv`;
    
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen relative bg-gradient-to-br from-slate-100 via-blue-50/30 to-indigo-100/40 overflow-hidden">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A7FA7] mx-auto mb-4"></div>
              <p className="text-[#4A7FA7]">Memuat data akun...</p>
            </div>
          </div>
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

        <div className="relative z-10 p-8">
          <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#0A1931]">Daftar Akun Pengguna</h1>
                <p className="text-[#4A7FA7]">Kelola semua akun pengguna yang terdaftar</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportUsersToCSV}
                className="px-6 py-3 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-semibold rounded-xl hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl border-2 border-[#4A7FA7]/20 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group hover:scale-105">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#4A7FA7] text-sm font-semibold mb-1">Total Pengguna</p>
                    <h3 className="text-3xl font-bold text-[#0A1931] mb-2">{users.length}</h3>
                    <p className="text-green-600 text-sm font-semibold">+{Math.floor(Math.random() * 15)}% dari bulan lalu</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl border-2 border-[#4A7FA7]/20 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group hover:scale-105">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#4A7FA7] text-sm font-semibold mb-1">Akun Aktif</p>
                    <h3 className="text-3xl font-bold text-[#0A1931] mb-2">
                      {users.filter(u => u.status_akun === 'active').length}
                    </h3>
                    <p className="text-green-600 text-sm font-semibold">Pengguna aktif</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-[#0A1931] to-[#4A7FA7] rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl border-2 border-[#4A7FA7]/20 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group hover:scale-105">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#4A7FA7] text-sm font-semibold mb-1">Pending</p>
                    <h3 className="text-3xl font-bold text-[#0A1931] mb-2">
                      {users.filter(u => u.status_akun === 'pending').length}
                    </h3>
                    <p className="text-yellow-600 text-sm font-semibold">Perlu verifikasi</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-[#B3CFE5] to-[#4A7FA7] rounded-xl flex items-center justify-center text-[#0A1931] shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl border-2 border-[#4A7FA7]/20 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group hover:scale-105">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#4A7FA7] text-sm font-semibold mb-1">Nonaktif</p>
                    <h3 className="text-3xl font-bold text-[#0A1931] mb-2">
                      {users.filter(u => u.status_akun === 'inactive').length}
                    </h3>
                    <p className="text-red-600 text-sm font-semibold">Akun dinonaktifkan</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-[#4A7FA7] to-[#0A1931] rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#0A1931] mb-2">Cari Pengguna</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari nama atau email..."
                  className="w-full px-4 py-2 bg-white border-2 border-[#4A7FA7]/20 rounded-lg text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0A1931] mb-2">Status Akun</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-white border-2 border-[#4A7FA7]/20 rounded-lg text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors"
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  className="w-full px-4 py-2 bg-[#4A7FA7]/20 text-[#0A1931] font-semibold rounded-lg hover:bg-[#4A7FA7]/30 transition-colors border border-[#4A7FA7]/30"
                >
                  Reset Filter
                </button>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#4A7FA7]/10 to-[#1A3D63]/10 border-b border-white/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#0A1931] uppercase tracking-wider">Nama Lengkap</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#0A1931] uppercase tracking-wider">Email & Kontak</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#0A1931] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#0A1931] uppercase tracking-wider">Aktivitas</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#0A1931] uppercase tracking-wider">Pengeluaran</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#0A1931] uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-[#4A7FA7]">
                        Tidak ada pengguna yang ditemukan
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-white/20 transition-all duration-300 group">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-[#0A1931] group-hover:text-[#4A7FA7] transition-colors">
                            {user.nama_lengkap}
                          </div>
                          <div className="text-sm text-[#4A7FA7]">
                            Daftar: {new Date(user.tanggal_daftar).toLocaleDateString('id-ID')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-[#4A7FA7]">
                            <div className="font-medium">{user.email}</div>
                            <div className="text-sm">{user.no_telepon}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(user.status_akun)}`}>
                            {getStatusText(user.status_akun)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-[#4A7FA7]">
                            <div className="font-medium">{user.events_joined} Event</div>
                            <div className="text-sm">
                              {user.last_login ? `Login: ${new Date(user.last_login).toLocaleDateString('id-ID')}` : 'Belum pernah login'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[#4A7FA7] font-semibold">
                            Rp {user.total_spending.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleStatusToggle(user.id, user.status_akun)}
                              className={`p-2 rounded-lg transition-all duration-300 ${
                                user.status_akun === 'active'
                                  ? 'bg-gradient-to-r from-red-400/20 to-red-600/20 text-red-600 hover:from-red-400/30 hover:to-red-600/30'
                                  : 'bg-gradient-to-r from-green-400/20 to-green-600/20 text-green-600 hover:from-green-400/30 hover:to-green-600/30'
                              }`}
                              title={user.status_akun === 'active' ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                            >
                              {user.status_akun === 'active' ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                            </button>
                            <button
                              onClick={() => handleResetPassword(user)}
                              className="p-2 bg-gradient-to-r from-[#4A7FA7]/20 to-[#1A3D63]/20 text-[#0A1931] rounded-lg hover:from-[#4A7FA7]/30 hover:to-[#0A1931]/30 transition-all duration-300"
                              title="Reset Password"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
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

          {/* Password Reset Modal */}
          {showPasswordModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-[#F6FAFD]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 w-full max-w-md">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#0A1931]">Reset Password</h2>
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="w-10 h-10 bg-[#4A7FA7]/20 rounded-xl flex items-center justify-center text-[#0A1931] hover:bg-[#4A7FA7]/30 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-[#0A1931] font-semibold mb-2">Pengguna:</p>
                  <p className="text-[#4A7FA7]">{selectedUser?.nama_lengkap}</p>
                  <p className="text-sm text-[#4A7FA7]/70">{selectedUser?.email}</p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                    Password Baru
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-[#4A7FA7]/20 rounded-xl text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors"
                    placeholder="Masukkan password baru"
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 px-6 py-3 bg-[#4A7FA7]/20 text-[#0A1931] font-semibold rounded-xl hover:bg-[#4A7FA7]/30 transition-colors border border-[#4A7FA7]/30"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handlePasswordSubmit}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-semibold rounded-xl hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Reset Password
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
