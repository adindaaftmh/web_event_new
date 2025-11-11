import React, { useState, useEffect } from 'react';

export default function PaymentGateway({ isOpen, onClose, onPaymentSuccess, orderData }) {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedEwallet, setSelectedEwallet] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [countdown, setCountdown] = useState(3600);

  useEffect(() => {
    if (showInstructions && countdown > 0) {
      const timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [showInstructions, countdown]);

  if (!isOpen) return null;

  const paymentMethods = [
    { id: 'bank_transfer', name: 'Transfer Bank', icon: '🏦' },
    { id: 'virtual_account', name: 'Virtual Account', icon: '💳' },
    { id: 'ewallet', name: 'E-Wallet', icon: '📱' },
    { id: 'qris', name: 'QRIS', icon: '📲' }
  ];

  const banks = [
    { id: 'bca', name: 'BCA' }, { id: 'mandiri', name: 'Mandiri' },
    { id: 'bni', name: 'BNI' }, { id: 'bri', name: 'BRI' }
  ];

  const ewallets = [
    { id: 'gopay', name: 'GoPay' }, { id: 'ovo', name: 'OVO' },
    { id: 'dana', name: 'DANA' }, { id: 'shopeepay', name: 'ShopeePay' }
  ];

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setPaymentInfo({
        vaNumber: `8808${Math.random().toString().slice(2, 14)}`,
        paymentCode: `PAY${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        method: selectedMethod,
        bank: selectedBank,
        ewallet: selectedEwallet,
        amount: orderData?.totalAmount || 0
      });
      setIsProcessing(false);
      setShowInstructions(true);
    }, 2000);
  };

  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {!showInstructions ? (
          <>
            <div className="sticky top-0 bg-gradient-to-br from-[#4A7FA7] via-[#2F6890] to-[#1A3D63] p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Pembayaran</h2>
                  <p className="text-white/80 text-sm">Pilih metode pembayaran Anda</p>
                </div>
                <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border-2 border-blue-200">
                <h3 className="font-bold text-[#0A1931] mb-3">Ringkasan Pesanan</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Event:</span><span className="font-semibold text-[#0A1931]">{orderData?.eventName}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Tiket:</span><span className="font-semibold text-[#0A1931]">{orderData?.ticketType}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Jumlah:</span><span className="font-semibold text-[#0A1931]">{orderData?.quantity} tiket</span></div>
                  <div className="flex justify-between pt-3 border-t-2 border-blue-300"><span className="text-gray-700 font-bold">Total:</span><span className="text-xl font-bold text-[#4A7FA7]">Rp {orderData?.totalAmount?.toLocaleString('id-ID')}</span></div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-[#0A1931] mb-3">Pilih Metode Pembayaran</h3>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map(method => (
                    <button key={method.id} onClick={() => { setSelectedMethod(method.id); setSelectedBank(''); setSelectedEwallet(''); }}
                      className={`p-4 border-2 rounded-xl transition-all ${selectedMethod === method.id ? 'border-[#4A7FA7] bg-[#4A7FA7]/10 scale-105' : 'border-gray-200 hover:border-[#4A7FA7]/50'}`}>
                      <div className="text-3xl mb-2">{method.icon}</div>
                      <div className="font-semibold text-sm text-[#0A1931]">{method.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {(selectedMethod === 'bank_transfer' || selectedMethod === 'virtual_account') && (
                <div className="space-y-3">
                  <h4 className="font-bold text-[#0A1931]">Pilih Bank</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {banks.map(bank => (
                      <button key={bank.id} onClick={() => setSelectedBank(bank.id)}
                        className={`p-3 border-2 rounded-lg transition-all ${selectedBank === bank.id ? 'border-[#4A7FA7] bg-[#4A7FA7]/10' : 'border-gray-200 hover:border-[#4A7FA7]/50'}`}>
                        <div className="font-semibold text-sm">{bank.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedMethod === 'ewallet' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-[#0A1931]">Pilih E-Wallet</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {ewallets.map(ewallet => (
                      <button key={ewallet.id} onClick={() => setSelectedEwallet(ewallet.id)}
                        className={`p-3 border-2 rounded-lg transition-all ${selectedEwallet === ewallet.id ? 'border-[#4A7FA7] bg-[#4A7FA7]/10' : 'border-gray-200 hover:border-[#4A7FA7]/50'}`}>
                        <div className="font-semibold text-sm">{ewallet.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={handlePayment}
                disabled={!selectedMethod || (selectedMethod === 'bank_transfer' && !selectedBank) || (selectedMethod === 'virtual_account' && !selectedBank) || (selectedMethod === 'ewallet' && !selectedEwallet) || isProcessing}
                className="w-full py-4 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] text-white font-bold rounded-xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95">
                {isProcessing ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Memproses...</span> : 'Lanjutkan Pembayaran'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="sticky top-0 bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Menunggu Pembayaran</h2>
                  <p className="text-white/90 text-sm">Selesaikan pembayaran sebelum expired</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 text-center">
                <p className="text-sm text-red-700 mb-1">Batas Waktu Pembayaran</p>
                <p className="text-3xl font-bold text-red-600">{formatTime(countdown)}</p>
              </div>

              <div className="bg-gradient-to-br from-[#4A7FA7]/10 to-[#1A3D63]/5 rounded-2xl p-5 border-2 border-[#4A7FA7]/30">
                <h3 className="font-bold text-[#0A1931] mb-4">Detail Pembayaran</h3>
                <div className="space-y-4">
                  {(selectedMethod === 'bank_transfer' || selectedMethod === 'virtual_account') && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Nomor Virtual Account</p>
                      <div className="flex items-center gap-2 bg-white p-3 rounded-lg border-2 border-[#4A7FA7]/30">
                        <p className="flex-1 text-2xl font-mono font-bold text-[#0A1931]">{paymentInfo?.vaNumber}</p>
                        <button onClick={() => navigator.clipboard.writeText(paymentInfo?.vaNumber)} className="p-2 bg-[#4A7FA7] text-white rounded-lg hover:bg-[#1A3D63] transition">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {selectedMethod === 'qris' && (
                    <div className="text-center">
                      <div className="bg-white p-4 rounded-xl inline-block border-2 border-[#4A7FA7]/30">
                        <div className="w-48 h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                          <p className="text-4xl">📱</p>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">Scan QR Code</p>
                      </div>
                    </div>
                  )}

                  {selectedMethod === 'ewallet' && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-3">Kode Pembayaran</p>
                      <div className="bg-white p-4 rounded-xl inline-block border-2 border-[#4A7FA7]/30">
                        <p className="text-3xl font-mono font-bold text-[#0A1931]">{paymentInfo?.paymentCode}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Masukkan kode di aplikasi {selectedEwallet?.toUpperCase()}</p>
                    </div>
                  )}

                  <div className="pt-3 border-t-2 border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Pembayaran</span>
                      <span className="text-2xl font-bold text-[#4A7FA7]">Rp {paymentInfo?.amount?.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Cara Pembayaran
                </h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Salin nomor Virtual Account / kode pembayaran</li>
                  <li>Buka aplikasi mobile banking / e-wallet</li>
                  <li>Pilih menu transfer / pembayaran</li>
                  <li>Masukkan nomor VA / kode pembayaran</li>
                  <li>Konfirmasi pembayaran sesuai nominal</li>
                  <li>Simpan bukti pembayaran</li>
                </ol>
              </div>

              <div className="space-y-3">
                <button onClick={() => onPaymentSuccess({ ...paymentInfo, status: 'pending_verification', timestamp: new Date().toISOString() })}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:shadow-xl transition-all transform hover:scale-105 active:scale-95">
                  Saya Sudah Bayar
                </button>
                <button onClick={onClose} className="w-full py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition">
                  Batalkan
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}