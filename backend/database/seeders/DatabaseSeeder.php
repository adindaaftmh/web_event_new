<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * 
     * Seed the application's database.
     */
    public function run(): void
    {
        // Call seeders - Hanya struktur dasar tanpa data dummy
        $this->call([
            AdminSeeder::class, // Seeder untuk akun admin
            KategoriKegiatanSeeder::class, // Kategori: Olahraga, Edukasi, Seni Budaya, Hiburan
            // KegiatanSeeder::class, // Dinonaktifkan - data event akan diisi manual via admin panel
            // DashboardGraphSeeder::class, // Dinonaktifkan - data dummy participants
        ]);
    }
}
