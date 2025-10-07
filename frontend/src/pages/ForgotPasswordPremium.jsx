import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../config/api";
import oceanBg from "../assets/ocean.jpg";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    otp_code: "",
    password: "",
    password_confirmation: "",
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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError("");
    setSuccess("");
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.email) {
      setError("Email harus diisi");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post("/forgot-password", {
        email: formData.email,
      });

      if (response.data.success) {
        setSuccess("Kode OTP telah dikirim ke email Anda");
        setStep(2);
        setRemainingTime(300);
      }
    } catch (err) {
      console.error('Send OTP error:', err.response?.data);
      setError(err.response?.data?.message || "Gagal mengirim OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const response = await apiClient.post("/forgot-password", {
        email: formData.email,
      });

      if (response.data.success) {
        setSuccess("OTP baru telah dikirim ke email Anda");
        setRemainingTime(300);
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
    setSuccess("");

    if (!formData.otp_code || formData.otp_code.length !== 6) {
      setError("Masukkan kode OTP 6 digit");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post("/verify-reset-otp", {
        email: formData.email,
        otp_code: formData.otp_code,
      });

      if (response.data.success) {
        setSuccess("OTP valid, silakan masukkan password baru");
        setStep(3);
      }
    } catch (err) {
      console.error('Verify OTP error:', err.response?.data);
      setError(err.response?.data?.message || "Verifikasi OTP gagal");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.password || !formData.password_confirmation) {
      setError("Password dan konfirmasi password harus diisi");
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setError("Password dan konfirmasi password tidak cocok");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post("/reset-password", {
        email: formData.email,
        otp_code: formData.otp_code,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      });

      if (response.data.success) {
        alert("Password berhasil direset!");
        navigate("/login");
      }
    } catch (err) {
      console.error('Reset password error:', err.response?.data);
      setError(err.response?.data?.message || "Reset password gagal");
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
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${oceanBg})` }}
      />
      
      {/* Dramatic Cyan/Teal Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 via-teal-800/30 to-blue-900/40" />
      
      {/* Additional subtle overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Premium Glassmorphism Card */}
        <div className="bg-gray-900/15 backdrop-blur-2xl rounded-3xl border border-white/30 shadow-2xl p-8 overflow-hidden">
          {/* Subtle inner glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-3xl" />
          
          <div className="relative z-10">
            {/* Icon with glow */}
            <div className="w-16 h-16 mx-auto mb-6 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
              <svg className="w-8 h-8 text-white drop-shadow-lg" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>

            {/* Step 1: Email */}
            {step === 1 && (
              <>
                <div className="text-center mb-6">
                  <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                    Lupa Password?
                  </h1>
                  <p className="text-white/70 text-sm drop-shadow">
                    Masukkan email Anda dan kami akan mengirimkan kode OTP
                  </p>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-4">
                  {error && (
                    <div className="bg-red-500/20 backdrop-blur-md border border-red-400/50 rounded-xl px-4 py-3 text-red-100 text-sm shadow-lg">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="bg-green-500/20 backdrop-blur-md border border-green-400/50 rounded-xl px-4 py-3 text-green-100 text-sm shadow-lg">
                      {success}
                    </div>
                  )}

                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-1.5 drop-shadow">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Masukkan email Anda"
                      required
                      className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:bg-white/20 focus:border-white/50 focus:ring-2 focus:ring-white/30 transition-all duration-200 shadow-inner"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3 bg-white text-gray-900 rounded-xl text-base font-bold shadow-xl hover:shadow-2xl hover:bg-white/95 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Mengirim...
                      </span>
                    ) : "Kirim Kode OTP"}
                  </button>

                  <div className="text-center text-sm">
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="text-white/90 font-semibold underline hover:no-underline hover:text-white transition-all drop-shadow"
                    >
                      ← Kembali ke Login
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <>
                <div className="text-center mb-6">
                  <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                    Verifikasi OTP
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
                  {success && (
                    <div className="bg-green-500/20 backdrop-blur-md border border-green-400/50 rounded-xl px-4 py-3 text-green-100 text-sm shadow-lg">
                      {success}
                    </div>
                  )}

                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-2 text-center drop-shadow">
                      Kode OTP
                    </label>
                    <input
                      type="text"
                      name="otp_code"
                      value={formData.otp_code}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setFormData({ ...formData, otp_code: value });
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
                    ) : "Verifikasi OTP"}
                  </button>

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

            {/* Step 3: New Password */}
            {step === 3 && (
              <>
                <div className="text-center mb-6">
                  <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                    Reset Password
                  </h1>
                  <p className="text-white/70 text-sm drop-shadow">
                    Buat password baru untuk akun Anda
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  {error && (
                    <div className="bg-red-500/20 backdrop-blur-md border border-red-400/50 rounded-xl px-4 py-3 text-red-100 text-sm shadow-lg">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="bg-green-500/20 backdrop-blur-md border border-green-400/50 rounded-xl px-4 py-3 text-green-100 text-sm shadow-lg">
                      {success}
                    </div>
                  )}

                  {/* New Password */}
                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-1.5 drop-shadow">
                      Password Baru
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
                      Konfirmasi Password
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

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3 bg-white text-gray-900 rounded-xl text-base font-bold shadow-xl hover:shadow-2xl hover:bg-white/95 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Memproses...
                      </span>
                    ) : "Reset Password"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
