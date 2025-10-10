import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";

export default function ListParticipants() {
  const [participants, setParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Mock participants data - in real app this would come from API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockParticipants = [
        {
          id: 1,
          nama_lengkap: "Ahmad Santoso",
          email: "ahmad@email.com",
          no_telepon: "081234567890",
          event_joined: ["Workshop Digital Marketing", "Seminar Teknologi AI"],
          status_verifikasi: "verified",
          tanggal_daftar: "2025-01-15T10:30:00",
          token_kehadiran: "TK001",
          sertifikat_diterbitkan: true
        },
        {
          id: 2,
          nama_lengkap: "Siti Nurhaliza",
          email: "siti@email.com",
          no_telepon: "081987654321",
          event_joined: ["Konser Musik Akustik"],
          status_verifikasi: "pending",
          tanggal_daftar: "2025-01-18T14:20:00",
          token_kehadiran: "TK002",
          sertifikat_diterbitkan: false
        },
        {
          id: 3,
          nama_lengkap: "Budi Setiawan",
          email: "budi@email.com",
          no_telepon: "085123456789",
          event_joined: ["Pelatihan Public Speaking", "Workshop Digital Marketing"],
          status_verifikasi: "verified",
          tanggal_daftar: "2025-01-20T09:15:00",
          token_kehadiran: "TK003",
          sertifikat_diterbitkan: true
        },
        {
          id: 4,
          nama_lengkap: "Maya Sari",
          email: "maya@email.com",
          no_telepon: "089876543210",
          event_joined: ["Seminar Teknologi AI"],
          status_verifikasi: "verified",
          tanggal_daftar: "2025-01-22T16:45:00",
          token_kehadiran: "TK004",
          sertifikat_diterbitkan: false
        },
        {
          id: 5,
          nama_lengkap: "Rizki Ramadhan",
          email: "rizki@email.com",
          no_telepon: "082345678901",
          event_joined: ["Konser Musik Akustik", "Festival Seni Budaya"],
          status_verifikasi: "pending",
          tanggal_daftar: "2025-01-25T11:30:00",
          token_kehadiran: "TK005",
          sertifikat_diterbitkan: false
        }
      ];
      setParticipants(mockParticipants);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter participants
  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = participant.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || participant.status_verifikasi === statusFilter;
    const matchesEvent = eventFilter === "all" || participant.event_joined.some(event =>
      event.toLowerCase().includes(eventFilter.toLowerCase())
    );

    return matchesSearch && matchesStatus && matchesEvent;
  });

  const getStatusBadge = (status) => {
    return status === 'verified'
      ? "bg-green-100 text-green-700 border-green-200"
      : "bg-yellow-100 text-yellow-700 border-yellow-200";
  };

  const handleStatusChange = (id, newStatus) => {
    setParticipants(prev => prev.map(p =>
      p.id === id ? { ...p, status_verifikasi: newStatus } : p
    ));
  };

  const exportParticipants = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "ID,Nama Lengkap,Email,No. Telepon,Event yang Diikuti,Status Verifikasi,Tanggal Daftar,Token Kehadiran,Sertifikat Diterbitkan\n"
      + filteredParticipants.map(p =>
        `${p.id},"${p.nama_lengkap}",${p.email},${p.no_telepon},"${p.event_joined.join('; ')}",${p.status_verifikasi},${new Date(p.tanggal_daftar).toLocaleDateString()},${p.token_kehadiran},${p.sertifikat_diterbitkan ? 'Ya' : 'Tidak'}`
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "daftar_peserta.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A7FA7] mx-auto mb-4"></div>
            <p className="text-[#4A7FA7]">Memuat data peserta...</p>
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

        <div className="relative z-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#0A1931]">Daftar Peserta</h1>
              <p className="text-[#4A7FA7]">Kelola data peserta dari seluruh kegiatan</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportParticipants}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl border-2 border-[#4A7FA7]/20 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group hover:scale-105">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#4A7FA7] text-sm font-semibold mb-1">Total Peserta</p>
                  <h3 className="text-3xl font-bold text-[#0A1931] mb-2">{participants.length}</h3>
                  <p className="text-green-600 text-sm font-semibold">+{Math.floor(Math.random() * 10)}% dari bulan lalu</p>
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
                  <p className="text-[#4A7FA7] text-sm font-semibold mb-1">Terverifikasi</p>
                  <h3 className="text-3xl font-bold text-[#0A1931] mb-2">
                    {participants.filter(p => p.status_verifikasi === 'verified').length}
                  </h3>
                  <p className="text-green-600 text-sm font-semibold">Akun aktif</p>
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
                    {participants.filter(p => p.status_verifikasi === 'pending').length}
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
                  <p className="text-[#4A7FA7] text-sm font-semibold mb-1">Sertifikat</p>
                  <h3 className="text-3xl font-bold text-[#0A1931] mb-2">
                    {participants.filter(p => p.sertifikat_diterbitkan).length}
                  </h3>
                  <p className="text-purple-600 text-sm font-semibold">Telah diterbitkan</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-[#4A7FA7] to-[#0A1931] rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#0A1931] mb-2">Cari Peserta</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama atau email..."
                className="w-full px-4 py-2 bg-white border-2 border-[#4A7FA7]/20 rounded-lg text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0A1931] mb-2">Status Verifikasi</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 bg-white border-2 border-[#4A7FA7]/20 rounded-lg text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors"
              >
                <option value="all">Semua Status</option>
                <option value="verified">Terverifikasi</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0A1931] mb-2">Event</label>
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                className="w-full px-4 py-2 bg-white border-2 border-[#4A7FA7]/20 rounded-lg text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors"
              >
                <option value="all">Semua Event</option>
                <option value="workshop digital marketing">Workshop Digital Marketing</option>
                <option value="seminar teknologi ai">Seminar Teknologi AI</option>
                <option value="konser musik akustik">Konser Musik Akustik</option>
                <option value="pelatihan public speaking">Pelatihan Public Speaking</option>
                <option value="festival seni budaya">Festival Seni Budaya</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setEventFilter("all");
                }}
                className="w-full px-4 py-2 bg-[#4A7FA7]/20 text-[#0A1931] font-semibold rounded-lg hover:bg-[#4A7FA7]/30 transition-colors border border-[#4A7FA7]/30"
              >
                Reset Filter
              </button>
            </div>
          </div>
        </div>

        {/* Participants Table */}
        <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#4A7FA7]/10 to-[#1A3D63]/10 border-b border-white/20">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0A1931] uppercase tracking-wider">Nama Lengkap</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0A1931] uppercase tracking-wider">Email & Kontak</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0A1931] uppercase tracking-wider">Event yang Diikuti</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0A1931] uppercase tracking-wider">Daftar Pengguna</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0A1931] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0A1931] uppercase tracking-wider">Token Kehadiran</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0A1931] uppercase tracking-wider">Sertifikat</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0A1931] uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {filteredParticipants.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-[#4A7FA7]">
                      Tidak ada peserta yang ditemukan
                    </td>
                  </tr>
                ) : (
                  filteredParticipants.map((participant) => (
                    <tr key={participant.id} className="hover:bg-white/20 transition-all duration-300 group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-[#0A1931] group-hover:text-[#4A7FA7] transition-colors">
                          {participant.nama_lengkap}
                        </div>
                        <div className="text-sm text-[#4A7FA7]">
                          Daftar: {new Date(participant.tanggal_daftar).toLocaleDateString('id-ID')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[#4A7FA7]">
                          <div className="font-medium">{participant.email}</div>
                          <div className="text-sm">{participant.no_telepon}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {participant.event_joined.map((event, index) => (
                            <span key={index} className="px-2 py-1 bg-gradient-to-r from-[#4A7FA7]/20 to-[#1A3D63]/20 text-[#0A1931] rounded-full text-xs font-semibold border border-[#4A7FA7]/30">
                              {event}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[#4A7FA7]">
                          <div className="font-medium text-sm">ID: {participant.id}</div>
                          <div className="text-xs text-gray-600">Daftar: {new Date(participant.tanggal_daftar).toLocaleDateString('id-ID')}</div>
                          <div className="text-xs text-gray-600">Role: Peserta</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={participant.status_verifikasi}
                          onChange={(e) => handleStatusChange(participant.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(participant.status_verifikasi)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="verified">Verified</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-[#4A7FA7] font-semibold bg-[#4A7FA7]/10 px-2 py-1 rounded">
                          {participant.token_kehadiran}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          participant.sertifikat_diterbitkan
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-gray-100 text-gray-700 border-gray-200'
                        }`}>
                          {participant.sertifikat_diterbitkan ? 'Diterbitkan' : 'Belum'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => alert(`Detail peserta: ${participant.nama_lengkap}`)}
                            className="p-2 bg-gradient-to-r from-[#4A7FA7]/20 to-[#1A3D63]/20 text-[#0A1931] rounded-lg hover:from-[#4A7FA7]/30 hover:to-[#0A1931]/30 transition-all duration-300"
                            title="Lihat Detail"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => alert(`Edit peserta: ${participant.nama_lengkap}`)}
                            className="p-2 bg-gradient-to-r from-[#4A7FA7]/20 to-[#1A3D63]/20 text-[#0A1931] rounded-lg hover:from-[#4A7FA7]/30 hover:to-[#0A1931]/30 transition-all duration-300"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
        </div>
      </div>
    </AdminLayout>
  );
}
