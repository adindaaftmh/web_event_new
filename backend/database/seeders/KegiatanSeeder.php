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
            [
                'kategori_id' => $olahragaKategori->id,
                'judul_kegiatan' => 'Maraton Jakarta 2025',
                'slug' => 'maraton-jakarta-2025',
                'deskripsi_kegiatan' => 'Maraton tahunan Jakarta dengan rute sepanjang 42km melewati landmark ikonik Jakarta.',
                'lokasi_kegiatan' => 'Bundaran HI, Jakarta',
                'flyer_kegiatan' => 'flyer-maraton.jpg',
                'sertifikat_kegiatan' => 'sertifikat-maraton.pdf',
                'waktu_mulai' => Carbon::create(2025, 1, 15, 5, 0, 0),
                'waktu_berakhir' => Carbon::create(2025, 1, 15, 12, 0, 0),
                'kapasitas_peserta' => 100,
                'harga_tiket' => 150000,
                'kontak_panitia' => '081234567890',
                'penyelenggara' => 'Jakarta Runners Club'
            ],
            [
                'kategori_id' => $edukasiKategori->id,
                'judul_kegiatan' => 'Workshop Digital Marketing',
                'slug' => 'workshop-digital-marketing',
                'deskripsi_kegiatan' => 'Workshop intensif tentang strategi digital marketing untuk pemula dan menengah.',
                'lokasi_kegiatan' => 'Hotel Grand Indonesia, Jakarta',
                'flyer_kegiatan' => 'flyer-workshop.jpg',
                'sertifikat_kegiatan' => 'sertifikat-workshop.pdf',
                'waktu_mulai' => Carbon::create(2025, 2, 10, 9, 0, 0),
                'waktu_berakhir' => Carbon::create(2025, 2, 10, 17, 0, 0),
                'kapasitas_peserta' => 50,
                'harga_tiket' => 200000,
                'kontak_panitia' => '081234567891',
                'penyelenggara' => 'Digital Academy Indonesia'
            ],
            [
                'kategori_id' => $seniBudayaKategori->id,
                'judul_kegiatan' => 'Festival Musik Jazz',
                'slug' => 'festival-musik-jazz',
                'deskripsi_kegiatan' => 'Festival musik jazz dengan berbagai musisi ternama.',
                'lokasi_kegiatan' => 'Taman Ismail Marzuki, Jakarta',
                'flyer_kegiatan' => 'flyer-jazz.jpg',
                'sertifikat_kegiatan' => 'sertifikat-jazz.pdf',
                'waktu_mulai' => Carbon::create(2025, 3, 20, 18, 0, 0),
                'waktu_berakhir' => Carbon::create(2025, 3, 20, 23, 0, 0),
                'kapasitas_peserta' => 200,
                'harga_tiket' => 250000,
                'kontak_panitia' => '081234567892',
                'penyelenggara' => 'Indonesia Jazz Society'
            ],
            [
                'kategori_id' => $edukasiKategori->id,
                'judul_kegiatan' => 'Seminar Startup',
                'slug' => 'seminar-startup',
                'deskripsi_kegiatan' => 'Seminar tentang membangun startup dengan pembicara berpengalaman.',
                'lokasi_kegiatan' => 'Universitas Indonesia, Depok',
                'flyer_kegiatan' => 'flyer-seminar.jpg',
                'sertifikat_kegiatan' => 'sertifikat-seminar.pdf',
                'waktu_mulai' => Carbon::create(2025, 4, 12, 9, 0, 0),
                'waktu_berakhir' => Carbon::create(2025, 4, 12, 16, 0, 0),
                'kapasitas_peserta' => 150,
                'harga_tiket' => 100000,
                'kontak_panitia' => '081234567893',
                'penyelenggara' => 'Startup Indonesia'
            ],
            [
                'kategori_id' => $olahragaKategori->id,
                'judul_kegiatan' => 'Turnamen Futsal',
                'slug' => 'turnamen-futsal',
                'deskripsi_kegiatan' => 'Turnamen futsal antar kampus se-Jabodetabek.',
                'lokasi_kegiatan' => 'GOR UI, Depok',
                'flyer_kegiatan' => 'flyer-futsal.jpg',
                'sertifikat_kegiatan' => 'sertifikat-futsal.pdf',
                'waktu_mulai' => Carbon::create(2025, 11, 10, 8, 0, 0),
                'waktu_berakhir' => Carbon::create(2025, 11, 12, 18, 0, 0),
                'kapasitas_peserta' => 16,
                'harga_tiket' => 500000,
                'kontak_panitia' => '081234567894',
                'penyelenggara' => 'BEM UI'
            ],
            [
                'kategori_id' => $hiburanKategori->id,
                'judul_kegiatan' => 'Stand Up Comedy Show',
                'slug' => 'stand-up-comedy-show',
                'deskripsi_kegiatan' => 'Pertunjukan stand up comedy dengan komika terkenal.',
                'lokasi_kegiatan' => 'Balai Sarbini, Jakarta',
                'flyer_kegiatan' => 'flyer-comedy.jpg',
                'sertifikat_kegiatan' => null,
                'waktu_mulai' => Carbon::create(2025, 12, 15, 19, 0, 0),
                'waktu_berakhir' => Carbon::create(2025, 12, 15, 22, 0, 0),
                'kapasitas_peserta' => 300,
                'harga_tiket' => 150000,
                'kontak_panitia' => '081234567895',
                'penyelenggara' => 'Comedy Indonesia'
            ],
            [
                'kategori_id' => $seniBudayaKategori->id,
                'judul_kegiatan' => 'Pameran Seni Rupa',
                'slug' => 'pameran-seni-rupa',
                'deskripsi_kegiatan' => 'Pameran karya seni rupa seniman muda Indonesia.',
                'lokasi_kegiatan' => 'Galeri Nasional, Jakarta',
                'flyer_kegiatan' => 'flyer-seni.jpg',
                'sertifikat_kegiatan' => null,
                'waktu_mulai' => Carbon::create(2025, 10, 1, 10, 0, 0),
                'waktu_berakhir' => Carbon::create(2025, 10, 7, 18, 0, 0),
                'kapasitas_peserta' => 100,
                'harga_tiket' => 50000,
                'kontak_panitia' => '081234567896',
                'penyelenggara' => 'Galeri Nasional Indonesia'
            ],
            [
                'kategori_id' => $edukasiKategori->id,
                'judul_kegiatan' => 'Pelatihan Public Speaking',
                'slug' => 'pelatihan-public-speaking',
                'deskripsi_kegiatan' => 'Pelatihan public speaking untuk mahasiswa dan profesional.',
                'lokasi_kegiatan' => 'Gedung Cendana, Jakarta',
                'flyer_kegiatan' => 'flyer-speaking.jpg',
                'sertifikat_kegiatan' => 'sertifikat-speaking.pdf',
                'waktu_mulai' => Carbon::create(2025, 9, 8, 9, 0, 0),
                'waktu_berakhir' => Carbon::create(2025, 9, 8, 17, 0, 0),
                'kapasitas_peserta' => 80,
                'harga_tiket' => 300000,
                'kontak_panitia' => '081234567897',
                'penyelenggara' => 'Speaker Academy'
            ],
            [
                'kategori_id' => $olahragaKategori->id,
                'judul_kegiatan' => 'Fun Run Charity',
                'slug' => 'fun-run-charity',
                'deskripsi_kegiatan' => 'Lari santai untuk penggalangan dana amal.',
                'lokasi_kegiatan' => 'Monas, Jakarta',
                'flyer_kegiatan' => 'flyer-funrun.jpg',
                'sertifikat_kegiatan' => 'sertifikat-funrun.pdf',
                'waktu_mulai' => Carbon::create(2024, 12, 1, 6, 0, 0),
                'waktu_berakhir' => Carbon::create(2024, 12, 1, 10, 0, 0),
                'kapasitas_peserta' => 500,
                'harga_tiket' => 100000,
                'kontak_panitia' => '081234567898',
                'penyelenggara' => 'Yayasan Peduli Anak'
            ]
        ];

        foreach ($kegiatan as $data) {
            Kegiatan::create($data);
        }
    }
}
