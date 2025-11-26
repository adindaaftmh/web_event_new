<?php

namespace App\Http\Controllers;

use App\Models\FooterSetting;
use Illuminate\Http\Request;

class FooterController extends Controller
{
    public function show()
    {
        $footer = FooterSetting::first();

        if (!$footer) {
            $footer = FooterSetting::create([
                'brand_title' => 'DYNOTIX',
                'brand_subtitle' => 'EVENT PLATFORM',
                'brand_description' => 'Platform terpercaya untuk menemukan dan mendaftar berbagai event menarik. Bergabunglah dengan komunitas kami dan jangan lewatkan pengalaman tak terlupakan.',
                'contact_title' => 'Kontak',
                'contact_address' => 'Jl. Raya Tajur, Kp. Buntar RT.02/RW.08, Kel. Muara sari, Kec. Bogor Selatan, Kota Bogor, Jawa Barat 16137',
                'contact_email' => 'dynotix@gmail.com',
                'contact_phone' => '+62 831-6922-1045',
                'social_title' => 'Ikuti Kami',
                'social_description' => 'Tetap terhubung untuk update event terbaru',
                'facebook_url' => '#',
                'instagram_url' => '#',
                'twitter_url' => '#',
                'linkedin_url' => '#',
                'copyright_text' => '© 2025 DYNOTIX Event Platform. All rights reserved.',
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $footer,
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'brand_title' => 'required|string|max:255',
            'brand_subtitle' => 'nullable|string|max:255',
            'brand_description' => 'required|string',
            'contact_title' => 'required|string|max:255',
            'contact_address' => 'required|string',
            'contact_email' => 'required|string|max:255',
            'contact_phone' => 'required|string|max:255',
            'social_title' => 'required|string|max:255',
            'social_description' => 'required|string',
            'facebook_url' => 'nullable|string|max:500',
            'instagram_url' => 'nullable|string|max:500',
            'twitter_url' => 'nullable|string|max:500',
            'linkedin_url' => 'nullable|string|max:500',
            'copyright_text' => 'required|string|max:255',
        ]);

        $footer = FooterSetting::first();
        if (!$footer) {
            $footer = new FooterSetting();
        }

        $footer->fill($data);
        $footer->save();

        return response()->json([
            'success' => true,
            'message' => 'Footer berhasil diperbarui',
            'data' => $footer,
        ]);
    }
}
