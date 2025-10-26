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
            $table->enum('tipe_peserta', ['individu', 'tim'])->default('individu')->after('kontak_panitia');
            $table->text('tickets')->nullable()->after('tipe_peserta');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kegiatan', function (Blueprint $table) {
            $table->dropColumn(['tipe_peserta', 'tickets']);
        });
    }
};
