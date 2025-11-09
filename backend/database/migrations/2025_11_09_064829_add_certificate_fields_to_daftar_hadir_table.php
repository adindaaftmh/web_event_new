<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('daftar_hadir', function (Blueprint $table) {
            // Check and add certificate number if it doesn't exist
            if (!Schema::hasColumn('daftar_hadir', 'nomor_sertifikat')) {
                $table->string('nomor_sertifikat', 100)->nullable()->after('status_kehadiran');
            }
            
            // Check and add certificate issue date if it doesn't exist
            if (!Schema::hasColumn('daftar_hadir', 'tanggal_terbit_sertifikat')) {
                $table->timestamp('tanggal_terbit_sertifikat')->nullable()->after('nomor_sertifikat');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('daftar_hadir', function (Blueprint $table) {
            if (Schema::hasColumn('daftar_hadir', 'nomor_sertifikat')) {
                $table->dropColumn('nomor_sertifikat');
            }
            
            if (Schema::hasColumn('daftar_hadir', 'tanggal_terbit_sertifikat')) {
                $table->dropColumn('tanggal_terbit_sertifikat');
            }
        });
    }
};