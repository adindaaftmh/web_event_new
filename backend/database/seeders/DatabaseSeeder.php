<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Call KategoriKegiatanSeeder
        $this->call([
            KategoriKegiatanSeeder::class,
        ]);

        // Create sample user
        User::create([
            'email' => 'admin@example.com',
            'no_handphone' => '081234567890',
            'password' => bcrypt('password'),
            'alamat' => 'Jl. Contoh No. 123, Jakarta',
            'pendidikan_terakhir' => 'SMA/SMK',
            'status_akun' => 'aktif',
        ]);
    }
}
