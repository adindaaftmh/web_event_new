<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Flyer;

class FlyerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $flyers = [
            [
                'title' => 'Music Festival 2024',
                'image_path' => 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
                'description' => 'Festival musik terbesar tahun ini dengan berbagai artis ternama',
                'order' => 1,
                'is_active' => true,
                'link_url' => null
            ],
            [
                'title' => 'Tech Conference Summit',
                'image_path' => 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200',
                'description' => 'Konferensi teknologi untuk developer dan startup',
                'order' => 2,
                'is_active' => true,
                'link_url' => null
            ],
            [
                'title' => 'Art Exhibition Showcase',
                'image_path' => 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200',
                'description' => 'Pameran seni dari seniman lokal dan internasional',
                'order' => 3,
                'is_active' => true,
                'link_url' => null
            ]
        ];

        foreach ($flyers as $flyerData) {
            Flyer::create($flyerData);
        }
    }
}
