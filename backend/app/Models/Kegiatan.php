<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kegiatan extends Model
{
    use HasFactory;

    protected $table = 'kegiatan';

    protected $fillable = [
        'kategori_id',
        'judul_kegiatan',
        'slug',
        'deskripsi_kegiatan',
        'lokasi_kegiatan',
        'flyer_kegiatan',
        'sertifikat_kegiatan',
        'waktu_mulai',
        'waktu_berakhir',
        'kapasitas_peserta',
        'harga_tiket',
        'kontak_panitia',
    ];

    protected $casts = [
        'waktu_mulai' => 'datetime',
        'waktu_berakhir' => 'datetime',
        'harga_tiket' => 'decimal:2',
    ];

    /**
     * Get the category that owns the activity.
     */
    public function kategori()
    {
        return $this->belongsTo(KategoriKegiatan::class, 'kategori_id');
    }

    /**
     * Get the attendance records for this activity.
     */
    public function daftarHadir()
    {
        return $this->hasMany(DaftarHadir::class, 'kegiatan_id');
    }
}
