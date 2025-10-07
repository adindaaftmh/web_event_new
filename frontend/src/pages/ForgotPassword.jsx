import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../config/api";
import oceanBg from "../assets/ocean.jpg";
import "./ForgotPassword.css";

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

  const [remainingTime, setRemainingTime] = useState(300); // 5 minutes in seconds

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError("");
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
        startTimer();
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
      const response = await apiClient.post("/forgot-password", {
        email: formData.email,
      });

      if (response.data.success) {
        setSuccess("OTP baru telah dikirim ke email Anda");
        startTimer();
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
      setError(err.response?.data?.message || "Verifikasi OTP gagal");
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/;
    return password.length >= 8 && regex.test(password);
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

    if (!validatePassword(formData.password)) {
      setError("Password harus minimal 8 karakter dengan kombinasi huruf besar, huruf kecil, angka, dan karakter spesial (@$!%*?&#)");
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
    <div className="forgot-password-container" style={{ backgroundImage: `url(${oceanBg})` }}>
      <div className="forgot-password-overlay">
        <div className="forgot-password-card">
          <div className="forgot-password-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>

          {step === 1 && (
            <>
              <h1 className="forgot-password-title">Lupa Password?</h1>
              <p className="forgot-password-subtitle">
                Masukkan email Anda dan kami akan mengirimkan kode OTP untuk mereset password
              </p>

              <form onSubmit={handleSendOtp} className="forgot-password-form">
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Masukkan email Anda"
                    required
                  />
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Mengirim..." : "Kirim Kode OTP"}
                </button>

                <div className="form-footer">
                  <button type="button" onClick={() => navigate("/login")} className="link-btn">
                    ← Kembali ke Login
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="forgot-password-title">Verifikasi OTP</h1>
              <p className="forgot-password-subtitle">
                Kode OTP telah dikirim ke <strong>{formData.email}</strong>
              </p>

              <form onSubmit={handleVerifyOtp} className="forgot-password-form">
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <div className="form-group">
                  <label htmlFor="otp_code">Kode OTP</label>
                  <input
                    type="text"
                    id="otp_code"
                    name="otp_code"
                    value={formData.otp_code}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setFormData({ ...formData, otp_code: value });
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
                  {loading ? "Memverifikasi..." : "Verifikasi OTP"}
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

          {step === 3 && (
            <>
              <h1 className="forgot-password-title">Reset Password</h1>
              <p className="forgot-password-subtitle">
                Buat password baru untuk akun Anda
              </p>

              <form onSubmit={handleResetPassword} className="forgot-password-form">
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <div className="form-group">
                  <label htmlFor="password">Password Baru</label>
                  <div className="password-input">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Masukkan password baru"
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
                    Min. 8 karakter dengan huruf besar, huruf kecil, angka, dan karakter spesial
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
                      placeholder="Konfirmasi password baru"
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
                  {loading ? "Memproses..." : "Reset Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
