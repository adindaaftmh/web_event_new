# 🔐 Panduan Login Admin

## 📍 URL Login Admin
```
http://localhost:5173/admin/login
```
atau
```
http://localhost:3000/admin/login
```

## 🎯 Cara Login sebagai Admin

### Langkah 1: Pastikan Backend Running
```bash
cd c:\xampp\htdocs\event_app\web_event_new\backend
php artisan serve
```

### Langkah 2: Buat Akun Admin (Jika Belum Ada)

#### Opsi A: Menggunakan Seeder
```bash
cd c:\xampp\htdocs\event_app\web_event_new\backend
php artisan db:seed --class=AdminSeeder
```

#### Opsi B: Menggunakan Tinker
```bash
php artisan tinker
```
Lalu jalankan:
```php
$admin = new App\Models\User();
$admin->name = 'Admin';
$admin->email = 'admin@example.com';
$admin->password = bcrypt('admin123');
$admin->role = 'admin'; // PENTING: set role = admin
$admin->save();
```

#### Opsi C: Langsung di Database
Buka phpMyAdmin → table `users` → Insert:
- name: `Admin`
- email: `admin@example.com`
- password: `$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi` (password: `password`)
- role: `admin`
- email_verified_at: `2024-01-01 00:00:00`

### Langkah 3: Login ke Admin Panel

1. Buka browser: `http://localhost:5173/admin/login`
2. Masukkan credentials:
   - **Email**: `admin@example.com`
   - **Password**: `admin123` (atau `password` jika pakai hash default)
3. Klik **"Masuk sebagai Admin"**
4. Anda akan diarahkan ke `/admin/dashboard`

## 🔑 Default Admin Account (Jika sudah jalankan seeder)

```
Email: admin@example.com
Password: admin123
```

## ⚠️ Troubleshooting

### Error: "Akses ditolak. Hanya admin yang dapat login"
**Penyebab**: User tidak memiliki role `admin` di database

**Solusi**: Update role user di database:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

### Error: "Token tidak ditemukan"
**Penyebab**: Belum login

**Solusi**: Login dulu di `/admin/login`

### Error: "Login gagal"
**Penyebab**: Email/password salah atau backend belum running

**Solusi**:
1. Pastikan backend running: `php artisan serve`
2. Periksa credentials di database
3. Reset password jika lupa

### Error: "Session expired"
**Penyebab**: Token expired atau dihapus

**Solusi**: Login ulang

## 🎨 Fitur Halaman Login Admin

✅ **Desain yang Sama** dengan login user (ocean background)
✅ **Validasi Role** - Hanya admin yang bisa login
✅ **Remember Me** - Opsi untuk tetap login
✅ **Show/Hide Password** - Toggle visibility password
✅ **Auto Redirect** - Langsung ke dashboard setelah login
✅ **Error Handling** - Pesan error yang jelas
✅ **Info Box** - Panduan untuk user biasa
✅ **Multi Token Storage** - Disimpan di adminToken, authToken, dan token

## 🚀 Setelah Login

Anda akan diarahkan ke **Admin Dashboard** dengan akses ke:

📊 **Dashboard** - Overview statistik
📅 **Data Kegiatan** - Manage events
   - Tambah Kegiatan Baru
   - Daftar Kegiatan
   - Rekap Kegiatan
👥 **Data Peserta** - Manage participants
👤 **Daftar Akun Pengguna** - User management
⚙️ **Pengaturan**
   - **Update Flyer Hero** ← Yang Anda butuhkan!
   - Update Event Rekomendasi
   - Update Fakta Menarik

## 💡 Tips

1. **Bookmark URL** `/admin/login` untuk akses cepat
2. **Gunakan "Ingat saya"** agar tidak perlu login terus
3. **Jangan share credentials** admin ke sembarang orang
4. **Logout** setelah selesai di komputer publik

## 📝 Catatan Penting

- Role `admin` di database **harus** diset dengan benar
- Token disimpan di localStorage browser
- Clear cache jika ada masalah login
- Backend **harus** running di `http://localhost:8000`

---

**Selamat menggunakan Admin Panel! 🎉**
