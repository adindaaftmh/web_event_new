<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if admin already exists
        $existingAdmin = User::where('email', 'admin@example.com')->first();
        
        if ($existingAdmin) {
            echo "Admin user already exists!\n";
            echo "Email: admin@example.com\n";
            echo "Role: {$existingAdmin->role}\n";
            
            // Update role to admin if not already
            if ($existingAdmin->role !== 'admin') {
                $existingAdmin->role = 'admin';
                $existingAdmin->save();
                echo "✓ Role updated to admin\n";
            }
            
            return;
        }

        // Create new admin user
        $admin = User::create([
            'nama_lengkap' => 'Administrator',
            'email' => 'admin@example.com',
            'no_handphone' => '081234567890',
            'password' => Hash::make('admin123'),
            'alamat' => 'Alamat Admin',
            'pendidikan_terakhir' => 'Diploma/Sarjana',
            'status_akun' => 'aktif',
            'role' => 'admin',
        ]);

        echo "✓ Admin user created successfully!\n";
        echo "========================================\n";
        echo "Email: admin@example.com\n";
        echo "Password: admin123\n";
        echo "Role: admin\n";
        echo "Status: aktif\n";
        echo "========================================\n";
        echo "Login at: http://localhost:5173/admin/login\n";
    }
}
