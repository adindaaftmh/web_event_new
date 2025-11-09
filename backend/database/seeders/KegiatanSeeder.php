<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Kegiatan;
use App\Models\KategoriKegiatan;
use Carbon\Carbon;

class KegiatanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all categories
        $olahragaKategori = KategoriKegiatan::where('slug', 'olahraga')->first();
        $edukasiKategori = KategoriKegiatan::where('slug', 'edukasi')->first();
        $seniBudayaKategori = KategoriKegiatan::where('slug', 'seni-budaya')->first();
        $hiburanKategori = KategoriKegiatan::where('slug', 'hiburan')->first();

        $kegiatan = [
            // Olahraga
            [
                'kategori_id' => $olahragaKategori->id,
                'judul_kegiatan' => 'Turnamen Futsal Antar Kampus 2025',
                'slug' => 'turnamen-futsal-antar-kampus-2025',
                'deskripsi_kegiatan' => 'Turnamen futsal tahunan yang mempertemukan tim-tim terbaik dari berbagai kampus di Indonesia. Kompetisi ini menampilkan pertandingan seru dengan aturan resmi FIFA. Pendaftaran dibuka untuk tim putra dengan minimal 10 pemain per tim.',
                'lokasi_kegiatan' => 'Gor Universitas Indonesia, Depok',
                'flyer_kegiatan' => 'https://images.unsplash.com/photo-1600679472829-3044539ce8ed?w=1200',
                'sertifikat_kegiatan' => 'sertifikat-futsal.pdf',
                'waktu_mulai' => Carbon::create(2025, 11, 10, 8, 0, 0),
                'waktu_berakhir' => Carbon::create(2025, 11, 15, 22, 0, 0),
                'kapasitas_peserta' => 20,
                'harga_tiket' => 500000,
                'kontak_panitia' => '081234567890 (Andi)',
                'penyelenggara' => 'Badan Olahraga Mahasiswa Indonesia'
            ],
            
            // Edukasi
            [
                'kategori_id' => $edukasiKategori->id,
                'judul_kegiatan' => 'Seminar Nasional Pendidikan Karakter',
                'slug' => 'seminar-nasional-pendidikan-karakter',
                'deskripsi_kegiatan' => 'Seminar nasional yang membahas pentingnya pendidikan karakter dalam membangun generasi emas Indonesia. Menghadirkan pembicara ahli di bidang pendidikan dan psikologi perkembangan anak.',
                'lokasi_kegiatan' => 'Auditorium Kementerian Pendidikan, Jakarta',
                'flyer_kegiatan' => 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200',
                'sertifikat_kegiatan' => 'sertifikat-pendidikan-karakter.pdf',
                'waktu_mulai' => Carbon::create(2025, 11, 20, 9, 0, 0),
                'waktu_berakhir' => Carbon::create(2025, 11, 20, 16, 0, 0),
                'kapasitas_peserta' => 500,
                'harga_tiket' => 150000,
                'kontak_panitia' => '081234567891 (Budi)',
                'penyelenggara' => 'Kementerian Pendidikan dan Kebudayaan'
            ],
            
            // Seni Budaya
            [
                'kategori_id' => $seniBudayaKategori->id,
                'judul_kegiatan' => 'Pameran Seni Rupa Kontemporer',
                'slug' => 'pameran-seni-rupa-kontemporer',
                'deskripsi_kegiatan' => 'Pameran seni rupa kontemporer menampilkan karya-karya terbaru dari seniman muda berbakat Indonesia. Acara ini juga akan diisi dengan workshop dan diskusi bersama para seniman.',
                'lokasi_kegiatan' => 'Galeri Nasional Indonesia, Jakarta Pusat',
                'flyer_kegiatan' => 'https://images.unsplash.com/photo-1531913764164-f85c52d6e654?w=1200',
                'sertifikat_kegiatan' => 'sertifikat-pameran-seni.pdf',
                'waktu_mulai' => Carbon::create(2025, 12, 1, 10, 0, 0),
                'waktu_berakhir' => Carbon::create(2025, 12, 10, 21, 0, 0),
                'kapasitas_peserta' => 200,
                'harga_tiket' => 75000,
                'kontak_panitia' => '081234567892 (Citra)',
                'penyelenggara' => 'Asosiasi Seniman Muda Nusantara'
            ],
            
            // Hiburan
            [
                'kategori_id' => $hiburanKategori->id,
                'judul_kegiatan' => 'Konser Amal untuk Pendidikan',
                'slug' => 'konser-amal-untuk-pendidikan',
                'deskripsi_kegiatan' => 'Konser amal yang menampilkan artis-artis ternama Indonesia. Seluruh hasil penjualan tiket akan disumbangkan untuk pembangunan sekolah di daerah terpencil.',
                'lokasi_kegiatan' => 'Istora Senayan, Jakarta',
                'flyer_kegiatan' => 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200',
                'sertifikat_kegiatan' => 'sertifikat-konser.pdf',
                'waktu_mulai' => Carbon::create(2025, 12, 24, 19, 0, 0),
                'waktu_berakhir' => Carbon::create(2025, 12, 24, 23, 30, 0),
                'kapasitas_peserta' => 1000,
                'harga_tiket' => 250000,
                'kontak_panitia' => '081234567893 (Dewi)',
                'penyelenggara' => 'Yayasan Pendidikan Anak Bangsa'
            ]
        ];

        foreach ($kegiatan as $data) {
            Kegiatan::create($data);
        }
    }
}
