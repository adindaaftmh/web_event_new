<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FooterSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'brand_title',
        'brand_subtitle',
        'brand_description',
        'contact_title',
        'contact_address',
        'contact_email',
        'contact_phone',
        'social_title',
        'social_description',
        'facebook_url',
        'instagram_url',
        'twitter_url',
        'linkedin_url',
        'copyright_text',
    ];
}
