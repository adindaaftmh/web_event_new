<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class ImageUploadController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:png,jpg,jpeg,webp|max:5000',
        ]);

        $uploaded = Cloudinary::upload(
            $request->file('image')->getRealPath(),
            ['folder' => 'event_flyer']
        );

        return response()->json([
            'url' => $uploaded->getSecurePath(),
            'public_id' => $uploaded->getPublicId()
        ]);
    }
}
