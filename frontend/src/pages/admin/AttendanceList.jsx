import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { kegiatanService, daftarHadirService } from '../../services/apiService';

export default function AttendanceList() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, hadir, tidak_hadir

  // Fetch all events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await kegiatanService.getAll();
        if (response.data?.success) {
          setEvents(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Fetch participants when event is selected
  useEffect(() => {
    if (selectedEvent) {
      fetchParticipants();
    }
  }, [selectedEvent]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      console.log('Fetching participants for event:', selectedEvent?.id);
      
      const response = await daftarHadirService.getByKegiatan(selectedEvent.id);
      console.log('Participants response:', response);
      
      if (response.data?.success) {
        const participantData = response.data.data.map(p => ({
          id: p.id,
          namaLengkap: p.nama_lengkap,
          email: p.email,
          nomorTelepon: p.no_telepon,
          pendidikanTerakhir: p.pendidikan_terakhir,
          status_kehadiran: p.status_kehadiran,
          waktu_kehadiran: p.waktu_absen,
          ticket: p.tiket_dipilih,
          tipe_peserta: p.tipe_peserta,
          nama_tim: p.nama_tim,
          status_verifikasi: p.status_verifikasi
        }));
        
        console.log('Mapped participants:', participantData);
        setParticipants(participantData);
      } else {
        setParticipants([]);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = (participantId) => {
    setParticipants(prev => prev.map(p => 
      p.id === participantId 
        ? { ...p, status_kehadiran: 'hadir', waktu_kehadiran: new Date().toISOString() }
        : p
    ));
  };

  const handleCheckOut = (participantId) => {
    setParticipants(prev => prev.map(p => 
      p.id === participantId 
        ? { ...p, status_kehadiran: 'tidak_hadir', waktu_kehadiran: null }
        : p
    ));
  };

  const filteredParticipants = participants.filter(participant => {
    const matchSearch = participant.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       participant.nomorTelepon.includes(searchTerm);
    
    const matchStatus = filterStatus === 'all' || participant.status_kehadiran === filterStatus;
    
    return matchSearch && matchStatus;
  });

  const stats = {
    total: participants.length,
    hadir: participants.filter(p => p.status_kehadiran === 'hadir').length,
    tidakHadir: participants.filter(p => p.status_kehadiran === 'tidak_hadir').length,
    persentase: participants.length > 0 
      ? ((participants.filter(p => p.status_kehadiran === 'hadir').length / participants.length) * 100).toFixed(1)
      : 0
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
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#0A1931]">Daftar Hadir Peserta</h1>
                <p className="text-[#4A7FA7]">Kelola kehadiran peserta event</p>
              </div>
            </div>
          </div>

          {/* Event Selector */}
          <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
            <label className="block text-sm font-bold text-[#0A1931] mb-3">
              Pilih Event
            </label>
            <select
              value={selectedEvent?.id || ''}
              onChange={(e) => {
                const event = events.find(ev => ev.id === parseInt(e.target.value));
                setSelectedEvent(event);
              }}
              className="w-full px-4 py-3 bg-white border-2 border-[#4A7FA7]/20 rounded-xl text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors"
            >
              <option value="">-- Pilih Event --</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>
                  {event.judul_kegiatan} - {new Date(event.waktu_mulai).toLocaleDateString('id-ID')}
                </option>
              ))}
            </select>
          </div>

          {selectedEvent && (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl border-2 border-[#4A7FA7]/20 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group hover:scale-105">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#4A7FA7] text-sm font-semibold mb-1">Total Peserta</p>
                        <h3 className="text-3xl font-bold text-[#0A1931] mb-2">{stats.total}</h3>
                        <p className="text-green-600 text-sm font-semibold">Terdaftar</p>
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
                        <p className="text-[#4A7FA7] text-sm font-semibold mb-1">Hadir</p>
                        <h3 className="text-3xl font-bold text-[#0A1931] mb-2">{stats.hadir}</h3>
                        <p className="text-green-600 text-sm font-semibold">Check-in berhasil</p>
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
                        <p className="text-[#4A7FA7] text-sm font-semibold mb-1">Tidak Hadir</p>
                        <h3 className="text-3xl font-bold text-[#0A1931] mb-2">{stats.tidakHadir}</h3>
                        <p className="text-yellow-600 text-sm font-semibold">Belum check-in</p>
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
                        <p className="text-[#4A7FA7] text-sm font-semibold mb-1">Persentase Hadir</p>
                        <h3 className="text-3xl font-bold text-[#0A1931] mb-2">{stats.persentase}%</h3>
                        <p className="text-purple-600 text-sm font-semibold">Tingkat kehadiran</p>
                      </div>
                      <div className="w-16 h-16 bg-gradient-to-br from-[#4A7FA7] to-[#0A1931] rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                      Cari Peserta
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Nama, email, atau nomor telepon..."
                        className="w-full pl-10 pr-4 py-3 bg-white border-2 border-[#4A7FA7]/20 rounded-xl text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors"
                      />
                      <svg className="w-5 h-5 text-[#4A7FA7] absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                      Filter Status
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-4 py-3 bg-white border-2 border-[#4A7FA7]/20 rounded-xl text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors"
                    >
                      <option value="all">Semua Status</option>
                      <option value="hadir">Hadir</option>
                      <option value="tidak_hadir">Tidak Hadir</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Participants Table */}
              <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold">No</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">Nama Lengkap</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">No. Telepon</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">Tiket</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">Pendidikan</th>
                        <th className="px-6 py-4 text-center text-sm font-bold">Status</th>
                        <th className="px-6 py-4 text-center text-sm font-bold">Waktu Kehadiran</th>
                        <th className="px-6 py-4 text-center text-sm font-bold">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#4A7FA7]/10">
                      {filteredParticipants.length > 0 ? (
                        filteredParticipants.map((participant, index) => (
                          <tr key={participant.id} className="hover:bg-[#4A7FA7]/5 transition-colors">
                            <td className="px-6 py-4 text-sm text-[#0A1931]">{index + 1}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-full flex items-center justify-center text-white font-bold">
                                  {participant.namaLengkap.charAt(0)}
                                </div>
                                <span className="font-semibold text-[#0A1931]">{participant.namaLengkap}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#4A7FA7]">{participant.email}</td>
                            <td className="px-6 py-4 text-sm text-[#0A1931]">{participant.nomorTelepon}</td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                {participant.ticket}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#0A1931]">{participant.pendidikanTerakhir}</td>
                            <td className="px-6 py-4 text-center">
                              {participant.status_kehadiran === 'hadir' ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Hadir
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Tidak Hadir
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center text-xs text-[#4A7FA7]">
                              {participant.waktu_kehadiran 
                                ? new Date(participant.waktu_kehadiran).toLocaleString('id-ID')
                                : '-'
                              }
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                {participant.status_kehadiran === 'hadir' ? (
                                  <button
                                    onClick={() => handleCheckOut(participant.id)}
                                    className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors"
                                  >
                                    Check Out
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleCheckIn(participant.id)}
                                    className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-colors"
                                  >
                                    Check In
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center justify-center text-[#4A7FA7]">
                              <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                              </svg>
                              <p className="text-lg font-semibold">Tidak ada peserta ditemukan</p>
                              <p className="text-sm">Coba ubah filter atau kata kunci pencarian</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Export Button */}
              <div className="mt-6 flex justify-end">
                <button className="px-6 py-3 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-semibold rounded-xl hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export ke Excel
                </button>
              </div>
            </>
          )}

          {!selectedEvent && (
            <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-12 text-center">
              <svg className="w-20 h-20 text-[#4A7FA7] mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-xl font-bold text-[#0A1931] mb-2">Pilih Event</h3>
              <p className="text-[#4A7FA7]">Silakan pilih event terlebih dahulu untuk melihat daftar hadir peserta</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
