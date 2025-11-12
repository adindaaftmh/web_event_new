import React, { useState, useEffect } from "react";
import axios from "axios";

const PaymentButton = ({ amount, name, email, phone, onSuccess, onPending, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [countdown, setCountdown] = useState(86400); // 24 hours
  const [copied, setCopied] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [paymentChannels, setPaymentChannels] = useState([]);
  const [showCreditCardForm, setShowCreditCardForm] = useState(false);
  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardExpMonth: "",
    cardExpYear: "",
    cardCvn: "",
    cardHolderName: "",
  });
  const [cardErrors, setCardErrors] = useState({});
  const [isProcessingCard, setIsProcessingCard] = useState(false);

  useEffect(() => {
    if (showCheckout && countdown > 0) {
      const timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [showCheckout, countdown]);

  // Initialize Xendit SDK
  useEffect(() => {
    if (window.Xendit) {
      
      const publicKey = "xnd_public_development_RuMba32d7wkQe_KzrNNRcCinrAKq2XnlkOkrlWFfEXbSRpSYajhnZE5T123Cen"; 
      window.Xendit.setPublishableKey(publicKey);
      console.log('✅ Xendit SDK initialized');
    } else {
      console.error('❌ Xendit SDK not loaded');
    }
  }, []);

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  // Validate credit card
  const validateCard = () => {
    const newErrors = {};

    if (!cardData.cardNumber || cardData.cardNumber.replace(/\s/g, "").length < 13) {
      newErrors.cardNumber = "Nomor kartu tidak valid";
    }

    if (!cardData.cardExpMonth || !cardData.cardExpYear) {
      newErrors.expiry = "Tanggal kadaluarsa harus diisi";
    }

    if (!cardData.cardCvn || cardData.cardCvn.length < 3) {
      newErrors.cardCvn = "CVV tidak valid";
    }

    if (!cardData.cardHolderName || cardData.cardHolderName.trim().length < 3) {
      newErrors.cardHolderName = "Nama pemegang kartu harus diisi";
    }

    setCardErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle credit card payment with tokenization
  const handleCreditCardPayment = async (e) => {
    e.preventDefault();

    if (!validateCard()) {
      return;
    }

    if (!window.Xendit) {
      alert("Xendit SDK belum dimuat. Silakan refresh halaman.");
      return;
    }

    setIsProcessingCard(true);

    try {
      // Create token using Xendit.js (client-side tokenization)
      const tokenData = {
        card_number: cardData.cardNumber.replace(/\s/g, ""),
        card_exp_month: cardData.cardExpMonth,
        card_exp_year: cardData.cardExpYear,
        card_cvn: cardData.cardCvn,
        is_multiple_use: false,
        should_authenticate: true, // Enable 3DS for security
      };

      console.log('🔐 Creating card token...');

      window.Xendit.card.createToken(tokenData, async (err, response) => {
        if (err) {
          console.error("❌ Xendit tokenization error:", err);
          alert("Gagal membuat token kartu: " + (err.message || "Unknown error"));
          setIsProcessingCard(false);
          return;
        }

        console.log('✅ Token created:', response);

        if (response.status === "VERIFIED" || response.status === "APPROVED") {
          // Token created successfully, now charge it via backend
          try {
            console.log('💳 Charging card...');
            const chargeResponse = await axios.post("https://dynotix-production.up.railway.app/api/payment/charge-with-token", {
              order_id: paymentData.orderId,
              token_id: response.id,
              authentication_id: response.authentication_id,
              card_holder_name: cardData.cardHolderName,
              payment_method_type: "CARD",
            });

            console.log('💰 Charge response:', chargeResponse.data);

            if (chargeResponse.data.status === 'SUCCESS') {
              alert('✅ Pembayaran berhasil!\n\nCharge ID: ' + chargeResponse.data.charge_id);
              
              if (onSuccess) {
                onSuccess({ status: 'PAID' }, paymentData.orderId);
              }
              
              setShowCheckout(false);
              setShowCreditCardForm(false);
            } else if (chargeResponse.data.status === 'PENDING') {
              // May need 3DS authentication
              if (chargeResponse.data.payer_authentication_url) {
                window.open(chargeResponse.data.payer_authentication_url, '_blank');
                alert('⏳ Silakan selesaikan autentikasi 3DS di tab yang terbuka.');
              } else {
                alert('⏳ Pembayaran sedang diproses.');
              }
            } else {
              alert('❌ Pembayaran gagal: ' + chargeResponse.data.message);
            }
          } catch (chargeError) {
            console.error('❌ Charge error:', chargeError);
            const errorMsg = chargeError.response?.data?.error || chargeError.message;
            alert('❌ Gagal memproses pembayaran: ' + errorMsg);
          }
        } else {
          alert('⚠️ Kartu tidak dapat diverifikasi. Status: ' + response.status);
        }

        setIsProcessingCard(false);
      });
    } catch (error) {
      setIsProcessingCard(false);
      console.error('❌ Error:', error);
      alert('❌ Terjadi kesalahan: ' + error.message);
    }
  };

  const handlePayment = async () => {
    setIsLoading(true);

    try {
      const res = await axios.post("https://dynotix-production.up.railway.app/api/create-transaction", {
        amount,
        name,
        email,
        phone,
      });

      console.log('API Response:', res.data);
      
      // Check if this is MOCK payment (for testing without Xendit)
      if (res.data.mock === true) {
        console.log('MOCK PAYMENT MODE - Simulating successful payment');
        alert('🧪 MODE TESTING\n\nIni adalah pembayaran simulasi.\nPembayaran otomatis berhasil untuk testing.');
        
        // Simulate successful payment
        if (onSuccess) {
          onSuccess({ status: 'PAID' }, res.data.order_id);
        }
        setIsLoading(false);
        return;
      }

      // REAL XENDIT PAYMENT - Show custom checkout with payment channels
      console.log('Payment channels received:', res.data.payment_channels);
      
      setPaymentData({
        orderId: res.data.order_id,
        amount: res.data.amount,
        name,
        email,
        phone,
        expiresAt: res.data.expires_at
      });
      
      setPaymentChannels(res.data.payment_channels || []);
      setShowCheckout(true);
      setIsLoading(false);
      
      // Call onPending
      if (onPending) {
        onPending({ status: 'PENDING' }, res.data.order_id);
      }
      
    } catch (err) {
      console.error('ERROR DETAIL:', err);
      console.error('ERROR RESPONSE:', err.response?.data);
      console.error('ERROR RESPONSE (JSON):', JSON.stringify(err.response?.data, null, 2));
      
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      alert("Gagal membuat transaksi: " + errorMsg);
      
      if (onError) {
        onError(err);
      }
      
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectMethod = (channel) => {
    setSelectedMethod(channel);
    
    // Auto redirect hanya untuk e-wallet yang butuh checkout URL
    if (channel.type === 'EWALLET' && channel.checkout_url) {
      // Redirect ke e-wallet checkout page
      window.open(channel.checkout_url, '_blank');
    }
  };

  const handleCopyVA = (accountNumber) => {
    copyToClipboard(accountNumber);
  };

  const handlePaymentComplete = () => {
    if (onSuccess) {
      onSuccess({ status: 'PAID' }, paymentData.orderId);
    }
    setShowCheckout(false);
  };

  return (
    <>
      <button
        onClick={handlePayment}
        disabled={isLoading}
        className="w-full px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white text-lg font-bold rounded-xl hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        <span>{isLoading ? 'Memproses...' : `Bayar Rp ${amount.toLocaleString('id-ID')}`}</span>
      </button>

      {/* Custom Checkout Page */}
      {showCheckout && paymentData && (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-50 to-gray-100 overflow-y-auto">
          <div className="min-h-screen py-8 px-4">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">Pembayaran</h1>
                      <p className="text-sm text-gray-500">Order ID: {paymentData.orderId}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Left Column - Payment Details */}
                <div className="md:col-span-2 space-y-6">
                  {/* Timer */}
                  <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-100 text-sm mb-1">Selesaikan pembayaran dalam</p>
                        <p className="text-3xl font-bold font-mono">{formatTime(countdown)}</p>
                      </div>
                      <svg className="w-16 h-16 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>

                  {/* Payment Amount */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Total Pembayaran</h2>
                    <div className="bg-gradient-to-br from-[#4A7FA7]/10 to-[#1A3D63]/5 rounded-xl p-6 border-2 border-[#4A7FA7]/20">
                      <p className="text-sm text-gray-600 mb-2">Jumlah yang harus dibayar</p>
                      <p className="text-4xl font-bold text-[#4A7FA7]">Rp {paymentData.amount.toLocaleString('id-ID')}</p>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Pilih Metode Pembayaran</h2>
                    
                    {/* No payment channels message */}
                    {paymentChannels.length === 0 && (
                      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
                        <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-lg font-bold text-red-900 mb-2">Payment Channels Tidak Tersedia</h3>
                        <p className="text-sm text-red-700 mb-4">Tidak dapat membuat payment channels. Silakan coba lagi atau hubungi administrator.</p>
                        <p className="text-xs text-red-600">Order ID: {paymentData.orderId}</p>
                      </div>
                    )}
                    
                    {/* Dropdown Select */}
                    {paymentChannels.length > 0 && (
                      <div className="space-y-4">
                        <div className="relative">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Metode Pembayaran
                          </label>
                          <select
                            onChange={(e) => {
                              const selected = paymentChannels.find(ch => 
                                JSON.stringify(ch) === e.target.value
                              );
                              if (selected) handleSelectMethod(selected);
                            }}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#4A7FA7]/20 outline-none transition-all appearance-none bg-white cursor-pointer text-gray-900 font-medium"
                            defaultValue=""
                          >
                            <option value="" disabled>Pilih metode pembayaran...</option>
                            
                            {/* Virtual Account Options */}
                            {paymentChannels.filter(ch => ch.type === 'VIRTUAL_ACCOUNT').length > 0 && (
                              <optgroup label="🏦 Virtual Account - Transfer Bank">
                                {paymentChannels.filter(ch => ch.type === 'VIRTUAL_ACCOUNT').map((channel, idx) => (
                                  <option key={idx} value={JSON.stringify(channel)}>
                                    {channel.bank_name || channel.bank_code}
                                  </option>
                                ))}
                              </optgroup>
                            )}
                            
                            {/* E-Wallet Options */}
                            {paymentChannels.filter(ch => ch.type === 'EWALLET').length > 0 && (
                              <optgroup label="📱 E-Wallet">
                                {paymentChannels.filter(ch => ch.type === 'EWALLET').map((channel, idx) => (
                                  <option key={idx} value={JSON.stringify(channel)}>
                                    {channel.ewallet_type}
                                  </option>
                                ))}
                              </optgroup>
                            )}
                            
                            {/* QRIS Options */}
                            {paymentChannels.filter(ch => ch.type === 'QRIS').length > 0 && (
                              <optgroup label="📲 QRIS">
                                {paymentChannels.filter(ch => ch.type === 'QRIS').map((channel, idx) => (
                                  <option key={idx} value={JSON.stringify(channel)}>
                                    QRIS - Scan dengan E-Wallet
                                  </option>
                                ))}
                              </optgroup>
                            )}
                            
                            {/* Credit Card Options */}
                            {paymentChannels.filter(ch => ch.type === 'CREDIT_CARD').length > 0 && (
                              <optgroup label="💳 Kartu Kredit/Debit">
                                {paymentChannels.filter(ch => ch.type === 'CREDIT_CARD').map((channel, idx) => (
                                  <option key={idx} value={JSON.stringify(channel)}>
                                    Kartu Kredit / Debit
                                  </option>
                                ))}
                              </optgroup>
                            )}
                            
                            {/* Retail Outlet Options */}
                            {paymentChannels.filter(ch => ch.type === 'RETAIL_OUTLET').length > 0 && (
                              <optgroup label="🏪 Retail Outlet">
                                {paymentChannels.filter(ch => ch.type === 'RETAIL_OUTLET').map((channel, idx) => (
                                  <option key={idx} value={JSON.stringify(channel)}>
                                    {channel.outlet_name}
                                  </option>
                                ))}
                              </optgroup>
                            )}
                          </select>
                          
                          {/* Dropdown Arrow Icon */}
                          <div className="absolute right-4 top-11 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                        
                        {/* Selected Method Info */}
                        {selectedMethod && (
                          <div className="mt-4 p-4 bg-gradient-to-r from-[#4A7FA7]/10 to-blue-50 rounded-xl border-2 border-[#4A7FA7]/30">
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">
                                <svg className="w-5 h-5 text-[#4A7FA7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">
                                  {selectedMethod.type === 'VIRTUAL_ACCOUNT' && `Transfer Bank ${selectedMethod.bank_code}`}
                                  {selectedMethod.type === 'EWALLET' && `${selectedMethod.ewallet_type}`}
                                  {selectedMethod.type === 'QRIS' && 'QRIS Payment'}
                                  {selectedMethod.type === 'CREDIT_CARD' && 'Kartu Kredit/Debit'}
                                  {selectedMethod.type === 'RETAIL_OUTLET' && selectedMethod.outlet_name}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {selectedMethod.type === 'VIRTUAL_ACCOUNT' && 'Dapatkan nomor VA untuk transfer'}
                                  {selectedMethod.type === 'EWALLET' && 'Bayar langsung dari aplikasi'}
                                  {selectedMethod.type === 'QRIS' && 'Scan QR code dengan aplikasi e-wallet'}
                                  {selectedMethod.type === 'CREDIT_CARD' && 'Bayar dengan kartu kredit/debit'}
                                  {selectedMethod.type === 'RETAIL_OUTLET' && 'Bayar di toko retail terdekat'}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Payment Details */}
                  {selectedMethod && (
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                      <h2 className="text-lg font-bold text-gray-900 mb-4">Detail Pembayaran</h2>
                      
                      {/* Virtual Account Details */}
                      {selectedMethod.type === 'VIRTUAL_ACCOUNT' && selectedMethod.account_number && (
                        <div className="space-y-4">
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                            <div className="text-center mb-4">
                              <p className="text-sm text-gray-600 mb-2">Nomor Virtual Account</p>
                              <p className="text-lg font-bold text-gray-900">{selectedMethod.bank_name}</p>
                            </div>
                            
                            <div className="bg-white rounded-lg p-4 mb-4">
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-2xl md:text-3xl font-bold text-[#4A7FA7] font-mono tracking-wider">{selectedMethod.account_number}</p>
                                <button
                                  onClick={() => handleCopyVA(selectedMethod.account_number)}
                                  className="px-3 py-2 bg-[#4A7FA7] text-white rounded-lg hover:bg-[#3A6F97] transition-colors text-sm whitespace-nowrap"
                                >
                                  {copied ? 'Tersalin!' : 'Copy'}
                                </button>
                              </div>
                              <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Nama:</span>
                                  <span className="font-semibold text-gray-900">{selectedMethod.account_holder_name}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Jumlah:</span>
                                  <span className="font-bold text-[#4A7FA7]">Rp {selectedMethod.amount.toLocaleString('id-ID')}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <p className="text-xs font-semibold text-amber-900 mb-2">📱 Cara Transfer:</p>
                            <ol className="text-xs text-amber-800 space-y-1">
                              <li>1. Buka aplikasi mobile banking / m-banking</li>
                              <li>2. Pilih menu Transfer ke Virtual Account</li>
                              <li>3. Masukkan nomor VA di atas (atau klik Copy)</li>
                              <li>4. Pastikan jumlah sesuai: Rp {selectedMethod.amount.toLocaleString('id-ID')}</li>
                              <li>5. Konfirmasi dan selesaikan pembayaran</li>
                            </ol>
                          </div>
                        </div>
                      )}

                      {/* QRIS Details */}
                      {selectedMethod.type === 'QRIS' && (
                        <div className="space-y-4">
                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                            <p className="text-sm text-gray-600 mb-3 text-center">QR Code akan muncul di halaman pembayaran</p>
                            <p className="text-xs text-gray-500 mb-3 text-center">Tab baru sudah dibuka. Silakan scan QR code di halaman tersebut.</p>
                            <div className="flex justify-center">
                              <svg className="w-32 h-32 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                              </svg>
                            </div>
                          </div>
                          
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <p className="text-xs font-semibold text-amber-900 mb-2">Cara Bayar:</p>
                            <ol className="text-xs text-amber-800 space-y-1">
                              <li>1. Lihat QR code di tab yang terbuka</li>
                              <li>2. Buka aplikasi e-wallet (GoPay, OVO, DANA, dll)</li>
                              <li>3. Pilih menu Scan QR atau QRIS</li>
                              <li>4. Scan QR code tersebut</li>
                              <li>5. Konfirmasi pembayaran</li>
                            </ol>
                          </div>
                        </div>
                      )}

                      {/* E-Wallet Details */}
                      {selectedMethod.type === 'EWALLET' && (
                        <div className="space-y-4">
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                            <p className="text-sm text-gray-600 mb-3 text-center">Halaman pembayaran {selectedMethod.ewallet_type} sudah dibuka di tab baru</p>
                            <p className="text-xs text-gray-500 text-center">Silakan selesaikan pembayaran di aplikasi {selectedMethod.ewallet_type}</p>
                          </div>
                        </div>
                      )}

                      {/* Credit Card Details */}
                      {selectedMethod.type === 'CREDIT_CARD' && (
                        <div className="space-y-4">
                          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border-2 border-indigo-200">
                            <p className="text-sm text-gray-600 mb-3 text-center">Form kartu kredit sudah dibuka di tab baru</p>
                            <p className="text-xs text-gray-500 text-center">Masukkan detail kartu kredit/debit Anda untuk menyelesaikan pembayaran</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* Right Column - Order Summary */}
                <div className="md:col-span-1">
                  <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Ringkasan Pesanan</h2>
                    <div className="space-y-4">
                      <div className="pb-4 border-b border-gray-200">
                        <p className="text-sm text-gray-500 mb-1">Nama</p>
                        <p className="font-semibold text-gray-900">{paymentData.name}</p>
                      </div>
                      <div className="pb-4 border-b border-gray-200">
                        <p className="text-sm text-gray-500 mb-1">Email</p>
                        <p className="font-medium text-gray-900 text-sm break-all">{paymentData.email}</p>
                      </div>
                      <div className="pb-4 border-b border-gray-200">
                        <p className="text-sm text-gray-500 mb-1">No. Telepon</p>
                        <p className="font-semibold text-gray-900">{paymentData.phone}</p>
                      </div>
                      <div className="pb-4 border-b border-gray-200">
                        <p className="text-sm text-gray-500 mb-1">Order ID</p>
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-mono text-sm font-semibold text-gray-900">{paymentData.orderId}</p>
                          <button
                            onClick={() => copyToClipboard(paymentData.orderId)}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            title="Copy"
                          >
                            {copied ? (
                              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="pt-2">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-gray-700 font-semibold">Total</p>
                          <p className="text-2xl font-bold text-[#4A7FA7]">Rp {paymentData.amount.toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <button
                        onClick={handlePaymentComplete}
                        className="w-full py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors"
                      >
                        Saya Sudah Bayar
                      </button>
                      <button
                        onClick={() => setShowCheckout(false)}
                        className="w-full py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        Batalkan
                      </button>
                    </div>

                    <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="flex gap-2">
                        <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                          <p className="text-xs font-semibold text-amber-900 mb-1">Perhatian</p>
                          <p className="text-xs text-amber-800">Pastikan Anda menyelesaikan pembayaran sebelum waktu habis.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentButton;
