<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DaftarHadir extends Model
{
    use HasFactory;

    protected $table = 'daftar_hadir';

    protected $fillable = [
        'user_id',
        'kegiatan_id',
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
        'otp',
        'status_kehadiran',
        'waktu_absen',
        'nomor_sertifikat',
        'tanggal_terbit_sertifikat',
    ];

    protected $casts = [
        'waktu_absen' => 'datetime',
        'total_harga' => 'decimal:2',
        'tanggal_terbit_sertifikat' => 'datetime',
    ];

    /**
     * Get the user that owns the attendance record.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the activity that owns the attendance record.
     */
    public function kegiatan()
    {
        return $this->belongsTo(Kegiatan::class, 'kegiatan_id');
    }
}
