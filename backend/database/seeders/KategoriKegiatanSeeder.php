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
                'nama_kategori' => 'Olahraga',
                'slug' => 'olahraga',
                'kategori_logo' => 'sports-icon.png',
            ],
            [
                'nama_kategori' => 'Edukasi',
                'slug' => 'edukasi',
                'kategori_logo' => 'education-icon.png',
            ],
            [
                'nama_kategori' => 'Seni Budaya',
                'slug' => 'seni-budaya',
                'kategori_logo' => 'art-culture-icon.png',
            ],
            [
                'nama_kategori' => 'Hiburan',
                'slug' => 'hiburan',
                'kategori_logo' => 'entertainment-icon.png',
            ],
        ];

        // Clear existing categories and create new ones
        \DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        KategoriKegiatan::truncate();
        \DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        
        foreach ($kategoris as $kategori) {
            KategoriKegiatan::create($kategori);
        }
    }
}
