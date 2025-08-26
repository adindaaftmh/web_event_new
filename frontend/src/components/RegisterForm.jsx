import { useState } from 'react';
import { otpService } from '../services/apiService';

const RegisterForm = ({ onBack }) => {
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: complete
  const [formData, setFormData] = useState({
    email: '',
    otp_code: '',
    name: '',
    password: '',
    password_confirmation: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleGenerateOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await otpService.generateOtp(formData.email);
      if (response.data.success) {
        setStep(2);
        setSuccess('OTP berhasil dikirim ke email Anda');
        startCountdown();
        // Untuk development, tampilkan OTP di console
        console.log('OTP Code:', response.data.data.otp);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await otpService.verifyOtpAndRegister(formData);
      if (response.data.success) {
        setStep(3);
        setSuccess('Registrasi berhasil! Anda dapat login sekarang.');
        // Simpan token jika diperlukan
        localStorage.setItem('token', response.data.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal melakukan registrasi');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await otpService.resendOtp(formData.email);
      if (response.data.success) {
        setSuccess('OTP baru berhasil dikirim');
        startCountdown();
        // Untuk development, tampilkan OTP di console
        console.log('New OTP Code:', response.data.data.otp);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim ulang OTP');
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const renderStep1 = () => (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Registrasi Akun
        </h2>
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          ← Kembali
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleGenerateOtp}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan email Anda"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Mengirim OTP...' : 'Kirim OTP'}
        </button>
      </form>
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Verifikasi OTP
        </h2>
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          ← Kembali
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleVerifyOtp}>
        <div className="mb-4">
          <label htmlFor="otp_code" className="block text-sm font-medium text-gray-700 mb-2">
            Kode OTP
          </label>
          <input
            type="text"
            id="otp_code"
            name="otp_code"
            value={formData.otp_code}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest"
            placeholder="000000"
            maxLength="6"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Masukkan 6 digit kode OTP yang dikirim ke {formData.email}
          </p>
        </div>

        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Nama Lengkap
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan nama lengkap"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Minimal 8 karakter"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
            Konfirmasi Password
          </label>
          <input
            type="password"
            id="password_confirmation"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ulangi password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 mb-3"
        >
          {loading ? 'Memverifikasi...' : 'Verifikasi & Daftar'}
        </button>

        <button
          type="button"
          onClick={handleResendOtp}
          disabled={loading || countdown > 0}
          className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
        >
          {countdown > 0 ? `Kirim Ulang (${countdown}s)` : 'Kirim Ulang OTP'}
        </button>
      </form>

      <button
        onClick={() => setStep(1)}
        className="w-full mt-3 text-blue-600 hover:text-blue-800 text-sm"
      >
        ← Kembali ke Email
      </button>
    </div>
  );

  const renderStep3 = () => (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 text-center">
      <div className="mb-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Registrasi Berhasil!
        </h2>
        <p className="text-gray-600">
          Akun Anda telah berhasil dibuat. Anda dapat login sekarang.
        </p>
      </div>

      <button
        onClick={() => {
          setStep(1);
          setFormData({
            email: '',
            otp_code: '',
            name: '',
            password: '',
            password_confirmation: ''
          });
          setError('');
          setSuccess('');
        }}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
      >
        Daftar Akun Baru
      </button>

      <button
        onClick={onBack}
        className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
      >
        Kembali ke Dashboard
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
};

export default RegisterForm;
