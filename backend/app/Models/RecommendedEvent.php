<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class RecommendedEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'category',
        'tags',
        'date',
        'time',
        'location',
        'gradient',
        'icon',
        'button_text',
        'button_gradient',
        'school_text',
        'flyer_image_path',
        'active',
        'order'
    ];

    protected $casts = [
        'tags' => 'array',
        'active' => 'boolean',
    ];

    /**
     * Get the full URL for the flyer image
     */
    public function getFlyerImageUrlAttribute()
    {
        if (!$this->flyer_image_path) {
            return null;
        }

        // If it's already a full URL, return it
        if (filter_var($this->flyer_image_path, FILTER_VALIDATE_URL)) {
            return $this->flyer_image_path;
        }

        // Otherwise, generate the storage URL with full domain
        return url(Storage::url($this->flyer_image_path));
    }
}
