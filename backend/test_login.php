<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

echo "===========================================\n";
echo "Test Admin Login Credentials\n";
echo "===========================================\n\n";

$email = 'admin@example.com';
$password = 'admin123';

echo "Testing credentials:\n";
echo "Email: $email\n";
echo "Password: $password\n\n";

$user = User::where('email', $email)->first();

if (!$user) {
    echo "❌ User tidak ditemukan!\n";
    echo "Membuat user admin baru...\n\n";
    
    $user = User::create([
        'nama_lengkap' => 'Administrator',
        'email' => $email,
        'no_handphone' => '081234567890',
        'password' => Hash::make($password),
        'alamat' => 'Alamat Admin',
        'pendidikan_terakhir' => 'Diploma/Sarjana',
        'status_akun' => 'aktif',
        'role' => 'admin',
    ]);
    
    echo "✓ User admin berhasil dibuat!\n\n";
}

echo "User ditemukan:\n";
echo "-------------------------------------------\n";
echo "ID: " . $user->id . "\n";
echo "Nama: " . $user->nama_lengkap . "\n";
echo "Email: " . $user->email . "\n";
echo "Role: " . ($user->role ?? 'TIDAK ADA') . "\n";
echo "Status: " . $user->status_akun . "\n";
echo "-------------------------------------------\n\n";

// Test password
echo "Testing password...\n";
if (Hash::check($password, $user->password)) {
    echo "✓ Password COCOK!\n";
    echo "✓ Login AKAN BERHASIL\n\n";
} else {
    echo "❌ Password TIDAK COCOK!\n";
    echo "❌ Login AKAN GAGAL\n\n";
    
    echo "Updating password ke: $password\n";
    $user->password = Hash::make($password);
    $user->save();
    echo "✓ Password berhasil diupdate!\n\n";
}

// Pastikan role admin
if (!$user->role || $user->role !== 'admin') {
    echo "⚠️ Role bukan admin! Updating...\n";
    $user->role = 'admin';
    $user->save();
    echo "✓ Role diupdate ke: admin\n\n";
}

// Pastikan status aktif
if ($user->status_akun !== 'aktif') {
    echo "⚠️ Status bukan aktif! Updating...\n";
    $user->status_akun = 'aktif';
    $user->save();
    echo "✓ Status diupdate ke: aktif\n\n";
}

echo "===========================================\n";
echo "FINAL RESULT - Ready untuk login:\n";
echo "===========================================\n";
echo "URL: http://localhost:5173/admin/login\n";
echo "Email: $email\n";
echo "Password: $password\n";
echo "Role: " . $user->role . "\n";
echo "Status: " . $user->status_akun . "\n";
echo "===========================================\n\n";

echo "✅ Semua sudah OK! Silakan login!\n";
