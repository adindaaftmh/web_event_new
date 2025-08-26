<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\KategoriKegiatan;

class KategoriKegiatanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $kategoris = [
            [
                'nama_kategori' => 'Seminar',
                'slug' => 'seminar',
                'kategori_logo' => 'seminar-icon.png',
            ],
            [
                'nama_kategori' => 'Workshop',
                'slug' => 'workshop',
                'kategori_logo' => 'workshop-icon.png',
            ],
            [
                'nama_kategori' => 'Pelatihan',
                'slug' => 'pelatihan',
                'kategori_logo' => 'pelatihan-icon.png',
            ],
            [
                'nama_kategori' => 'Webinar',
                'slug' => 'webinar',
                'kategori_logo' => 'webinar-icon.png',
            ],
            [
                'nama_kategori' => 'Konsultasi',
                'slug' => 'konsultasi',
                'kategori_logo' => 'konsultasi-icon.png',
            ],
        ];

        foreach ($kategoris as $kategori) {
            KategoriKegiatan::create($kategori);
        }
    }
}
