# Sistem Manajemen Kegiatan - React + Tailwind + Laravel

Proyek ini adalah sistem manajemen kegiatan yang menggunakan React dengan Tailwind CSS untuk frontend dan Laravel untuk backend.

## 🚀 Teknologi yang Digunakan

### Frontend
- **React 19.1.1** - Library JavaScript untuk UI
- **Tailwind CSS 3.x** - Framework CSS utility-first
- **Vite** - Build tool dan development server
- **Axios** - HTTP client untuk API calls

### Backend
- **Laravel** - PHP framework
- **SQLite** - Database
- **Laravel Sanctum** - Authentication

## 📁 Struktur Proyek

```
ujikom_dinda/
├── frontend/                 # React application
│   ├── src/
│   │   ├── config/
│   │   │   └── api.js       # API configuration
│   │   ├── services/
│   │   │   └── apiService.js # API services
│   │   ├── App.jsx          # Main component
│   │   └── index.css        # Tailwind CSS imports
│   ├── tailwind.config.js   # Tailwind configuration
│   ├── postcss.config.js    # PostCSS configuration
│   └── package.json
└── backend/                  # Laravel application
    ├── app/
    │   ├── Http/Controllers/
    │   └── Models/
    ├── routes/
    │   └── api.php          # API routes
    └── config/
        └── cors.php         # CORS configuration
```

## 🛠️ Instalasi dan Setup

### Prerequisites
- Node.js (versi 18 atau lebih baru)
- PHP 8.1 atau lebih baru
- Composer
- XAMPP/WAMP/LAMP

### 1. Setup Backend Laravel

```bash
cd backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate

# Seed database (jika ada)
php artisan db:seed

# Start Laravel development server
php artisan serve
```

Backend akan berjalan di `http://localhost:8000`

### 2. Setup Frontend React

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

## 🔧 Konfigurasi

### CORS Configuration
File `backend/config/cors.php` sudah dikonfigurasi untuk mengizinkan request dari frontend React.

### API Configuration
File `frontend/src/config/api.js` berisi konfigurasi untuk koneksi ke backend Laravel.

## 📡 API Endpoints

### Kategori Kegiatan
- `GET /api/kategori-kegiatan` - Mendapatkan semua kategori
- `GET /api/kategori-kegiatan/{id}` - Mendapatkan kategori by ID
- `POST /api/kategori-kegiatan` - Membuat kategori baru
- `PUT /api/kategori-kegiatan/{id}` - Update kategori
- `DELETE /api/kategori-kegiatan/{id}` - Hapus kategori

### Kegiatan
- `GET /api/kegiatan` - Mendapatkan semua kegiatan
- `GET /api/kegiatan/{id}` - Mendapatkan kegiatan by ID
- `GET /api/kegiatan-by-kategori/{kategori_id}` - Kegiatan by kategori
- `POST /api/kegiatan` - Membuat kegiatan baru
- `PUT /api/kegiatan/{id}` - Update kegiatan
- `DELETE /api/kegiatan/{id}` - Hapus kegiatan

### Daftar Hadir
- `GET /api/daftar-hadir` - Mendapatkan semua daftar hadir
- `GET /api/daftar-hadir/{id}` - Mendapatkan daftar hadir by ID
- `GET /api/daftar-hadir-by-kegiatan/{kegiatan_id}` - Daftar hadir by kegiatan
- `GET /api/daftar-hadir-by-user/{user_id}` - Daftar hadir by user
- `POST /api/daftar-hadir` - Membuat daftar hadir baru
- `PUT /api/daftar-hadir/{id}` - Update daftar hadir
- `DELETE /api/daftar-hadir/{id}` - Hapus daftar hadir
- `POST /api/daftar-hadir/absen` - Absen

## 🎨 Fitur Frontend

- **Responsive Design** - Menggunakan Tailwind CSS untuk tampilan yang responsif
- **Loading States** - Indikator loading saat memuat data
- **Error Handling** - Penanganan error yang user-friendly
- **Real-time Data** - Data langsung dari backend Laravel
- **Modern UI** - Interface yang modern dan clean

## 🔒 Authentication

Sistem menggunakan Laravel Sanctum untuk authentication. Token disimpan di localStorage dan otomatis ditambahkan ke setiap request API.

## 🚀 Deployment

### Frontend
```bash
cd frontend
npm run build
```

### Backend
Pastikan environment production sudah dikonfigurasi dengan benar di file `.env`.

## 📝 Catatan

- Pastikan backend Laravel berjalan sebelum menjalankan frontend
- Jika ada masalah CORS, periksa konfigurasi di `backend/config/cors.php`
- Untuk development, gunakan `npm run dev` di frontend dan `php artisan serve` di backend

## 🤝 Kontribusi

1. Fork proyek
2. Buat branch fitur baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

Proyek ini dibuat untuk Uji Kompetensi.
