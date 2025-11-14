<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN status_akun ENUM('aktif', 'nonaktif', 'pending') DEFAULT 'aktif'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN status_akun ENUM('aktif', 'belum-aktif') DEFAULT 'belum-aktif'");
    }
};