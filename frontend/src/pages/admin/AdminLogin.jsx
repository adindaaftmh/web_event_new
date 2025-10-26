import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../config/api";
import oceanBg from "../../assets/ocean.jpg";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Email dan password harus diisi");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post("/login", formData);

      if (response.data.success) {
        const user = response.data.data.user;
        const token = response.data.data.token;
        
        // Cek apakah user adalah admin
        if (user.role !== 'admin') {
          setError("Akses ditolak. Halaman ini khusus untuk administrator.");
          setLoading(false);
          return;
        }

        // Simpan token untuk admin
        localStorage.setItem("adminToken", token);
        localStorage.setItem("authToken", token);
        localStorage.setItem("token", token);
        localStorage.setItem("adminUser", JSON.stringify(user));
        localStorage.setItem("user", JSON.stringify(user));
        
        if (rememberMe) {
          localStorage.setItem("rememberAdmin", "true");
        }
        
        alert("Login berhasil!");
        navigate("/admin/dashboard");
      }
    } catch (err) {
      console.error('Login error:', err.response?.data);
      setError(err.response?.data?.message || "Login gagal");
    } finally {
      setLoading(false);
    }
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
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                Selamat Datang!
              </h1>
              <p className="text-white/70 text-sm drop-shadow">
                Masuk sebagai administrator untuk mengelola kegiatan dan konten aplikasi
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/20 backdrop-blur-md border border-red-400/50 rounded-xl px-4 py-3 text-red-100 text-sm shadow-lg">
                  {error}
                </div>
              )}

              {/* Email */}
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
                    placeholder="Masukkan password"
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

              {/* Remember Me & Forgot Password */}
              <div className="flex justify-between items-center text-sm">
                <label className="flex items-center gap-2 text-white/90 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-white/10 border-white/30 text-white focus:ring-2 focus:ring-white/30"
                  />
                  <span className="drop-shadow">Ingat saya</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert("Hubungi super admin untuk reset password")}
                  className="text-white/90 font-semibold underline hover:no-underline hover:text-white transition-all drop-shadow"
                >
                  Lupa password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 px-6 py-3 bg-white text-gray-900 rounded-xl text-base font-bold shadow-xl hover:shadow-2xl hover:bg-white/95 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </span>
                ) : "Masuk"}
              </button>

              {/* Admin Access Notice */}
              <div className="mt-6 p-4 bg-yellow-500/10 backdrop-blur-sm border border-yellow-400/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-yellow-200 text-sm font-semibold mb-1">
                      🔐 Akses Khusus Administrator
                    </p>
                    <p className="text-yellow-100/80 text-xs leading-relaxed">
                      Halaman ini hanya dapat diakses oleh pengguna dengan role <span className="font-bold text-yellow-200">admin</span>. 
                      Jika Anda adalah pengguna biasa, silakan gunakan halaman login reguler.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-sm text-white/80 mt-4 drop-shadow">
                Bukan admin?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-white font-bold underline hover:no-underline transition-all"
                >
                  Login sebagai pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
