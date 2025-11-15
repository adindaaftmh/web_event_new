<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use App\Models\Event; // pastikan ada model Event

class ImageUploadController extends Controller
{
    // Upload flyer ke Cloudinary
    public function upload(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:png,jpg,jpeg,webp|max:5120',
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

    // Simpan event ke database beserta URL flyer
    public function storeEvent(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'date' => 'required|date',
            'flyer_url' => 'required|url',
        ]);

        $event = Event::create([
            'name' => $request->name,
            'date' => $request->date,
            'flyer_url' => $request->flyer_url,
        ]);

        return response()->json([
            'success' => true,
            'event' => $event
        ]);
    }
}
