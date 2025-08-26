<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KategoriKegiatan extends Model
{
    use HasFactory;

    protected $table = 'kategori_kegiatan';

    protected $fillable = [
        'nama_kategori',
        'slug',
        'kategori_logo',
    ];

    /**
     * Get the activities for this category.
     */
    public function kegiatan()
    {
        return $this->hasMany(Kegiatan::class, 'kategori_id');
    }
}
