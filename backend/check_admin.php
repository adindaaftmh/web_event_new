<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;

echo "===========================================\n";
echo "Checking Admin User in Database\n";
echo "===========================================\n\n";

$admin = User::where('email', 'admin@example.com')->first();

if ($admin) {
    echo "✓ User ditemukan!\n";
    echo "-------------------------------------------\n";
    echo "ID: " . $admin->id . "\n";
    echo "Nama: " . $admin->nama_lengkap . "\n";
    echo "Email: " . $admin->email . "\n";
    echo "Role: " . ($admin->role ?? 'TIDAK ADA ROLE') . "\n";
    echo "Status: " . $admin->status_akun . "\n";
    echo "No HP: " . $admin->no_handphone . "\n";
    echo "-------------------------------------------\n\n";
    
    echo "Password hash: " . substr($admin->password, 0, 30) . "...\n\n";
    
    echo "Untuk login gunakan:\n";
    echo "Email: admin@example.com\n";
    echo "Password: admin123\n\n";
    
    if (!$admin->role || $admin->role !== 'admin') {
        echo "⚠️ WARNING: Role bukan 'admin'!\n";
        echo "Updating role to admin...\n";
        $admin->role = 'admin';
        $admin->save();
        echo "✓ Role updated to admin\n";
    }
    
} else {
    echo "✗ User admin@example.com TIDAK DITEMUKAN!\n\n";
    echo "Membuat user admin baru...\n";
    
    $newAdmin = User::create([
        'nama_lengkap' => 'Administrator',
        'email' => 'admin@example.com',
        'no_handphone' => '081234567890',
        'password' => bcrypt('admin123'),
        'alamat' => 'Alamat Admin',
        'pendidikan_terakhir' => 'Diploma/Sarjana',
        'status_akun' => 'aktif',
        'role' => 'admin',
    ]);
    
    echo "✓ Admin user created!\n";
    echo "Email: admin@example.com\n";
    echo "Password: admin123\n";
}

echo "\n===========================================\n";
echo "Semua user dengan role admin:\n";
echo "===========================================\n";

$admins = User::where('role', 'admin')->get();
foreach ($admins as $adm) {
    echo "- {$adm->nama_lengkap} ({$adm->email})\n";
}

echo "\n";
