import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TicketSelectionModal = ({ event, onClose }) => {
  const navigate = useNavigate();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Mock tickets if event doesn't have tickets data
  const eventTickets = event.tickets || [
    {
      id: 1,
      name: "Early Bird",
      price: 138000,
      features: ["Akses semua sesi", "Materi digital", "Sertifikat"],
      quota: 50,
      available: 12
    },
    {
      id: 2,
      name: "Regular",
      price: 250000,
      features: ["Akses semua sesi", "Materi digital", "Sertifikat", "Lunch"],
      quota: 100,
      available: 45
    },
    {
      id: 3,
      name: "VIP",
      price: 500000,
      features: ["Akses semua sesi", "Materi digital", "Sertifikat", "Lunch", "1-on-1 Consultation", "VIP Seating"],
      quota: 20,
      available: 8
    }
  ];

  const handleProceed = () => {
    if (!selectedTicket) {
      alert("Silakan pilih paket tiket terlebih dahulu");
      return;
    }

    // Navigate to registration page with selected ticket
    navigate(`/event/${event.id}/register`, {
      state: { 
        selectedTicket,
        quantity,
        fromModal: true
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Pilih Tiket Event</h2>
              <p className="text-white/90 font-medium">
                {event.judul_kegiatan || event.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Event Info Quick View */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#4A7FA7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-xs text-[#4A7FA7]/70 font-medium">Tanggal</p>
                  <p className="text-sm font-bold text-[#0A1931]">
                    {event.waktu_mulai ? new Date(event.waktu_mulai).toLocaleDateString('id-ID', { 
                      day: 'numeric',
                      month: 'short', 
                      year: 'numeric'
                    }) : 'TBA'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#4A7FA7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <div>
                  <p className="text-xs text-[#4A7FA7]/70 font-medium">Lokasi</p>
                  <p className="text-sm font-bold text-[#0A1931]">{event.lokasi_kegiatan || 'TBA'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Options */}
          <h3 className="text-lg font-bold text-[#0A1931] mb-4">Pilih Paket Tiket</h3>
          <div className="space-y-3 mb-6">
            {eventTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                  selectedTicket?.id === ticket.id
                    ? 'border-[#4A7FA7] bg-[#B3CFE5]/20 shadow-lg scale-[1.02]'
                    : 'border-[#4A7FA7]/20 hover:border-[#4A7FA7] hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-[#0A1931]">{ticket.name}</h4>
                    <p className="text-2xl font-bold text-[#4A7FA7] mt-1">
                      Rp {ticket.price.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedTicket?.id === ticket.id
                      ? 'border-[#4A7FA7] bg-[#4A7FA7]'
                      : 'border-[#4A7FA7]/30'
                  }`}>
                    {selectedTicket?.id === ticket.id && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                
                <div className="space-y-1 mb-3">
                  {ticket.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-[#4A7FA7]">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#4A7FA7]">Tersisa:</span>
                  <span className={`font-semibold ${ticket.available < 10 ? 'text-red-600' : 'text-[#0A1931]'}`}>
                    {ticket.available} / {ticket.quota} tiket
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quantity Selector */}
          {selectedTicket && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 mb-4 border border-blue-200">
              <label className="block text-sm font-semibold text-[#0A1931] mb-3">
                Jumlah Tiket
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 bg-white border-2 border-[#4A7FA7]/30 rounded-lg flex items-center justify-center text-[#0A1931] hover:bg-[#F6FAFD] transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(selectedTicket.available, parseInt(e.target.value) || 1)))}
                  className="flex-1 text-center text-xl font-bold bg-white border-2 border-[#4A7FA7]/30 rounded-lg py-2 px-4"
                  min="1"
                  max={selectedTicket.available}
                />
                <button
                  onClick={() => setQuantity(Math.min(selectedTicket.available, quantity + 1))}
                  className="w-10 h-10 bg-white border-2 border-[#4A7FA7]/30 rounded-lg flex items-center justify-center text-[#0A1931] hover:bg-[#F6FAFD] transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Total Price */}
          {selectedTicket && (
            <div className="bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between text-white">
                <span className="text-lg font-medium">Total Pembayaran:</span>
                <span className="text-2xl font-bold">
                  Rp {(selectedTicket.price * quantity).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleProceed}
              disabled={!selectedTicket}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-bold rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Lanjutkan Pendaftaran
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TicketSelectionModal;
