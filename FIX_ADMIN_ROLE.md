# 🔧 Fix Error: Column 'role' not found

## ❌ Error yang Muncul
```
SQLSTATE[42S22]: Column not found: 1054 Unknown column 'role' in 'field list'
```

## ✅ Solusi: Tambahkan Kolom `role` ke Table Users

### **Opsi 1: Gunakan Script Otomatis (RECOMMENDED)** ⚡

Jalankan file batch yang sudah dibuat:
```bash
cd c:\xampp\htdocs\event_app\web_event_new\backend
setup_admin.bat
```

Script ini akan otomatis:
1. ✅ Menjalankan migration untuk menambah kolom `role`
2. ✅ Membuat akun admin
3. ✅ Menampilkan credentials login

---

### **Opsi 2: Manual Step-by-Step**

#### Step 1: Jalankan Migration
```bash
cd c:\xampp\htdocs\event_app\web_event_new\backend
php artisan migrate --path=database/migrations/2025_10_23_043300_add_role_to_users_table.php
```

Output yang benar:
```
Migration table created successfully.
Migrating: 2025_10_23_043300_add_role_to_users_table
Migrated:  2025_10_23_043300_add_role_to_users_table
```

#### Step 2: Buat Akun Admin
```bash
php artisan db:seed --class=AdminSeeder
```

Output yang benar:
```
✓ Admin user created successfully!
========================================
Email: admin@example.com
Password: admin123
Role: admin
Status: aktif
========================================
Login at: http://localhost:5173/admin/login
```

---

### **Opsi 3: Update Langsung di Database** 🗄️

Jika opsi di atas gagal, buka **phpMyAdmin**:

1. Pilih database Anda (misal: `event_app`)
2. Klik table `users`
3. Klik tab **Structure**
4. Klik **Add column**
5. Isi:
   - **Name**: `role`
   - **Type**: `ENUM`
   - **Length/Values**: `'user','admin'`
   - **Default**: `user`
   - **After**: `email`
6. Klik **Save**

Kemudian update user menjadi admin:
```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

Atau buat user admin baru:
```sql
INSERT INTO users (
    nama_lengkap, 
    email, 
    no_handphone, 
    password, 
    alamat, 
    pendidikan_terakhir, 
    status_akun, 
    role,
    created_at,
    updated_at
) VALUES (
    'Administrator',
    'admin@example.com',
    '081234567890',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Alamat Admin',
    'Diploma/Sarjana',
    'aktif',
    'admin',
    NOW(),
    NOW()
);
```

Password hash di atas = `password`

---

## 🎯 Verifikasi Setup Berhasil

### 1. Cek di Database
```sql
SELECT id, nama_lengkap, email, role, status_akun 
FROM users 
WHERE role = 'admin';
```

Harus muncul admin user Anda.

### 2. Cek di phpMyAdmin
- Buka table `users`
- Lihat kolom `role` sudah ada
- Ada user dengan `role = 'admin'`

### 3. Test Login
1. Buka: `http://localhost:5173/admin/login`
2. Login dengan:
   - Email: `admin@example.com`
   - Password: `admin123`
3. Jika berhasil, akan redirect ke dashboard

---

## ⚠️ Troubleshooting

### "Migration already ran"
Jika migration sudah pernah dijalankan:
```bash
php artisan migrate:rollback --step=1
php artisan migrate
```

### "Admin user already exists"
Bagus! Berarti akun admin sudah ada. Langsung login saja.

### "Table users doesn't exist"
Jalankan semua migration:
```bash
php artisan migrate:fresh
php artisan db:seed --class=FlyerSeeder
php artisan db:seed --class=AdminSeeder
```

⚠️ **WARNING**: `migrate:fresh` akan **menghapus semua data**!

---

## 📝 File yang Dibuat

1. ✅ `backend/database/migrations/2025_10_23_043300_add_role_to_users_table.php`
   - Migration untuk menambah kolom `role`

2. ✅ `backend/database/seeders/AdminSeeder.php`
   - Seeder untuk membuat akun admin

3. ✅ `backend/setup_admin.bat`
   - Script otomatis untuk setup admin

---

## 🚀 Setelah Fix Berhasil

Anda bisa:
1. ✅ Login di `/admin/login`
2. ✅ Akses halaman **Update Flyer Hero**
3. ✅ Upload dan manage flyers
4. ✅ Akses semua fitur admin panel

**Selamat! Admin setup sudah selesai! 🎉**
