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
        Schema::table('kegiatan', function (Blueprint $table) {
            $table->integer('kapasitas_peserta')->nullable()->after('sertifikat_kegiatan');
            $table->decimal('harga_tiket', 10, 2)->default(0)->after('kapasitas_peserta');
            $table->string('kontak_panitia')->nullable()->after('harga_tiket');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kegiatan', function (Blueprint $table) {
            $table->dropColumn(['kapasitas_peserta', 'harga_tiket', 'kontak_panitia']);
        });
    }
};
