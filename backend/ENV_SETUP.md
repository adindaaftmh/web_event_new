# Setup Environment untuk Sistem OTP

## 🚨 **MASALAH: Email Tidak Terkirim**

Email tidak terkirim karena file `.env` belum dikonfigurasi dengan benar. Ikuti langkah-langkah di bawah ini.

## 📝 **Langkah 1: Buat File .env**

### **Buat file `.env` di folder `backend/` dengan isi:**

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

# Email Configuration - LOG Driver untuk Development
MAIL_MAILER=log
MAIL_HOST=localhost
MAIL_PORT=587
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="noreply@example.com"
MAIL_FROM_NAME="Sistem Manajemen Kegiatan"
MAIL_LOG_CHANNEL=mail

# Untuk Production (SMTP) - Uncomment dan sesuaikan
# MAIL_MAILER=smtp
# MAIL_HOST=smtp.gmail.com
# MAIL_PORT=587
# MAIL_USERNAME=your-email@gmail.com
# MAIL_PASSWORD=your-app-password
# MAIL_ENCRYPTION=tls

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

## 🔑 **Langkah 2: Generate App Key**

```bash
cd backend
php artisan key:generate
```

## 🗄️ **Langkah 3: Setup Database**

```bash
php artisan migrate:fresh
```

## 🚀 **Langkah 4: Jalankan Server**

```bash
php artisan serve
```

## 📧 **Langkah 5: Test OTP System**

### **1. Buka Frontend React:**
```bash
cd frontend
npm run dev
```

### **2. Buka Browser:**
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

### **3. Test Registrasi:**
1. Masukkan email → Klik "Kirim OTP"
2. Cek file log: `backend/storage/logs/mail.log`
3. Copy OTP dari log file
4. Masukkan OTP + data registrasi
5. Klik "Verifikasi & Daftar"

## 🔍 **Cek File Log Email**

### **Lokasi File Log:**
```
backend/storage/logs/mail.log
```

### **Isi File Log (Contoh):**
```
[2025-08-26 12:00:00] local.INFO: Message-ID: <abc123@localhost>
To: user@example.com
Subject: Kode OTP untuk Registrasi - Sistem Manajemen Kegiatan
From: Sistem Manajemen Kegiatan <noreply@example.com>

Halo!
Anda telah meminta kode OTP untuk registrasi akun di Sistem Manajemen Kegiatan.

Kode OTP Anda: 123456
Email: user@example.com
Berlaku hingga: 26/08/2025 12:10 WIB
```

## 🚨 **Troubleshooting**

### **Email Masih Tidak Terkirim:**

#### **1. Cek File .env:**
- Pastikan file `.env` ada di folder `backend/`
- Pastikan `MAIL_MAILER=log`
- Pastikan `MAIL_LOG_CHANNEL=mail`

#### **2. Cek Permission:**
```bash
# Pastikan folder storage bisa ditulis
chmod -R 755 backend/storage
chmod -R 755 backend/bootstrap/cache
```

#### **3. Cek Log Laravel:**
```bash
# Cek log Laravel umum
tail -f backend/storage/logs/laravel.log

# Cek log email khusus
tail -f backend/storage/logs/mail.log
```

#### **4. Restart Server:**
```bash
# Stop server (Ctrl+C)
# Jalankan ulang
php artisan serve
```

### **Error Database:**
```bash
php artisan migrate:fresh
php artisan config:clear
php artisan cache:clear
```

### **Error Mail:**
```bash
php artisan config:clear
php artisan cache:clear
php artisan view:clear
```

## 📱 **Test API Manual**

### **1. Generate OTP:**
```bash
curl -X POST http://localhost:8000/api/otp/generate \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### **2. Cek Response:**
```json
{
  "success": true,
  "message": "OTP berhasil dikirim ke email Anda",
  "data": {
    "email": "test@example.com",
    "expires_at": "2025-08-26 12:10:00"
  }
}
```

### **3. Cek File Log:**
```bash
cat backend/storage/logs/mail.log
```

## 🎯 **Konfigurasi yang Sudah Dibuat:**

- ✅ **Mail Driver:** LOG (development)
- ✅ **Log Channel:** mail
- ✅ **Template Email:** HTML yang menarik
- ✅ **OTP System:** Generate, validate, expiry
- ✅ **API Endpoints:** Generate, verify, resend
- ✅ **Frontend:** Form registrasi multi-step

## 🚀 **Next Steps:**

1. **Buat file `.env`** dengan konfigurasi di atas
2. **Generate app key** dengan `php artisan key:generate`
3. **Restart server** dengan `php artisan serve`
4. **Test OTP system** di frontend
5. **Cek file log** untuk email

---

**Note:** Setelah setup `.env`, email akan disimpan di `storage/logs/mail.log` untuk development.
