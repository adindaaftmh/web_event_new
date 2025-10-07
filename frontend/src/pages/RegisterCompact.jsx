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

  const handleGenerateOtp = async (e) => {
    e.preventDefault();
    setError("");
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
      setError(err.response?.data?.message || "Gagal mengirim OTP");
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
      setError(err.response?.data?.message || "Verifikasi OTP gagal");
      console.error("Verify error:", err.response?.data);
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
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${oceanBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-lg">
        {/* Glassmorphism Card */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-2xl p-6 overflow-hidden">
          {/* Logo/Icon */}
          <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/30 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
          </div>

          {step === 1 ? (
            <>
              {/* Title */}
              <div className="text-center mb-4">
                <h1 className="text-2xl font-bold text-white mb-1">
                  Buat Akun Baru
                </h1>
                <p className="text-white/70 text-xs">
                  Daftarkan diri Anda untuk mengakses event menarik
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleGenerateOtp} className="space-y-2.5">
                {error && (
                  <div className="bg-red-500/20 backdrop-blur-md border border-red-400/50 rounded-lg px-3 py-2 text-red-100 text-xs">
                    {error}
                  </div>
                )}

                {/* Grid Layout for compact form */}
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Nama Lengkap */}
                  <div className="col-span-2">
                    <label className="block text-white/90 text-xs font-semibold mb-1">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      name="nama_lengkap"
                      value={formData.nama_lengkap}
                      onChange={handleInputChange}
                      placeholder="Masukkan nama lengkap"
                      required
                      className="w-full px-3 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-lg text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div className="col-span-2">
                    <label className="block text-white/90 text-xs font-semibold mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Masukkan email"
                      required
                      className="w-full px-3 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-lg text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* No HP */}
                  <div>
                    <label className="block text-white/90 text-xs font-semibold mb-1">
                      No HP
                    </label>
                    <input
                      type="tel"
                      name="no_handphone"
                      value={formData.no_handphone}
                      onChange={handleInputChange}
                      placeholder="08xxx"
                      required
                      className="w-full px-3 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-lg text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Pendidikan */}
                  <div>
                    <label className="block text-white/90 text-xs font-semibold mb-1">
                      Pendidikan
                    </label>
                    <select
                      name="pendidikan_terakhir"
                      value={formData.pendidikan_terakhir}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all cursor-pointer appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='white' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 10px center',
                        paddingRight: '32px',
                      }}
                    >
                      <option value="" className="bg-gray-800">Pilih</option>
                      <option value="SD/MI" className="bg-gray-800">SD/MI</option>
                      <option value="SMP/MTS" className="bg-gray-800">SMP/MTS</option>
                      <option value="SMA/SMK" className="bg-gray-800">SMA/SMK</option>
                      <option value="Diploma/Sarjana" className="bg-gray-800">Diploma/Sarjana</option>
                      <option value="Lainnya" className="bg-gray-800">Lainnya</option>
                    </select>
                  </div>

                  {/* Alamat */}
                  <div className="col-span-2">
                    <label className="block text-white/90 text-xs font-semibold mb-1">
                      Alamat
                    </label>
                    <input
                      type="text"
                      name="alamat"
                      value={formData.alamat}
                      onChange={handleInputChange}
                      placeholder="Masukkan alamat"
                      required
                      className="w-full px-3 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-lg text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-white/90 text-xs font-semibold mb-1">
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
                        className="w-full px-3 py-2 pr-9 bg-white/10 backdrop-blur-md border border-white/30 rounded-lg text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors text-sm"
                      >
                        {showPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-white/90 text-xs font-semibold mb-1">
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
                        className="w-full px-3 py-2 pr-9 bg-white/10 backdrop-blur-md border border-white/30 rounded-lg text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors text-sm"
                      >
                        {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-3 px-4 py-2.5 bg-white text-gray-900 rounded-lg text-sm font-bold shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Mengirim...
                    </span>
                  ) : "Lanjutkan"}
                </button>

                {/* Footer */}
                <div className="text-center text-xs text-white/80 mt-2">
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
              <div className="text-center mb-4">
                <h1 className="text-2xl font-bold text-white mb-1">
                  Verifikasi Email
                </h1>
                <p className="text-white/70 text-xs">
                  Kode OTP telah dikirim ke<br />
                  <strong className="text-white">{formData.email}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-3">
                {error && (
                  <div className="bg-red-500/20 backdrop-blur-md border border-red-400/50 rounded-lg px-3 py-2 text-red-100 text-xs">
                    {error}
                  </div>
                )}

                {/* OTP Input */}
                <div>
                  <label className="block text-white/90 text-xs font-semibold mb-1.5 text-center">
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
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-2xl text-white text-center tracking-[0.4em] font-bold placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                  />
                </div>

                {/* Timer */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-3 py-2.5 text-center">
                  {remainingTime > 0 ? (
                    <p className="text-white/90 text-sm">
                      Kadaluarsa dalam:{" "}
                      <span className="font-bold text-white">{formatTime(remainingTime)}</span>
                    </p>
                  ) : (
                    <p className="text-red-300 font-semibold text-sm">
                      Kode OTP telah kadaluarsa
                    </p>
                  )}
                </div>

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={loading || remainingTime === 0}
                  className="w-full px-4 py-2.5 bg-white text-gray-900 rounded-lg text-sm font-bold shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Memverifikasi...
                    </span>
                  ) : "Verifikasi & Daftar"}
                </button>

                {/* Actions */}
                <div className="flex justify-between items-center gap-3 text-xs">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-white font-semibold underline hover:no-underline transition-all disabled:opacity-50"
                  >
                    Kirim Ulang OTP
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-white font-semibold underline hover:no-underline transition-all"
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
  );
}
