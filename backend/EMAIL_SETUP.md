# Setup Email untuk Sistem OTP

## 🚀 Konfigurasi Email yang Sudah Dibuat

Sistem OTP sudah dikonfigurasi dengan **Laravel Mail** dan template email yang lengkap.

## 📧 Konfigurasi Email Saat Ini

### 1. **Mail Driver: LOG** (Development)
- Email akan disimpan di file log: `storage/logs/mail.log`
- Tidak memerlukan SMTP server
- Cocok untuk development dan testing

### 2. **Template Email OTP**
- File: `resources/views/emails/otp.blade.php`
- Design yang menarik dan responsive
- Informasi lengkap: OTP code, expiry time, warning

## 🔧 Cara Menggunakan

### **Untuk Development (LOG Driver):**
1. Email akan disimpan di `storage/logs/mail.log`
2. Buka file log untuk melihat isi email
3. Tidak perlu setup SMTP

### **Untuk Production (SMTP Driver):**
1. Update file `.env` dengan konfigurasi SMTP
2. Gunakan Gmail, Mailgun, atau provider email lainnya

## 📝 Konfigurasi Environment

### **Copy file .env.example ke .env:**
```bash
cp .env.example .env
```

### **Update konfigurasi email di .env:**

#### **Untuk Development (LOG):**
```env
MAIL_MAILER=log
MAIL_HOST=localhost
MAIL_PORT=587
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="noreply@example.com"
MAIL_FROM_NAME="Sistem Manajemen Kegiatan"
MAIL_LOG_CHANNEL=mail
```

#### **Untuk Production (SMTP Gmail):**
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@example.com"
MAIL_FROM_NAME="Sistem Manajemen Kegiatan"
```

## 🎯 Fitur Email OTP

### **1. Generate OTP**
- **Endpoint:** `POST /api/otp/generate`
- **Body:** `{ "email": "user@example.com" }`
- **Response:** OTP dikirim ke email

### **2. Verify OTP & Register**
- **Endpoint:** `POST /api/otp/verify-register`
- **Body:** 
```json
{
  "email": "user@example.com",
  "otp_code": "123456",
  "name": "User Name",
  "password": "password123",
  "password_confirmation": "password123"
}
```

### **3. Resend OTP**
- **Endpoint:** `POST /api/otp/resend`
- **Body:** `{ "email": "user@example.com" }`

## 📋 Langkah Setup Lengkap

### **1. Setup Database**
```bash
php artisan migrate:fresh
```

### **2. Generate App Key**
```bash
php artisan key:generate
```

### **3. Jalankan Server**
```bash
php artisan serve
```

### **4. Test OTP System**
- Buka frontend React
- Coba registrasi dengan email
- Cek file log: `storage/logs/mail.log`

## 🔍 Troubleshooting

### **Email tidak terkirim:**
1. Cek file log: `storage/logs/mail.log`
2. Pastikan konfigurasi mail driver benar
3. Cek permission folder storage

### **OTP tidak valid:**
1. Cek database table `otp_codes`
2. Pastikan OTP belum expired (10 menit)
3. Cek apakah OTP sudah digunakan

### **Error Mail:**
1. Cek konfigurasi SMTP (jika menggunakan)
2. Pastikan credentials email benar
3. Cek firewall dan port SMTP

## 📱 Frontend Integration

Frontend React sudah terintegrasi dengan:
- ✅ Form registrasi multi-step
- ✅ Input OTP dengan validation
- ✅ Error handling
- ✅ Loading states
- ✅ Countdown timer untuk resend

## 🎨 Template Email Features

- ✅ Design responsive
- ✅ OTP code yang jelas
- ✅ Informasi expiry time
- ✅ Warning dan instruksi
- ✅ Branding aplikasi
- ✅ Footer yang informatif

## 🚀 Next Steps

1. **Test sistem OTP** dengan email development
2. **Setup SMTP** untuk production
3. **Customize template email** sesuai kebutuhan
4. **Add email verification** untuk login
5. **Implement rate limiting** untuk OTP

---

**Note:** Untuk development, email akan disimpan di log file. Untuk production, gunakan SMTP server yang reliable.
