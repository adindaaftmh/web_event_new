# Setup Gmail SMTP untuk OTP System

## 🚨 **MASALAH: OTP Tidak Terkirim ke Gmail**

Saat ini sistem menggunakan `MAIL_MAILER=log` yang hanya menyimpan email ke log file. Untuk mengirim ke Gmail, kita perlu menggunakan SMTP.

## 📧 **Langkah 1: Setup Gmail App Password**

### **1. Aktifkan 2-Factor Authentication di Gmail:**
1. Buka [Google Account Settings](https://myaccount.google.com/)
2. Pilih "Security"
3. Aktifkan "2-Step Verification"

### **2. Buat App Password:**
1. Di halaman Security, cari "App passwords"
2. Pilih "Mail" dan "Other (Custom name)"
3. Beri nama: "Laravel OTP System"
4. Copy password yang dihasilkan (16 karakter)

## 🔧 **Langkah 2: Update File .env**

### **Buka file `.env` di folder `backend/` dan ganti konfigurasi email:**

```env
# Ganti konfigurasi email ini di file .env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-16-digit-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="your-email@gmail.com"
MAIL_FROM_NAME="Sistem Manajemen Kegiatan"
```

### **Contoh konfigurasi lengkap:**
```env
APP_NAME="Sistem Manajemen Kegiatan"
APP_ENV=local
APP_KEY=base64:your-app-key-here
APP_DEBUG=true
APP_URL=http://localhost:8000

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

# Email Configuration - Gmail SMTP
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-16-digit-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="your-email@gmail.com"
MAIL_FROM_NAME="Sistem Manajemen Kegiatan"

MEMCACHED_HOST=127.0.0.1

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=mt1

VITE_APP_NAME="${APP_NAME}"
VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_HOST="${PUSHER_HOST}"
VITE_PUSHER_PORT="${PUSHER_PORT}"
VITE_PUSHER_SCHEME="${PUSHER_SCHEME}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
```

## 🔑 **Langkah 3: Generate App Key (Jika Belum)**

```bash
cd backend
php artisan key:generate
```

## 🚀 **Langkah 4: Restart Server**

```bash
# Stop server (Ctrl+C)
# Jalankan ulang
php artisan serve
```

## 🧪 **Langkah 5: Test OTP System**

### **1. Buka Frontend:**
```bash
cd frontend
npm run dev
```

### **2. Test di Browser:**
- Frontend: `http://localhost:5173`
- Masukkan email Gmail Anda
- Klik "Kirim OTP"
- Cek inbox Gmail Anda

## 🔍 **Troubleshooting**

### **Jika OTP Masih Tidak Terkirim:**

#### **1. Cek Error Log:**
```bash
# Cek log Laravel
tail -f backend/storage/logs/laravel.log
```

#### **2. Test SMTP Manual:**
```bash
# Test koneksi SMTP
php artisan tinker
Mail::raw('Test email', function($message) {
    $message->to('your-email@gmail.com')
            ->subject('Test SMTP');
});
```

#### **3. Cek Konfigurasi:**
- Pastikan `MAIL_USERNAME` adalah email Gmail lengkap
- Pastikan `MAIL_PASSWORD` adalah App Password (bukan password Gmail biasa)
- Pastikan `MAIL_ENCRYPTION=tls`
- Pastikan `MAIL_PORT=587`

#### **4. Cek Gmail Settings:**
- Pastikan "Less secure app access" diaktifkan (jika tidak menggunakan App Password)
- Atau gunakan App Password (direkomendasikan)

## 📱 **Alternatif: Gunakan Mailtrap untuk Development**

Jika tidak ingin menggunakan Gmail, bisa menggunakan Mailtrap:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your-mailtrap-username
MAIL_PASSWORD=your-mailtrap-password
MAIL_ENCRYPTION=tls
```

## 🎯 **Konfigurasi yang Sudah Dibuat:**

- ✅ **Mail Driver:** SMTP Gmail
- ✅ **Template Email:** HTML yang menarik
- ✅ **OTP System:** Generate, validate, expiry
- ✅ **API Endpoints:** Generate, verify, resend
- ✅ **Frontend:** Form registrasi multi-step

## 🚀 **Next Steps:**

1. **Setup Gmail App Password**
2. **Update file `.env`** dengan konfigurasi Gmail
3. **Restart server** dengan `php artisan serve`
4. **Test OTP system** di frontend
5. **Cek inbox Gmail** untuk OTP

---

**Note:** Setelah setup Gmail SMTP, OTP akan dikirim langsung ke inbox Gmail Anda.
