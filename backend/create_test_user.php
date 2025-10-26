<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Cek apakah user sudah ada
$existingUser = User::where('email', 'test@example.com')->first();

if ($existingUser) {
    echo "User sudah ada dengan email: test@example.com\n";
    echo "ID: " . $existingUser->id . "\n";
    echo "Nama: " . $existingUser->nama_lengkap . "\n";
} else {
    // Buat user baru
    $user = User::create([
        'nama_lengkap' => 'Test User',
        'email' => 'test@example.com',
        'no_handphone' => '081234567890',
        'password' => Hash::make('password123'),
        'alamat' => 'Jakarta, Indonesia',
        'pendidikan_terakhir' => 'Diploma/Sarjana',
        'status_akun' => 'aktif'
    ]);
    
    echo "User berhasil dibuat!\n";
    echo "Email: test@example.com\n";
    echo "Password: password123\n";
    echo "ID: " . $user->id . "\n";
}
