# 🔐 CARA LOGIN ADMIN - LANGKAH MUDAH

## ✅ Credentials Login yang Benar

```
Email: admin@example.com
Password: admin123
```

---

## 🚀 Langkah-Langkah Login

### 1️⃣ Pastikan Backend Running
Buka Command Prompt/Terminal:
```bash
cd c:\xampp\htdocs\event_app\web_event_new\backend
php artisan serve
```

Pastikan muncul: `Server running on [http://127.0.0.1:8000]`

✅ **JANGAN TUTUP terminal ini!** Backend harus tetap running.

---

### 2️⃣ Buka Halaman Login Admin
Di browser, buka:
```
http://localhost:5183/admin/login
```

Atau jika port berbeda:
```
http://localhost:3000/admin/login
```

---

### 3️⃣ Masukkan Credentials
**Email:**
```
admin@example.com
```

**Password:**
```
admin123
```

- ✅ Centang "Ingat saya" jika ingin tetap login
- ✅ Klik tombol **"Masuk"**

---

### 4️⃣ Setelah Login Berhasil
Anda akan:
1. Melihat alert: **"Login berhasil! Selamat datang, Admin ..."**
2. Otomatis diarahkan ke **Admin Dashboard**
3. Bisa akses menu:
   - 📊 Dashboard
   - 📅 Data Kegiatan
   - 👥 Data Peserta  
   - 👤 Daftar Akun Pengguna
   - ⚙️ **Pengaturan** → **Update Flyer Hero** ← Yang Anda butuhkan!

---

## ⚠️ Jika Login Gagal

### Error: "Backend server tidak berjalan"
**Solusi:**
```bash
cd c:\xampp\htdocs\event_app\web_event_new\backend
php artisan serve
```

### Error: "Login gagal. Periksa email dan password"
**Penyebab:** Email atau password salah

**Solusi:** 
1. Pastikan email: `admin@example.com` (huruf kecil semua)
2. Pastikan password: `admin123` (huruf kecil semua)
3. Tidak ada spasi di depan/belakang

### Error: "Akses ditolak. Hanya admin yang dapat login"
**Penyebab:** User bukan admin

**Solusi:** Update role di database:
```bash
cd c:\xampp\htdocs\event_app\web_event_new\backend
php check_admin.php
```

Atau manual di phpMyAdmin:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

---

## 🔍 Cek Apakah User Admin Sudah Ada

Jalankan script cek:
```bash
cd c:\xampp\htdocs\event_app\web_event_new\backend
php check_admin.php
```

Output harus:
```
✓ User ditemukan!
-------------------------------------------
ID: 1
Nama: Admin User
Email: admin@example.com
Role: admin
Status: aktif
-------------------------------------------
```

---

## 📱 Browser Console Debug

Jika login masih gagal:

1. Buka browser → Tekan **F12**
2. Buka tab **Console**
3. Coba login lagi
4. Lihat pesan error:
   - `Attempting login with: admin@example.com` ✅
   - `Login response: {...}` ✅
   - `User role: admin` ✅
   - `Login successful, redirecting...` ✅

Jika ada error merah, screenshot dan lihat pesan errornya.

---

## 🎯 Setelah Berhasil Login

### Akses Update Flyer Hero:
1. Di sidebar kiri, buka **Pengaturan** (icon ⚙️)
2. Klik **Update Flyer Hero**
3. Klik tombol **"+ Tambah Flyer Baru"**
4. Upload gambar dan isi form
5. Klik **"Tambah Flyer"**
6. Lihat hasilnya di homepage carousel!

---

## 💡 Tips

- 🔐 **Password aman**: Ganti `admin123` setelah setup
- 💾 **Remember Me**: Centang agar tidak perlu login terus
- 🚀 **Bookmark**: Simpan `/admin/login` untuk akses cepat
- 🔄 **Refresh**: Tekan Ctrl+Shift+R jika tampilan tidak update

---

## 📞 Butuh Bantuan?

### Reset Password Admin:
```bash
cd c:\xampp\htdocs\event_app\web_event_new\backend
php artisan tinker
```

Lalu:
```php
$user = User::where('email', 'admin@example.com')->first();
$user->password = Hash::make('passwordbaru');
$user->save();
exit
```

### Buat Admin Baru:
```bash
php artisan db:seed --class=AdminSeeder
```

---

## ✅ Checklist Sebelum Login

- [ ] Backend running di `http://127.0.0.1:8000`
- [ ] Frontend running di `http://localhost:5173`
- [ ] Database sudah migrate
- [ ] User admin sudah ada (cek dengan `php check_admin.php`)
- [ ] Role user = 'admin'
- [ ] Status akun = 'aktif'

---

**Credentials Sekali Lagi:**
```
URL: http://localhost:5173/admin/login
Email: admin@example.com
Password: admin123
```

**Selamat login! 🎉**
