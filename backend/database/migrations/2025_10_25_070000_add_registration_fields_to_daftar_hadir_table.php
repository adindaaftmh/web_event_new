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
            // Make user_id nullable for non-logged-in users
            $table->foreignId('user_id')->nullable()->change();
        });
        
        // Check and add columns if they don't exist
        if (!Schema::hasColumn('daftar_hadir', 'nama_lengkap')) {
            Schema::table('daftar_hadir', function (Blueprint $table) {
                $table->string('nama_lengkap')->after('kegiatan_id');
            });
        }
        
        if (!Schema::hasColumn('daftar_hadir', 'email')) {
            Schema::table('daftar_hadir', function (Blueprint $table) {
                $table->string('email')->after('nama_lengkap');
            });
        }
        
        if (!Schema::hasColumn('daftar_hadir', 'no_telepon')) {
            Schema::table('daftar_hadir', function (Blueprint $table) {
                $table->string('no_telepon')->after('email');
            });
        }
        
        if (!Schema::hasColumn('daftar_hadir', 'alamat')) {
            Schema::table('daftar_hadir', function (Blueprint $table) {
                $table->text('alamat')->nullable()->after('no_telepon');
            });
        }
        
        if (!Schema::hasColumn('daftar_hadir', 'pendidikan_terakhir')) {
            Schema::table('daftar_hadir', function (Blueprint $table) {
                $table->string('pendidikan_terakhir')->nullable()->after('alamat');
            });
        }
        
        if (!Schema::hasColumn('daftar_hadir', 'tipe_peserta')) {
            Schema::table('daftar_hadir', function (Blueprint $table) {
                $table->enum('tipe_peserta', ['individu', 'tim'])->default('individu')->after('pendidikan_terakhir');
            });
        }
        
        if (!Schema::hasColumn('daftar_hadir', 'nama_tim')) {
            Schema::table('daftar_hadir', function (Blueprint $table) {
                $table->string('nama_tim')->nullable()->after('tipe_peserta');
            });
        }
        
        if (!Schema::hasColumn('daftar_hadir', 'data_tim')) {
            Schema::table('daftar_hadir', function (Blueprint $table) {
                $table->text('data_tim')->nullable()->after('nama_tim');
            });
        }
        
        if (!Schema::hasColumn('daftar_hadir', 'tiket_dipilih')) {
            Schema::table('daftar_hadir', function (Blueprint $table) {
                $table->string('tiket_dipilih')->nullable()->after('data_tim');
            });
        }
        
        if (!Schema::hasColumn('daftar_hadir', 'jumlah_tiket')) {
            Schema::table('daftar_hadir', function (Blueprint $table) {
                $table->integer('jumlah_tiket')->default(1)->after('tiket_dipilih');
            });
        }
        
        if (!Schema::hasColumn('daftar_hadir', 'total_harga')) {
            Schema::table('daftar_hadir', function (Blueprint $table) {
                $table->decimal('total_harga', 10, 2)->default(0)->after('jumlah_tiket');
            });
        }
        
        if (!Schema::hasColumn('daftar_hadir', 'status_verifikasi')) {
            Schema::table('daftar_hadir', function (Blueprint $table) {
                $table->enum('status_verifikasi', ['pending', 'verified', 'rejected'])->default('pending')->after('total_harga');
            });
        }
        
        if (!Schema::hasColumn('daftar_hadir', 'status_kehadiran')) {
            Schema::table('daftar_hadir', function (Blueprint $table) {
                $table->enum('status_kehadiran', ['hadir', 'tidak_hadir'])->default('tidak_hadir')->after('status_verifikasi');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('daftar_hadir', function (Blueprint $table) {
            $table->dropColumn([
                'nama_lengkap',
                'email',
                'no_telepon',
                'alamat',
                'pendidikan_terakhir',
                'tipe_peserta',
                'nama_tim',
                'data_tim',
                'tiket_dipilih',
                'jumlah_tiket',
                'total_harga',
                'status_verifikasi',
                'status_kehadiran'
            ]);
        });
    }
};
