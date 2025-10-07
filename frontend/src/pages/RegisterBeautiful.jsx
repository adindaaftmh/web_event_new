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
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${oceanBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Glassmorphism Card */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
          {/* Logo/Icon */}
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
          </div>

          {step === 1 ? (
            <>
              {/* Title */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  Buat Akun Baru
                </h1>
                <p className="text-white/80 text-sm">
                  Daftarkan diri Anda untuk mengakses event menarik
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleGenerateOtp} className="space-y-4">
                {error && (
                  <div className="bg-red-500/20 backdrop-blur-md border border-red-400/50 rounded-xl px-4 py-3 text-red-100 text-sm">
                    {error}
                  </div>
                )}

                {/* Nama Lengkap */}
                <div>
                  <label className="block text-white/90 text-sm font-semibold mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="nama_lengkap"
                    value={formData.nama_lengkap}
                    onChange={handleInputChange}
                    placeholder="Masukkan nama lengkap"
                    required
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-white/90 text-sm font-semibold mb-2">
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Masukkan email"
                    required
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* No Handphone */}
                <div>
                  <label className="block text-white/90 text-sm font-semibold mb-2">
                    No Handphone
                  </label>
                  <input
                    type="tel"
                    name="no_handphone"
                    value={formData.no_handphone}
                    onChange={handleInputChange}
                    placeholder="Masukkan nomor handphone"
                    required
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Alamat */}
                <div>
                  <label className="block text-white/90 text-sm font-semibold mb-2">
                    Alamat Tempat Tinggal
                  </label>
                  <textarea
                    name="alamat"
                    value={formData.alamat}
                    onChange={handleInputChange}
                    placeholder="Masukkan alamat lengkap"
                    rows="2"
                    required
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200 resize-none"
                  />
                </div>

                {/* Pendidikan */}
                <div>
                  <label className="block text-white/90 text-sm font-semibold mb-2">
                    Pendidikan Terakhir
                  </label>
                  <select
                    name="pendidikan_terakhir"
                    value={formData.pendidikan_terakhir}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200 cursor-pointer appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='white' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      paddingRight: '40px',
                    }}
                  >
                    <option value="" className="bg-gray-800">Pilih pendidikan terakhir</option>
                    <option value="SD/MI" className="bg-gray-800">SD/MI</option>
                    <option value="SMP/MTS" className="bg-gray-800">SMP/MTS</option>
                    <option value="SMA/SMK" className="bg-gray-800">SMA/SMK</option>
                    <option value="Diploma/Sarjana" className="bg-gray-800">Diploma/Sarjana</option>
                    <option value="Lainnya" className="bg-gray-800">Lainnya</option>
                  </select>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-white/90 text-sm font-semibold mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Masukkan password"
                      required
                      className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors text-lg"
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                  <p className="text-white/60 text-xs mt-1.5 leading-relaxed">
                    Min. 8 karakter dengan huruf besar, kecil, angka, dan karakter spesial
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-white/90 text-sm font-semibold mb-2">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="password_confirmation"
                      value={formData.password_confirmation}
                      onChange={handleInputChange}
                      placeholder="Konfirmasi password"
                      required
                      className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors text-lg"
                    >
                      {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 px-6 py-4 bg-white text-gray-900 rounded-xl text-base font-bold shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                <div className="text-center text-sm text-white/80 mt-6">
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
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  Verifikasi Email
                </h1>
                <p className="text-white/80 text-sm">
                  Kode OTP telah dikirim ke<br />
                  <strong className="text-white">{formData.email}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {error && (
                  <div className="bg-red-500/20 backdrop-blur-md border border-red-400/50 rounded-xl px-4 py-3 text-red-100 text-sm">
                    {error}
                  </div>
                )}

                {/* OTP Input */}
                <div>
                  <label className="block text-white/90 text-sm font-semibold mb-2">
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
                    className="w-full px-4 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-3xl text-white text-center tracking-[0.5em] font-bold placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Timer */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-4 text-center">
                  {remainingTime > 0 ? (
                    <p className="text-white/90">
                      Kode akan kadaluarsa dalam:{" "}
                      <span className="font-bold text-white text-xl">{formatTime(remainingTime)}</span>
                    </p>
                  ) : (
                    <p className="text-red-300 font-semibold">
                      Kode OTP telah kadaluarsa
                    </p>
                  )}
                </div>

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={loading || remainingTime === 0}
                  className="w-full mt-4 px-6 py-4 bg-white text-gray-900 rounded-xl text-base font-bold shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                <div className="flex justify-between items-center gap-4 mt-6 text-sm">
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
