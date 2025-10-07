import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../config/api";
import oceanBg from "../assets/ocean.jpg";

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Form, 2: OTP
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

  const [remainingTime, setRemainingTime] = useState(300); // 5 minutes in seconds

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError("");
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/;
    return password.length >= 8 && regex.test(password);
  };

  const handleGenerateOtp = async (e) => {
    e.preventDefault();
    setError("");

    // Validate form
    if (!formData.nama_lengkap || !formData.email || !formData.no_handphone || 
        !formData.alamat || !formData.pendidikan_terakhir || !formData.password || 
        !formData.password_confirmation) {
      setError("Semua field harus diisi");
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setError("Password dan konfirmasi password tidak cocok");
      return;
    }

    if (!validatePassword(formData.password)) {
      setError("Password harus minimal 8 karakter dengan kombinasi huruf besar, huruf kecil, angka, dan karakter spesial (@$!%*?&#)");
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
        startTimer();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengirim OTP");
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    setRemainingTime(300);
    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
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
        startTimer();
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
    <div className="register-container" style={{ backgroundImage: `url(${oceanBg})` }}>
      <div className="register-card">
        <div className="register-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
        </div>

        {step === 1 ? (
          <>
            <h1 className="register-title">Buat Akun Baru</h1>
            <p className="register-subtitle">Daftarkan diri Anda untuk mengakses event menarik</p>

            <form onSubmit={handleGenerateOtp} className="register-form">
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label htmlFor="nama_lengkap">Nama Lengkap</label>
                <input
                  type="text"
                  id="nama_lengkap"
                  name="nama_lengkap"
                  value={formData.nama_lengkap}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Alamat Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Masukkan email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="no_handphone">No Handphone</label>
                <input
                  type="tel"
                  id="no_handphone"
                  name="no_handphone"
                  value={formData.no_handphone}
                  onChange={handleInputChange}
                  placeholder="Masukkan nomor handphone"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="alamat">Alamat Tempat Tinggal</label>
                <textarea
                  id="alamat"
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleInputChange}
                  placeholder="Masukkan alamat lengkap"
                  rows="2"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="pendidikan_terakhir">Pendidikan Terakhir</label>
                <select
                  id="pendidikan_terakhir"
                  name="pendidikan_terakhir"
                  value={formData.pendidikan_terakhir}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Pilih pendidikan terakhir</option>
                  <option value="SD/MI">SD/MI</option>
                  <option value="SMP/MTS">SMP/MTS</option>
                  <option value="SMA/SMK">SMA/SMK</option>
                  <option value="Diploma/Sarjana">Diploma/Sarjana</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Masukkan password"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                <small className="input-hint">
                  Min. 8 karakter dengan huruf besar, kecil, angka, dan karakter spesial
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="password_confirmation">Konfirmasi Password</label>
                <div className="password-input">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="password_confirmation"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleInputChange}
                    placeholder="Konfirmasi password"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Mengirim..." : "Lanjutkan"}
              </button>

              <div className="register-footer">
                Sudah punya akun?{" "}
                <button type="button" onClick={() => navigate("/login")} className="link-btn">
                  Masuk
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h1 className="register-title">Verifikasi Email</h1>
            <p className="register-subtitle">
              Kode OTP telah dikirim ke <strong>{formData.email}</strong>
            </p>

            <form onSubmit={handleVerifyOtp} className="register-form">
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label htmlFor="otp_code">Kode OTP</label>
                <input
                  type="text"
                  id="otp_code"
                  name="otp_code"
                  value={otpData.otp_code}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setOtpData({ ...otpData, otp_code: value });
                    setError("");
                  }}
                  placeholder="Masukkan 6 digit OTP"
                  maxLength="6"
                  className="otp-input"
                  required
                />
              </div>

              <div className="otp-timer">
                {remainingTime > 0 ? (
                  <p>Kode akan kadaluarsa dalam: <strong>{formatTime(remainingTime)}</strong></p>
                ) : (
                  <p className="expired">Kode OTP telah kadaluarsa</p>
                )}
              </div>

              <button type="submit" className="submit-btn" disabled={loading || remainingTime === 0}>
                {loading ? "Memverifikasi..." : "Verifikasi & Daftar"}
              </button>

              <div className="otp-actions">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="link-btn"
                  disabled={loading}
                >
                  Kirim Ulang OTP
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="link-btn"
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
