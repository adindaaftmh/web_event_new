import React, { useRef } from 'react';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';

export default function TicketModal({ isOpen, onClose, ticketData }) {
  const ticketRef = useRef(null);

  if (!isOpen || !ticketData) return null;

  const handleDownload = async () => {
    try {
      const ticketElement = ticketRef.current;
      const canvas = await html2canvas(ticketElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
      });

      const link = document.createElement('a');
      link.download = `ticket-${ticketData.eventName.replace(/\s+/g, '-')}-${ticketData.registrationId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error downloading ticket:', error);
      alert('Gagal mendownload tiket. Silakan coba lagi.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Pendaftaran Berhasil!</h2>
                <p className="text-white/80 text-sm">Tiket Anda telah diterbitkan</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Thank You Section */}
        <div className="px-6 pt-6 pb-4">
          <div className="text-center mb-6">
            {/* Success Animation */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-4 animate-bounce">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            {/* Congratulations Message */}
            <h3 className="text-2xl font-bold text-[#0A1931] mb-2">
              Selamat! Pendaftaran Berhasil! 🎉
            </h3>
            <p className="text-[#4A7FA7] mb-4">
              Terima kasih telah mendaftar untuk <span className="font-semibold text-[#0A1931]">{ticketData.eventName}</span>
            </p>
            
            {/* Info Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-semibold text-blue-900">Email Terkirim</span>
                </div>
                <p className="text-xs text-blue-700">Cek email untuk konfirmasi</p>
              </div>
              
              <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  <span className="text-sm font-semibold text-green-900">E-Ticket Siap</span>
                </div>
                <p className="text-xs text-green-700">Download tiket Anda</p>
              </div>
              
              <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-semibold text-purple-900">Simpan Tanggal</span>
                </div>
                <p className="text-xs text-purple-700">Jangan sampai terlewat</p>
              </div>
            </div>

            {/* Important Notes */}
            <div className="mt-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 text-left">
              <div className="flex gap-3">
                <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-bold text-yellow-900 text-sm mb-2">Langkah Selanjutnya:</h4>
                  <ul className="text-xs text-yellow-800 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 font-bold">1.</span>
                      <span>Download dan simpan tiket Anda dengan aman</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 font-bold">2.</span>
                      <span>Cek email untuk informasi lebih lanjut tentang event</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 font-bold">3.</span>
                      <span>Tunjukkan QR Code saat check-in di lokasi event</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 font-bold">4.</span>
                      <span>Datang 15 menit lebih awal untuk registrasi</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Design */}
        <div className="px-6 pb-6">
          <div ref={ticketRef} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl overflow-hidden border-2 border-[#4A7FA7]/20 shadow-lg">
            {/* Ticket Header */}
            <div className="bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] p-6 relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                    <span className="text-white/80 text-sm font-semibold">E-TICKET</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">{ticketData.eventName}</h3>
                  <p className="text-white/80 text-sm">Kategori: {ticketData.category || 'Event'}</p>
                </div>
                <div className="text-right">
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <p className="text-white/80 text-xs mb-1">ID Tiket</p>
                    <p className="text-white font-bold text-lg">#{ticketData.registrationId}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dotted Line Separator */}
            <div className="relative h-8 bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="absolute top-1/2 left-0 w-full border-t-2 border-dashed border-[#4A7FA7]/30 -translate-y-1/2"></div>
              <div className="absolute top-1/2 -left-4 w-8 h-8 bg-white rounded-full -translate-y-1/2 shadow-lg"></div>
              <div className="absolute top-1/2 -right-4 w-8 h-8 bg-white rounded-full -translate-y-1/2 shadow-lg"></div>
            </div>

            {/* Ticket Body */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Left Side - Info */}
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-[#4A7FA7] font-semibold mb-1">NAMA PESERTA</p>
                    <p className="text-[#0A1931] font-bold text-lg">{ticketData.participantName}</p>
                  </div>

                  <div>
                    <p className="text-xs text-[#4A7FA7] font-semibold mb-1">EMAIL</p>
                    <p className="text-[#0A1931] font-medium">{ticketData.email}</p>
                  </div>

                  <div>
                    <p className="text-xs text-[#4A7FA7] font-semibold mb-1">NO. TELEPON</p>
                    <p className="text-[#0A1931] font-medium">{ticketData.phone}</p>
                  </div>

                  {ticketData.ticketType && (
                    <div>
                      <p className="text-xs text-[#4A7FA7] font-semibold mb-1">PAKET TIKET</p>
                      <p className="text-[#0A1931] font-bold">{ticketData.ticketType}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-[#4A7FA7] font-semibold mb-1">TANGGAL & WAKTU</p>
                    <p className="text-[#0A1931] font-medium">{formatDate(ticketData.eventDate)}</p>
                    <p className="text-[#0A1931] font-medium">{formatTime(ticketData.eventDate)} WIB</p>
                  </div>

                  <div>
                    <p className="text-xs text-[#4A7FA7] font-semibold mb-1">LOKASI</p>
                    <p className="text-[#0A1931] font-medium">{ticketData.location}</p>
                  </div>
                </div>

                {/* Right Side - QR Code */}
                <div className="flex flex-col items-center justify-center">
                  <div className="bg-white p-4 rounded-2xl shadow-lg border-2 border-[#4A7FA7]/20">
                    <QRCode
                      value={JSON.stringify({
                        registrationId: ticketData.registrationId,
                        token: ticketData.token,
                        email: ticketData.email,
                        eventId: ticketData.eventId
                      })}
                      size={180}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    />
                  </div>
                  <p className="text-xs text-[#4A7FA7] text-center mt-3 font-semibold">
                    Scan QR Code untuk Check-in
                  </p>
                  <p className="text-xs text-[#0A1931] text-center mt-1 font-mono bg-white px-3 py-1 rounded-lg">
                    {ticketData.token}
                  </p>
                </div>
              </div>

              {/* Important Notes */}
              <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                <div className="flex gap-2">
                  <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-bold text-yellow-800 mb-1">Catatan Penting:</p>
                    <ul className="text-xs text-yellow-700 space-y-1">
                      <li>• Simpan tiket ini dengan baik</li>
                      <li>• Tunjukkan QR Code saat check-in di lokasi event</li>
                      <li>• Datang 15 menit sebelum acara dimulai</li>
                      <li>• Tiket ini tidak dapat dipindahtangankan</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Footer */}
            <div className="bg-[#0A1931] p-4 text-center">
              <p className="text-white/60 text-xs">Powered by DYNOTIX Event Platform</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-gray-50 rounded-b-3xl flex gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-bold rounded-xl hover:from-[#4A7FA7]/90 hover:to-[#1A3D63]/90 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Tiket
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white border-2 border-[#4A7FA7] text-[#4A7FA7] font-bold rounded-xl hover:bg-[#4A7FA7] hover:text-white transition-all duration-300"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
