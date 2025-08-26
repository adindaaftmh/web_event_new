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
        Schema::create('kegiatan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kategori_id')->constrained('kategori_kegiatan')->onDelete('cascade');
            $table->string('judul_kegiatan');
            $table->string('slug')->unique();
            $table->text('deskripsi_kegiatan');
            $table->string('lokasi_kegiatan');
            $table->string('flyer_kegiatan')->nullable();
            $table->string('sertifikat_kegiatan')->nullable();
            $table->datetime('waktu_mulai');
            $table->datetime('waktu_berakhir');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kegiatan');
    }
};
