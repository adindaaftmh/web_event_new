# 🎨 Setup Flyer Hero Carousel - Instruksi Lengkap

## 📋 Perubahan yang Dibuat

### Backend (Laravel)
1. ✅ **Migration**: `create_flyers_table.php` - Tabel untuk menyimpan flyer
2. ✅ **Model**: `Flyer.php` - Model Eloquent dengan accessor image_url
3. ✅ **Controller**: `FlyerController.php` - Full CRUD API untuk flyers
4. ✅ **Routes**: API routes untuk public & protected endpoints
5. ✅ **Seeder**: `FlyerSeeder.php` - Data awal flyer untuk testing

### Frontend (React)
1. ✅ **UpdateFlyer.jsx**: Halaman admin dengan fitur:
   - Upload gambar dengan drag & drop
   - Preview gambar real-time
   - Form lengkap dengan validasi
   - Integrasi API backend
   - Desain modern dengan animasi
   
2. ✅ **HomePage.jsx**: Hero carousel menampilkan flyers dari database
   - Fetch flyers dari API
   - Auto-rotate carousel
   - Clickable links (jika ada)
   - Responsive design

## 🚀 Langkah-langkah Setup

### 1. Backend Setup

**PENTING: Jalankan perintah ini di terminal/command prompt**

```bash
# 1. Masuk ke direktori backend
cd c:\xampp\htdocs\event_app\web_event_new\backend

# 2. Jalankan migration untuk membuat tabel flyers
php artisan migrate

# 3. Jalankan seeder untuk data contoh (SANGAT DIREKOMENDASIKAN)
php artisan db:seed --class=FlyerSeeder

# 4. Pastikan storage linked (untuk upload gambar)
php artisan storage:link

# 5. JALANKAN BACKEND SERVER (WAJIB!)
php artisan serve
```

**Catatan:**
- Backend server HARUS berjalan di `http://localhost:8000`
- Jika belum jalankan seeder, halaman admin akan kosong
- Buka terminal baru untuk menjalankan frontend jika backend sudah running

### 2. Frontend Setup

Frontend sudah siap, tidak perlu install package tambahan karena menggunakan axios yang sudah ada.

### 3. Testing

#### A. Test Backend API (Gunakan Postman atau Thunder Client)

**1. Get Active Flyers (Public)**
```
GET http://localhost:8000/api/flyers/active
```

**2. Get All Flyers (Admin - Perlu Token)**
```
GET http://localhost:8000/api/flyers
Headers: Authorization: Bearer {admin_token}
```

**3. Create Flyer (Admin - Perlu Token)**
```
POST http://localhost:8000/api/flyers
Headers: 
  - Authorization: Bearer {admin_token}
  - Content-Type: multipart/form-data
Body (form-data):
  - title: "Music Festival 2024"
  - description: "Festival musik terbesar tahun ini"
  - order: 1
  - is_active: 1
  - image: [select file]
  - link_url: "https://example.com" (optional)
```

**4. Update Flyer (Admin - Perlu Token)**
```
POST http://localhost:8000/api/flyers/{id}?_method=PUT
Headers: 
  - Authorization: Bearer {admin_token}
  - Content-Type: multipart/form-data
Body: (sama seperti create, tapi image optional)
```

**5. Delete Flyer (Admin - Perlu Token)**
```
DELETE http://localhost:8000/api/flyers/{id}
Headers: Authorization: Bearer {admin_token}
```

**6. Toggle Active Status (Admin - Perlu Token)**
```
PATCH http://localhost:8000/api/flyers/{id}/toggle-active
Headers: Authorization: Bearer {admin_token}
```

#### B. Test Frontend

**1. Homepage**
- Buka: `http://localhost:3000/` atau `http://localhost:5173/`
- Cek hero carousel di bawah banner ocean
- Flyers harus auto-rotate setiap 5 detik
- Hover pada flyer untuk melihat efek zoom
- Klik flyer jika ada link_url

