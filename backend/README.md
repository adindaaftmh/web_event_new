<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

You may also try the [Laravel Bootcamp](https://bootcamp.laravel.com), where you will be guided through building a modern Laravel application from scratch.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com/)**
- **[Tighten Co.](https://tighten.co)**
- **[WebReinvent](https://webreinvent.com/)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel/)**
- **[Cyber-Duck](https://cyber-duck.co.uk)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Jump24](https://jump24.co.uk)**
- **[Redberry](https://redberry.international/laravel/)**
- **[Active Logic](https://activelogic.com)**
- **[byte5](https://byte5.de)**
- **[OP.GG](https://op.gg)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

# Sistem Manajemen Kegiatan dan Kehadiran

Sistem ini adalah aplikasi backend Laravel untuk mengelola kegiatan dan kehadiran peserta dengan fitur OTP untuk absensi.

## Struktur Database

Sistem ini terdiri dari 4 tabel utama:

### 1. Users
- `id` - Primary Key
- `email` - Email user (unique)
- `no_handphone` - Nomor telepon
- `password` - Password (hashed)
- `alamat` - Alamat lengkap
- `pendidikan_terakhir` - Enum (SD/MI, SMP/MTS, SMA/SMK, Diploma/Sarjana, Lainnya)
- `status_akun` - Enum (aktif, belum-aktif)
- `otp` - OTP untuk verifikasi

### 2. Kategori Kegiatan
- `id` - Primary Key
- `nama_kategori` - Nama kategori
- `slug` - Slug untuk URL (unique)
- `kategori_logo` - Logo kategori

### 3. Kegiatan
- `id` - Primary Key
- `kategori_id` - Foreign Key ke kategori_kegiatan
- `judul_kegiatan` - Judul kegiatan
- `slug` - Slug untuk URL (unique)
- `deskripsi_kegiatan` - Deskripsi lengkap
- `lokasi_kegiatan` - Lokasi kegiatan
- `flyer_kegiatan` - File flyer
- `sertifikat_kegiatan` - File sertifikat
- `waktu_mulai` - Waktu mulai (datetime)
- `waktu_berakhir` - Waktu berakhir (datetime)

### 4. Daftar Hadir
- `id` - Primary Key
- `user_id` - Foreign Key ke users
- `kegiatan_id` - Foreign Key ke kegiatan
- `otp` - OTP untuk absensi (10 karakter)
- `status_absen` - Enum (hadir, tidak-hadir)
- `waktu_absen` - Waktu absen (datetime)

## Setup dan Instalasi

### Prerequisites
- PHP 8.1 atau lebih tinggi
- Composer
- MySQL/MariaDB
- Laravel 11

### Langkah Instalasi

1. Clone repository
```bash
git clone <repository-url>
cd backend
```

2. Install dependencies
```bash
composer install
```

3. Copy environment file
```bash
cp .env.example .env
```

4. Konfigurasi database di file `.env`
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nama_database
DB_USERNAME=username
DB_PASSWORD=password
```

5. Generate application key
```bash
php artisan key:generate
```

6. Jalankan migration dan seeder
```bash
php artisan migrate:fresh --seed
```

7. Jalankan server development
```bash
php artisan serve
```

## API Documentation

Base URL: `http://localhost:8000/api`

### Authentication
Saat ini sistem belum menggunakan authentication. Semua endpoint dapat diakses tanpa token.

### Endpoints

#### 1. Kategori Kegiatan

**GET /api/kategori-kegiatan**
- Mendapatkan semua kategori kegiatan
- Response: Array kategori kegiatan

**POST /api/kategori-kegiatan**
- Membuat kategori kegiatan baru
- Body:
  ```json
  {
    "nama_kategori": "Seminar",
    "kategori_logo": "seminar-icon.png"
  }
  ```

**GET /api/kategori-kegiatan/{id}**
- Mendapatkan detail kategori kegiatan
- Response: Object kategori kegiatan dengan relasi kegiatan

**PUT /api/kategori-kegiatan/{id}**
- Update kategori kegiatan
- Body: sama dengan POST

**DELETE /api/kategori-kegiatan/{id}**
- Hapus kategori kegiatan

#### 2. Kegiatan

**GET /api/kegiatan**
- Mendapatkan semua kegiatan
- Response: Array kegiatan dengan relasi kategori

**POST /api/kegiatan**
- Membuat kegiatan baru
- Body:
  ```json
  {
    "kategori_id": 1,
    "judul_kegiatan": "Seminar Teknologi",
    "deskripsi_kegiatan": "Deskripsi kegiatan...",
    "lokasi_kegiatan": "Jakarta Convention Center",
    "flyer_kegiatan": "flyer.jpg",
    "sertifikat_kegiatan": "sertifikat.pdf",
    "waktu_mulai": "2024-01-15 09:00:00",
    "waktu_berakhir": "2024-01-15 17:00:00"
  }
  ```

**GET /api/kegiatan/{id}**
- Mendapatkan detail kegiatan
- Response: Object kegiatan dengan relasi kategori dan daftar hadir

**PUT /api/kegiatan/{id}**
- Update kegiatan
- Body: sama dengan POST

**DELETE /api/kegiatan/{id}**
- Hapus kegiatan

**GET /api/kegiatan-by-kategori/{kategori_id}**
- Mendapatkan kegiatan berdasarkan kategori

#### 3. Daftar Hadir

**GET /api/daftar-hadir**
- Mendapatkan semua data kehadiran
- Response: Array daftar hadir dengan relasi user dan kegiatan

**POST /api/daftar-hadir**
- Mendaftar untuk kegiatan
- Body:
  ```json
  {
    "user_id": 1,
    "kegiatan_id": 1,
    "otp": "123456"
  }
  ```

**GET /api/daftar-hadir/{id}**
- Mendapatkan detail kehadiran

**PUT /api/daftar-hadir/{id}**
- Update status kehadiran
- Body:
  ```json
  {
    "otp": "123456",
    "status_absen": "hadir"
  }
  ```

**DELETE /api/daftar-hadir/{id}**
- Hapus data kehadiran

**POST /api/daftar-hadir/absen**
- Absen dengan OTP
- Body:
  ```json
  {
    "user_id": 1,
    "kegiatan_id": 1,
    "otp": "123456"
  }
  ```

**GET /api/daftar-hadir-by-kegiatan/{kegiatan_id}**
- Mendapatkan daftar hadir berdasarkan kegiatan

**GET /api/daftar-hadir-by-user/{user_id}**
- Mendapatkan daftar hadir berdasarkan user

## Response Format

Semua response menggunakan format JSON dengan struktur:

```json
{
  "success": true,
  "message": "Pesan sukses",
  "data": {
    // Data response
  }
}
```

Untuk error:
```json
{
  "success": false,
  "message": "Pesan error"
}
```

## Testing

Untuk testing API, Anda dapat menggunakan:
- Postman
- Insomnia
- cURL
- Laravel Tinker

### Contoh cURL

```bash
# Get semua kategori
curl -X GET http://localhost:8000/api/kategori-kegiatan

# Create kategori baru
curl -X POST http://localhost:8000/api/kategori-kegiatan \
  -H "Content-Type: application/json" \
  -d '{"nama_kategori": "Workshop", "kategori_logo": "workshop.png"}'
```

## Fitur Utama

1. **Manajemen Kategori Kegiatan** - CRUD untuk kategori kegiatan
2. **Manajemen Kegiatan** - CRUD untuk kegiatan dengan relasi ke kategori
3. **Sistem Pendaftaran** - User dapat mendaftar untuk kegiatan
4. **Sistem Absensi dengan OTP** - Absensi menggunakan OTP yang unik
5. **Laporan Kehadiran** - Melihat daftar hadir berdasarkan kegiatan atau user

## Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
