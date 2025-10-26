<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Flyer extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'image_path',
        'description',
        'order',
        'is_active',
        'link_url'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer'
    ];

    /**
     * Get the full URL for the flyer image
     */
    public function getImageUrlAttribute()
    {
        if (!$this->image_path) {
            return null;
        }
        
        // If it's already a full URL, return it
        if (filter_var($this->image_path, FILTER_VALIDATE_URL)) {
            return $this->image_path;
        }
        
        // Otherwise, construct the URL from storage
        return url('storage/' . $this->image_path);
    }
}
