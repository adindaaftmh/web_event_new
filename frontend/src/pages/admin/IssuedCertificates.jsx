import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { kegiatanService, daftarHadirService } from '../../services/apiService';

export default function IssuedCertificates() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [eventSearchTerm, setEventSearchTerm] = useState('');
  const [showEventDropdown, setShowEventDropdown] = useState(false);

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

  // Fetch certificates when event is selected
  useEffect(() => {
    if (selectedEvent) {
      fetchCertificates();
    }
  }, [selectedEvent]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      console.log('Fetching certificates for event:', selectedEvent?.id);
      
      const response = await daftarHadirService.getByKegiatan(selectedEvent.id);
      console.log('Certificates response:', response);
      
      if (response.data?.success) {
        const certificateData = response.data.data
          .filter(p => p.status_kehadiran === 'hadir') // Only show participants who attended
          .map(p => ({
            id: p.id,
            namaLengkap: p.nama_lengkap,
            email: p.email,
            nomorTelepon: p.no_telepon,
            nomorSertifikat: p.nomor_sertifikat || null,
            tanggalTerbit: p.tanggal_terbit_sertifikat || null,
            status: p.nomor_sertifikat ? 'diterbitkan' : 'belum_diterbitkan',
            kategoriKehadiran: p.tipe_peserta === 'tim' ? 'Tim' : 'Individu',
            ticket: p.tiket_dipilih
          }));
        
        console.log('Mapped certificates:', certificateData);
        setCertificates(certificateData);
      } else {
        setCertificates([]);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCertificate = async (certificateId) => {
    const nomorSertifikat = `CERT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    try {
      await daftarHadirService.issueCertificate(certificateId, {
        nomor_sertifikat: nomorSertifikat,
        tanggal_terbit_sertifikat: new Date().toISOString(),
      });

      setCertificates(prev => prev.map(cert => 
        cert.id === certificateId 
          ? { ...cert, status: 'diterbitkan', nomorSertifikat, tanggalTerbit: new Date().toISOString() }
          : cert
      ));
    } catch (error) {
      console.error('Error issuing certificate:', error);
      alert('Gagal menerbitkan sertifikat. Silakan coba lagi.');
    }
  };

  const handleRevokeCertificate = async (certificateId) => {
    if (!window.confirm('Apakah Anda yakin ingin mencabut sertifikat ini?')) return;

    try {
      await daftarHadirService.revokeCertificate(certificateId);

      setCertificates(prev => prev.map(cert => 
        cert.id === certificateId 
          ? { ...cert, status: 'belum_diterbitkan', nomorSertifikat: null, tanggalTerbit: null }
          : cert
      ));
    } catch (error) {
      console.error('Error revoking certificate:', error);
      alert('Gagal mencabut sertifikat. Silakan coba lagi.');
    }
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchSearch = cert.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       cert.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (cert.nomorSertifikat && cert.nomorSertifikat.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = filterStatus === 'all' || cert.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: certificates.length,
    diterbitkan: certificates.filter(c => c.status === 'diterbitkan').length,
    belumDiterbitkan: certificates.filter(c => c.status === 'belum_diterbitkan').length,
    persentase: certificates.length > 0 
      ? ((certificates.filter(c => c.status === 'diterbitkan').length / certificates.length) * 100).toFixed(1)
      : 0
  };

  // Filter events for search
  const filteredEvents = events.filter(event => {
    if (!eventSearchTerm || eventSearchTerm.trim() === '') return true;
    const searchLower = eventSearchTerm.toLowerCase();
    return event.judul_kegiatan.toLowerCase().includes(searchLower) ||
           event.lokasi_kegiatan?.toLowerCase().includes(searchLower);
  });

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setEventSearchTerm(event ? event.judul_kegiatan : '');
    setShowEventDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.event-selector-container')) {
        setShowEventDropdown(false);
      }
    };

    if (showEventDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEventDropdown]);

  return (
    <AdminLayout>
      <div className="min-h-screen relative bg-gradient-to-br from-slate-100 via-blue-50/30 to-indigo-100/40 overflow-hidden">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-blue-400/25 to-indigo-500/20 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-10 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/20 to-pink-500/15 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/3 w-[450px] h-[450px] bg-gradient-to-br from-cyan-400/20 to-blue-500/15 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-32 left-[15%] w-24 h-24 border-2 border-blue-400/50 rounded-full animate-float bg-gradient-to-br from-blue-200/20 to-indigo-300/15"></div>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#0A1931]">Daftar Sertifikat</h1>
                <p className="text-[#4A7FA7]">Kelola penerbitan sertifikat peserta event</p>
              </div>
            </div>
          </div>

          {/* Event Selector with Search */}
          <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 mb-6 event-selector-container relative z-50" style={{ isolation: 'isolate' }}>
            <label className="block text-sm font-bold text-[#0A1931] mb-3">
              Pilih Event
            </label>
            <div className="relative" style={{ zIndex: 100 }}>
              <div className="relative">
                <input
                  type="text"
                  value={selectedEvent ? selectedEvent.judul_kegiatan : eventSearchTerm}
                  onChange={(e) => {
                    setEventSearchTerm(e.target.value);
                    setSelectedEvent(null);
                    setShowEventDropdown(true);
                  }}
                  onFocus={() => {
                    if (!selectedEvent) {
                      setShowEventDropdown(true);
                      if (!eventSearchTerm) {
                        setEventSearchTerm('');
                      }
                    }
                  }}
                  placeholder="Cari atau pilih event..."
                  className="w-full pl-10 pr-10 py-3 bg-white border-2 border-[#4A7FA7]/20 rounded-xl text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors relative z-10"
                  readOnly={!!selectedEvent}
                />
                <svg className="w-5 h-5 text-[#4A7FA7] absolute left-3 top-1/2 -translate-y-1/2 z-20 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {selectedEvent && (
                  <button
                    onClick={() => {
                      setSelectedEvent(null);
                      setEventSearchTerm('');
                      setShowEventDropdown(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors z-20"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Dropdown Results */}
              {showEventDropdown && !selectedEvent && (
                <div className="absolute top-full left-0 right-0 z-[9999] mt-2 bg-white border-2 border-[#4A7FA7]/20 rounded-xl shadow-2xl max-h-60 overflow-y-auto" style={{ position: 'absolute' }}>
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map(event => (
                      <button
                        key={event.id}
                        onClick={() => handleEventSelect(event)}
                        className="w-full px-4 py-3 text-left hover:bg-[#4A7FA7]/10 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-semibold text-[#0A1931]">{event.judul_kegiatan}</div>
                        <div className="text-sm text-[#4A7FA7]">
                          {new Date(event.waktu_mulai).toLocaleDateString('id-ID')} • {event.lokasi_kegiatan}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-center text-gray-500 text-sm">
                      Tidak ada event yang ditemukan
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {selectedEvent ? (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                        <p className="text-[#4A7FA7] text-sm font-semibold mb-1">Diterbitkan</p>
                        <h3 className="text-3xl font-bold text-[#0A1931] mb-2">{stats.diterbitkan}</h3>
                        <p className="text-green-600 text-sm font-semibold">Sertifikat aktif</p>
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
                        <p className="text-[#4A7FA7] text-sm font-semibold mb-1">Belum Diterbitkan</p>
                        <h3 className="text-3xl font-bold text-[#0A1931] mb-2">{stats.belumDiterbitkan}</h3>
                        <p className="text-yellow-600 text-sm font-semibold">Perlu diterbitkan</p>
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
                        <p className="text-[#4A7FA7] text-sm font-semibold mb-1">Persentase Terbit</p>
                        <h3 className="text-3xl font-bold text-[#0A1931] mb-2">{stats.persentase}%</h3>
                        <p className="text-purple-600 text-sm font-semibold">Tingkat penerbitan</p>
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
              <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#0A1931] mb-2">Cari Peserta</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Nama, email, atau nomor sertifikat..."
                        className="w-full pl-10 pr-4 py-3 bg-white border-2 border-[#4A7FA7]/20 rounded-xl text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors"
                      />
                      <svg className="w-5 h-5 text-[#4A7FA7] absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0A1931] mb-2">Filter Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-4 py-3 bg-white border-2 border-[#4A7FA7]/20 rounded-xl text-[#0A1931] focus:border-[#4A7FA7] focus:outline-none transition-colors"
                    >
                      <option value="all">Semua Status</option>
                      <option value="diterbitkan">Diterbitkan</option>
                      <option value="belum_diterbitkan">Belum Diterbitkan</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Certificates Table */}
              <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold">No</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">Nama Peserta</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">Nomor Sertifikat</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">Kategori</th>
                        <th className="px-6 py-4 text-center text-sm font-bold">Status</th>
                        <th className="px-6 py-4 text-center text-sm font-bold">Tanggal Terbit</th>
                        <th className="px-6 py-4 text-center text-sm font-bold">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#4A7FA7]/10">
                      {filteredCertificates.length > 0 ? (
                        filteredCertificates.map((cert, index) => (
                          <tr key={cert.id} className="hover:bg-[#4A7FA7]/5 transition-colors">
                            <td className="px-6 py-4 text-sm text-[#0A1931]">{index + 1}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-full flex items-center justify-center text-white font-bold">
                                  {cert.namaLengkap.charAt(0)}
                                </div>
                                <span className="font-semibold text-[#0A1931]">{cert.namaLengkap}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#4A7FA7]">{cert.email}</td>
                            <td className="px-6 py-4">
                              {cert.nomorSertifikat ? (
                                <span className="font-mono text-sm text-[#0A1931] font-semibold">{cert.nomorSertifikat}</span>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                cert.kategoriKehadiran === 'Pembicara' 
                                  ? 'bg-purple-100 text-purple-700' 
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {cert.kategoriKehadiran}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {cert.status === 'diterbitkan' ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Diterbitkan
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Belum Diterbitkan
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center text-xs text-[#4A7FA7]">
                              {cert.tanggalTerbit 
                                ? new Date(cert.tanggalTerbit).toLocaleDateString('id-ID', { 
                                    day: 'numeric', 
                                    month: 'short', 
                                    year: 'numeric' 
                                  })
                                : '-'
                              }
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                {cert.status === 'diterbitkan' ? (
                                  <>
                                    <button
                                      onClick={() => alert(`Download sertifikat: ${cert.nomorSertifikat}`)}
                                      className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                                      title="Download"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => handleRevokeCertificate(cert.id)}
                                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                      title="Cabut"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => handleIssueCertificate(cert.id)}
                                    className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Terbitkan
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center justify-center text-[#4A7FA7]">
                              <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <p className="text-lg font-semibold">Tidak ada data sertifikat</p>
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
              <div className="flex justify-end">
                <button className="px-6 py-3 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-semibold rounded-xl hover:from-[#4A7FA7]/80 hover:to-[#0A1931] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export ke Excel
                </button>
              </div>
            </>
          ) : (
            <div className="bg-[#F6FAFD]/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-12 text-center">
              <svg className="w-20 h-20 text-[#4A7FA7] mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-bold text-[#0A1931] mb-2">Pilih Event</h3>
              <p className="text-[#4A7FA7]">Silakan pilih event terlebih dahulu untuk melihat daftar sertifikat</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
