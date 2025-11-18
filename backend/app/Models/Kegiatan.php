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
        'penyelenggara',
        'tipe_peserta',
        'tickets',
    ];

    protected $casts = [
        'waktu_mulai' => 'datetime',
        'waktu_berakhir' => 'datetime',
        'harga_tiket' => 'decimal:2',
    ];

    protected $appends = ['flyer_url', 'sertifikat_url'];

    /**
     * Get the full URL for the flyer image.
     */
     public function getFlyerUrlAttribute()
    {
        if (!$this->flyer_kegiatan) {
            return null;
        }
        
        // Cek apakah ini sudah full URL (bisa Cloudinary atau URL lain)
        if (filter_var($this->flyer_kegiatan, FILTER_VALIDATE_URL)) {
            return $this->flyer_kegiatan; // Return URL langsung (Cloudinary atau URL lain)
        }
        
        // Jika bukan URL, berarti path lokal storage
        // Pastikan path tidak dimulai dengan /storage/ (untuk menghindari duplikasi)
        $cleanPath = ltrim($this->flyer_kegiatan, '/');
        if (str_starts_with($cleanPath, 'storage/')) {
            return url($cleanPath);
        }
        
        return url('storage/' . $cleanPath);
    }

    /**
     * Get the full URL for the certificate template.
     */
    public function getSertifikatUrlAttribute()
    {
        if ($this->sertifikat_kegiatan) {
            return url('storage/' . $this->sertifikat_kegiatan);
        }
        return null;
    }

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
