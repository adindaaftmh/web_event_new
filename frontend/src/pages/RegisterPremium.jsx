  import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../config/api";
import oceanBg from "../assets/ocean.jpg"; 

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModal, setErrorModal] = useState({ title: '', message: '' });
  
  const [formData, setFormData] = useState({
    nama_lengkap: "",
    email: "",
    no_handphone: "",
    alamat: "",
    pendidikan_terakhir: "",
    password: "",
    password_confirmation: "",
  });

  const [otpData, setOtpData] = useState({
    otp_code: "",
    expiresAt: null,
  });

  const [remainingTime, setRemainingTime] = useState(300);

  useEffect(() => {
    let timer;
    if (step === 2 && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, remainingTime]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const validateForm = () => {
    // Validasi password
    if (formData.password.length < 8) {
      setErrorModal({
        title: '❌ Password Terlalu Pendek',
        message: 'Password harus minimal 8 karakter'
      });
      setShowErrorModal(true);
      return false;
    }

    // Validasi password confirmation
    if (formData.password !== formData.password_confirmation) {
      setErrorModal({
        title: '❌ Password Tidak Cocok',
        message: 'Password dan Konfirmasi Password tidak sama. Silakan periksa kembali.'
      });
      setShowErrorModal(true);
      return false;
    }

    // Validasi no handphone
    if (!/^08[0-9]{8,11}$/.test(formData.no_handphone)) {
      setErrorModal({
        title: '❌ Nomor HP Tidak Valid',
        message: 'Nomor HP harus dimulai dengan 08 dan terdiri dari 10-13 digit'
      });
      setShowErrorModal(true);
      return false;
    }

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorModal({
        title: '❌ Format Email Salah',
        message: 'Masukkan alamat email yang valid'
      });
      setShowErrorModal(true);
      return false;
    }

    return true;
  };

  const handleGenerateOtp = async (e) => {
    e.preventDefault();
    setError("");

    // Validasi form sebelum kirim OTP
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post("/otp/generate", {
        email: formData.email,
      });

      if (response.data.success) {
        setOtpData({
          ...otpData,
          expiresAt: response.data.data.expires_at,
        });
        setStep(2);
        setRemainingTime(300);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Gagal mengirim OTP";
      setErrorModal({
        title: '❌ Gagal Mengirim OTP',
        message: errorMessage
      });
      setShowErrorModal(true);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await apiClient.post("/otp/resend", {
        email: formData.email,
      });

      if (response.data.success) {
        setOtpData({
          ...otpData,
          expiresAt: response.data.data.expires_at,
        });
        setRemainingTime(300);
        alert("OTP baru telah dikirim ke email Anda");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengirim ulang OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!otpData.otp_code || otpData.otp_code.length !== 6) {
      setError("Masukkan kode OTP 6 digit");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post("/otp/verify-register", {
        ...formData,
        otp_code: otpData.otp_code,
      });

      if (response.data.success) {
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
        alert("Registrasi berhasil!");
        navigate("/");
      }
    } catch (err) {
      console.error('Verification error:', err.response?.data);
      
      // Handle validation errors
      let errorMessage = '';
      let errorTitle = '❌ Verifikasi Gagal';
      
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        errorMessage = Object.values(errors).flat().join(', ');
        
        // Specific error for password mismatch
        if (errors.password_confirmation) {
          errorTitle = '❌ Password Tidak Cocok';
          errorMessage = 'Password dan Konfirmasi Password tidak sama';
        }
      } else {
        errorMessage = err.response?.data?.message || err.response?.data?.error || "Verifikasi OTP gagal";
      }
      
      setErrorModal({
        title: errorTitle,
        message: errorMessage
      });
      setShowErrorModal(true);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Error Modal Popup */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all animate-in zoom-in duration-200">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{errorModal.title}</h3>
              <p className="text-gray-600 mb-6">{errorModal.message}</p>
              <button
                onClick={() => setShowErrorModal(false)}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

        {/* Background Image*/}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${oceanBg})` }}
      />
      
      {/* Dramatic Cyan/Teal Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 via-teal-800/30 to-blue-900/40" />
      
      {/* Additional subtle overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-lg">
        {/* Premium Glassmorphism Card */}
        <div className="bg-gray-900/15 backdrop-blur-2xl rounded-3xl border border-white/30 shadow-2xl p-8 overflow-hidden">
          {/* Subtle inner glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-3xl" />
          
          <div className="relative z-10">
            {/* Icon with glow */}
            <div className="w-16 h-16 mx-auto mb-6 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
              <svg className="w-8 h-8 text-white drop-shadow-lg" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>

            {step === 1 ? (
              <>
                {/* Title */}
                <div className="text-center mb-6">
                  <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                    Buat Akun Baru
                  </h1>
                  <p className="text-white/70 text-sm drop-shadow">
                    Daftarkan diri Anda untuk mengakses event menarik
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleGenerateOtp} className="space-y-3">
                  {error && (
                    <div className="bg-red-500/20 backdrop-blur-md border border-red-400/50 rounded-xl px-4 py-3 text-red-100 text-sm shadow-lg">
                      {error}
                    </div>
                  )}

                  {/* Grid Layout */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Nama Lengkap */}
                    <div className="col-span-2">
                      <label className="block text-white/90 text-sm font-medium mb-1.5 drop-shadow">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        name="nama_lengkap"
                        value={formData.nama_lengkap}
                        onChange={handleInputChange}
                        placeholder="Masukkan nama lengkap"
                        required
                        className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:bg-white/20 focus:border-white/50 focus:ring-2 focus:ring-white/30 transition-all duration-200 shadow-inner"
                      />
                    </div>

                    {/* Email */}
                    <div className="col-span-2">
                      <label className="block text-white/90 text-sm font-medium mb-1.5 drop-shadow">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Masukkan email"
                        required
                        className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:bg-white/20 focus:border-white/50 focus:ring-2 focus:ring-white/30 transition-all duration-200 shadow-inner"
                      />
                    </div>

                    {/* No HP */}
                    <div>
                      <label className="block text-white/90 text-sm font-medium mb-1.5 drop-shadow">
                        No HP
                      </label>
                      <input
                        type="tel"
                        name="no_handphone"
                        value={formData.no_handphone}
                        onChange={handleInputChange}
                        placeholder="08xxx"
                        required
                        className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:bg-white/20 focus:border-white/50 focus:ring-2 focus:ring-white/30 transition-all duration-200 shadow-inner"
                      />
                    </div>

                    {/* Pendidikan */}
                    <div>
                      <label className="block text-white/90 text-sm font-medium mb-1.5 drop-shadow">
                        Pendidikan
                      </label>
                      <select
                        name="pendidikan_terakhir"
                        value={formData.pendidikan_terakhir}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:outline-none focus:bg-white/20 focus:border-white/50 focus:ring-2 focus:ring-white/30 transition-all duration-200 cursor-pointer appearance-none shadow-inner"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='white' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 12px center',
                          paddingRight: '36px',
                        }}
                      >
                        <option value="" className="bg-gray-900/95 text-white">Pilih</option>
                        <option value="SD/MI" className="bg-gray-900/95 text-white">SD/MI</option>
                        <option value="SMP/MTS" className="bg-gray-900/95 text-white">SMP/MTS</option>
                        <option value="SMA/SMK" className="bg-gray-900/95 text-white">SMA/SMK</option>
                        <option value="Diploma/Sarjana" className="bg-gray-900/95 text-white">Diploma/Sarjana</option>
                        <option value="Lainnya" className="bg-gray-900/95 text-white">Lainnya</option>
                      </select>
                    </div>

                    {/* Alamat */}
                    <div className="col-span-2">
                      <label className="block text-white/90 text-sm font-medium mb-1.5 drop-shadow">
                        Alamat
                      </label>
                      <input
                        type="text"
                        name="alamat"
                        value={formData.alamat}
                        onChange={handleInputChange}
                        placeholder="Masukkan alamat"
                        required
                        className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:bg-white/20 focus:border-white/50 focus:ring-2 focus:ring-white/30 transition-all duration-200 shadow-inner"
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-white/90 text-sm font-medium mb-1.5 drop-shadow">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Min. 8 karakter"
                          required
                          className="w-full px-4 py-2.5 pr-10 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:bg-white/20 focus:border-white/50 focus:ring-2 focus:ring-white/30 transition-all duration-200 shadow-inner"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                        >
                          {showPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-white/90 text-sm font-medium mb-1.5 drop-shadow">
                        Konfirmasi
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="password_confirmation"
                          value={formData.password_confirmation}
                          onChange={handleInputChange}
                          placeholder="Ulangi password"
                          required
                          className="w-full px-4 py-2.5 pr-10 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:bg-white/20 focus:border-white/50 focus:ring-2 focus:ring-white/30 transition-all duration-200 shadow-inner"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                        >
                          {showConfirmPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 px-6 py-3 bg-white text-gray-900 rounded-xl text-base font-bold shadow-xl hover:shadow-2xl hover:bg-white/95 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Mengirim...
                      </span>
                    ) : "Lanjutkan"}
                  </button>

                  {/* Footer */}
                  <div className="text-center text-sm text-white/80 mt-4 drop-shadow">
                    Sudah punya akun?{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="text-white font-bold underline hover:no-underline transition-all"
                    >
                      Masuk
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                {/* OTP Verification */}
                <div className="text-center mb-6">
                  <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                    Verifikasi Email
                  </h1>
                  <p className="text-white/70 text-sm drop-shadow">
                    Kode OTP telah dikirim ke<br />
                    <strong className="text-white">{formData.email}</strong>
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  {error && (
                    <div className="bg-red-500/20 backdrop-blur-md border border-red-400/50 rounded-xl px-4 py-3 text-red-100 text-sm shadow-lg">
                      {error}
                    </div>
                  )}

                  {/* OTP Input */}
                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-2 text-center drop-shadow">
                      Kode OTP
                    </label>
                    <input
                      type="text"
                      name="otp_code"
                      value={otpData.otp_code}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setOtpData({ ...otpData, otp_code: value });
                        setError("");
                      }}
                      placeholder="• • • • • •"
                      maxLength="6"
                      required
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-3xl text-white text-center tracking-[0.5em] font-bold placeholder-white/40 focus:outline-none focus:bg-white/20 focus:border-white/50 focus:ring-2 focus:ring-white/30 transition-all duration-200 shadow-inner"
                    />
                  </div>

                  {/* Timer */}
                  <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-xl px-4 py-3 text-center shadow-inner">
                    {remainingTime > 0 ? (
                      <p className="text-white/90">
                        Kadaluarsa dalam:{" "}
                        <span className="font-bold text-white text-lg drop-shadow">{formatTime(remainingTime)}</span>
                      </p>
                    ) : (
                      <p className="text-red-300 font-semibold drop-shadow">
                        Kode OTP telah kadaluarsa
                      </p>
                    )}
                  </div>

                  {/* Verify Button */}
                  <button
                    type="submit"
                    disabled={loading || remainingTime === 0}
                    className="w-full px-6 py-3 bg-white text-gray-900 rounded-xl text-base font-bold shadow-xl hover:shadow-2xl hover:bg-white/95 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Memverifikasi...
                      </span>
                    ) : "Verifikasi & Daftar"}
                  </button>

                  {/* Actions */}
                  <div className="flex justify-between items-center gap-4 text-sm">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="text-white/90 font-semibold underline hover:no-underline hover:text-white transition-all disabled:opacity-50 drop-shadow"
                    >
                      Kirim Ulang OTP
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-white/90 font-semibold underline hover:no-underline hover:text-white transition-all drop-shadow"
                    >
                      Ubah Email
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
