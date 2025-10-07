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
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: `url(${oceanBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/30 z-0"></div>

      {/* Card */}
      <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-md max-h-[95vh] overflow-y-auto shadow-2xl">
        {/* Icon */}
        <div className="w-12 h-12 mx-auto mb-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
        </div>

        {step === 1 ? (
          <>
            {/* Title */}
            <h1 className="text-2xl font-bold text-white text-center mb-2">
              Buat Akun Baru
            </h1>
            <p className="text-sm text-white/80 text-center mb-5">
              Daftarkan diri Anda untuk mengakses event menarik
            </p>

            {/* Form */}
            <form onSubmit={handleGenerateOtp} className="space-y-3.5">
              {error && (
                <div className="px-3 py-2.5 bg-red-500/20 border border-red-500/40 rounded-lg text-red-100 text-xs text-center backdrop-blur-md">
                  {error}
                </div>
              )}

              {/* Nama Lengkap */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-white/90">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="nama_lengkap"
                  value={formData.nama_lengkap}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama lengkap"
                  required
                  className="w-full px-3 py-2.5 bg-white/10 backdrop-blur-md border border-white/30 rounded-lg text-sm text-white placeholder-white/50 focus:outline-none focus:bg-white/15 focus:border-white/50 transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-white/90">
                  Alamat Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Masukkan email"
                  required
                  className="w-full px-3 py-2.5 bg-white/10 backdrop-blur-md border border-white/30 rounded-lg text-sm text-white placeholder-white/50 focus:outline-none focus:bg-white/15 focus:border-white/50 transition-all"
                />
              </div>

              {/* No Handphone */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-white/90">
                  No Handphone
                </label>
                <input
                  type="tel"
                  name="no_handphone"
                  value={formData.no_handphone}
                  onChange={handleInputChange}
                  placeholder="Masukkan nomor handphone"
                  required
                  className="w-full px-3 py-2.5 bg-white/10 backdrop-blur-md border border-white/30 rounded-lg text-sm text-white placeholder-white/50 focus:outline-none focus:bg-white/15 focus:border-white/50 transition-all"
                />
              </div>

              {/* Alamat */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-white/90">
                  Alamat Tempat Tinggal
                </label>
                <textarea
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleInputChange}
                  placeholder="Masukkan alamat lengkap"
                  rows="2"
                  required
                  className="w-full px-3 py-2.5 bg-white/10 backdrop-blur-md border border-white/30 rounded-lg text-sm text-white placeholder-white/50 focus:outline-none focus:bg-white/15 focus:border-white/50 transition-all resize-vertical"
                />
              </div>

              {/* Pendidikan */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-white/90">
                  Pendidikan Terakhir
                </label>
                <select
                  name="pendidikan_terakhir"
                  value={formData.pendidikan_terakhir}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2.5 bg-white/10 backdrop-blur-md border border-white/30 rounded-lg text-sm text-white focus:outline-none focus:bg-white/15 focus:border-white/50 transition-all cursor-pointer appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    paddingRight: '32px',
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
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-white/90">
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
                    className="w-full px-3 py-2.5 pr-10 bg-white/10 backdrop-blur-md border border-white/30 rounded-lg text-sm text-white placeholder-white/50 focus:outline-none focus:bg-white/15 focus:border-white/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                <p className="text-[11px] text-white/60 leading-tight mt-1">
                  Min. 8 karakter dengan huruf besar, kecil, angka, dan karakter spesial
                </p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-white/90">
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
                    className="w-full px-3 py-2.5 pr-10 bg-white/10 backdrop-blur-md border border-white/30 rounded-lg text-sm text-white placeholder-white/50 focus:outline-none focus:bg-white/15 focus:border-white/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-3 py-3 bg-white text-gray-800 rounded-lg text-sm font-bold shadow-lg hover:bg-white/95 hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              >
                {loading ? "Mengirim..." : "Lanjutkan"}
              </button>

              {/* Footer */}
              <div className="text-center text-sm text-white/80 mt-3">
                Sudah punya akun?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-white font-semibold underline hover:opacity-80 transition-opacity"
                >
                  Masuk
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            {/* OTP Verification */}
            <h1 className="text-2xl font-bold text-white text-center mb-2">
              Verifikasi Email
            </h1>
            <p className="text-sm text-white/80 text-center mb-5">
              Kode OTP telah dikirim ke <strong>{formData.email}</strong>
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-3.5">
              {error && (
                <div className="px-3 py-2.5 bg-red-500/20 border border-red-500/40 rounded-lg text-red-100 text-xs text-center backdrop-blur-md">
                  {error}
                </div>
              )}

              {/* OTP Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-white/90">
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
                  placeholder="Masukkan 6 digit OTP"
                  maxLength="6"
                  required
                  className="w-full px-3 py-2.5 bg-white/10 backdrop-blur-md border border-white/30 rounded-lg text-xl text-white text-center tracking-widest font-semibold placeholder-white/50 focus:outline-none focus:bg-white/15 focus:border-white/50 transition-all"
                />
              </div>

              {/* Timer */}
              <div className="px-3 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-center">
                {remainingTime > 0 ? (
                  <p className="text-sm text-white/90">
                    Kode akan kadaluarsa dalam: <strong className="text-white">{formatTime(remainingTime)}</strong>
                  </p>
                ) : (
                  <p className="text-sm text-red-200 font-semibold">
                    Kode OTP telah kadaluarsa
                  </p>
                )}
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading || remainingTime === 0}
                className="w-full px-3 py-3 bg-white text-gray-800 rounded-lg text-sm font-bold shadow-lg hover:bg-white/95 hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Memverifikasi..." : "Verifikasi & Daftar"}
              </button>

              {/* Actions */}
              <div className="flex justify-between items-center gap-3 mt-3">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-xs text-white font-semibold underline hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                  Kirim Ulang OTP
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-white font-semibold underline hover:opacity-80 transition-opacity"
                >
                  Ubah Email
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