**2. Admin - Update Flyer Page**
- Login sebagai admin
- Buka: `/admin/settings/flyer`
- Test fitur:
  - ✅ Klik "Tambah Flyer Baru"
  - ✅ Upload gambar (drag & drop atau klik)
  - ✅ Lihat preview gambar real-time
  - ✅ Isi form dan simpan
  - ✅ Edit flyer yang sudah ada
  - ✅ Toggle status aktif/nonaktif
  - ✅ Hapus flyer

## 🎨 Fitur-Fitur Menarik

### Halaman Admin (UpdateFlyer.jsx)
- 🖼️ **Preview Real-time**: Lihat gambar sebelum upload
- 🎯 **Drag & Drop**: Upload gambar dengan cara drag & drop
- ✨ **Animasi Smooth**: Hover effects dan transitions
- 📱 **Responsive**: Tampil baik di mobile dan desktop
- 🔔 **Notifikasi**: Success/error message yang jelas
- 🎨 **Modern UI**: Desain konsisten dengan halaman admin lainnya
  - Background: `bg-[#F6FAFD]/90` (sama dengan AddEvent)
  - Button: `from-[#4A7FA7] to-[#1A3D63]` (sama dengan AddEvent)
  - Text: `text-[#0A1931]` untuk judul, `text-[#4A7FA7]` untuk subtitle
- 📊 **Status Badges**: Visual status aktif/nonaktif dengan warna konsisten
- 🔢 **Order Management**: Atur urutan tampil flyer
- 🎯 **Auto-adjust**: Layout menyesuaikan dengan sidebar yang expand/collapse

### Homepage (Hero Carousel)
- 🔄 **Auto Rotate**: Berganti otomatis setiap 5 detik
- 🖱️ **Navigation**: Tombol prev/next dengan smooth transition
- 🔗 **Clickable**: Buka link eksternal (jika ada)
- 📝 **Caption**: Tampilkan judul & deskripsi flyer
- 🎭 **Hover Effect**: Zoom in saat di-hover
- 📱 **Responsive**: Adaptif untuk semua ukuran layar

## 📁 Struktur File

```
backend/
├── app/
│   ├── Http/Controllers/
│   │   └── FlyerController.php          # CRUD API
│   └── Models/
│       └── Flyer.php                     # Model dengan accessor
├── database/
│   ├── migrations/
│   │   └── 2025_10_23_024800_create_flyers_table.php
│   └── seeders/
│       └── FlyerSeeder.php               # Data awal
├── routes/
│   └── api.php                           # Routes API
└── storage/app/public/flyers/            # Upload folder

frontend/
└── src/
    ├── pages/
    │   ├── admin/
    │   │   └── UpdateFlyer.jsx           # Admin page
    │   └── HomePage.jsx                  # Homepage dengan carousel
    └── components/
        └── AdminSidebar.jsx               # Menu sudah ada
```

## 🐛 Troubleshooting

### 1. Error "Class 'Flyer' not found"
```bash
# Clear cache dan regenerate autoload
composer dump-autoload
php artisan optimize:clear
```

### 2. Error "Storage link not found"
```bash
# Buat symbolic link
php artisan storage:link
```

### 3. Upload gambar gagal
- Pastikan folder `storage/app/public/flyers` ada
- Check permission folder (harus writable)
- Pastikan file size < 5MB

### 4. Flyers tidak muncul di homepage
- Check console browser untuk error API
- Pastikan backend running di `http://localhost:8000`
- Check endpoint: `http://localhost:8000/api/flyers/active`

### 5. CORS Error
Jika ada error CORS, pastikan di `backend/config/cors.php`:
```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => ['http://localhost:3000', 'http://localhost:5173'],
```

## 🎯 Next Steps

1. ✅ Jalankan migration
2. ✅ Jalankan seeder (opsional)
3. ✅ Test API dengan Postman
4. ✅ Login ke admin panel
5. ✅ Buka halaman Update Flyer
6. ✅ Tambah/edit flyer
7. ✅ Cek homepage untuk melihat hasil

## 📞 Support

Jika ada error atau pertanyaan, cek:
- Console browser (F12) untuk error frontend
- Laravel logs: `backend/storage/logs/laravel.log`
- Network tab di browser untuk cek API calls

---

**Happy Coding! 🚀✨**
