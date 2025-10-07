<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Kegiatan;
use App\Models\KategoriKegiatan;
use Carbon\Carbon;

class KegiatanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get categories
        $workshopKategori = KategoriKegiatan::where('slug', 'workshop')->first();
        $seminarKategori = KategoriKegiatan::where('slug', 'seminar')->first();
        $webinarKategori = KategoriKegiatan::where('slug', 'webinar')->first();
        $pelatihanKategori = KategoriKegiatan::where('slug', 'pelatihan')->first();

        $kegiatan = [
            [
                'kategori_id' => $workshopKategori->id,
                'judul_kegiatan' => 'Workshop Digital Marketing 2025',
                'slug' => 'workshop-digital-marketing-2025',
                'deskripsi_kegiatan' => 'Workshop Digital Marketing 2025 adalah program pelatihan intensif yang dirancang khusus untuk meningkatkan kemampuan digital marketing Anda. Dalam workshop ini, Anda akan belajar strategi pemasaran digital terkini, teknik SEO, social media marketing, content marketing, dan analytics yang akan membantu bisnis Anda berkembang di era digital.',
                'lokasi_kegiatan' => 'Grand Ballroom Hotel Santika, Jakarta Selatan',
                'flyer_kegiatan' => 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
                'sertifikat_kegiatan' => 'sertifikat-digital-marketing.pdf',
                'waktu_mulai' => Carbon::create(2025, 7, 15, 9, 0, 0),
                'waktu_berakhir' => Carbon::create(2025, 7, 15, 17, 0, 0),
            ],
            [
                'kategori_id' => $seminarKategori->id,
                'judul_kegiatan' => 'Seminar Kewirausahaan Digital',
                'slug' => 'seminar-kewirausahaan-digital',
                'deskripsi_kegiatan' => 'Seminar yang membahas tentang peluang bisnis di era digital, strategi memulai bisnis online, dan tips sukses menjadi entrepreneur digital. Cocok untuk pemula yang ingin memulai bisnis online.',
                'lokasi_kegiatan' => 'Convention Center Jakarta, Jakarta Pusat',
                'flyer_kegiatan' => 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200',
                'sertifikat_kegiatan' => 'sertifikat-kewirausahaan.pdf',
                'waktu_mulai' => Carbon::create(2025, 8, 20, 13, 0, 0),
                'waktu_berakhir' => Carbon::create(2025, 8, 20, 17, 0, 0),
            ],
            [
                'kategori_id' => $webinarKategori->id,
                'judul_kegiatan' => 'Webinar Data Science untuk Pemula',
                'slug' => 'webinar-data-science-pemula',
                'deskripsi_kegiatan' => 'Webinar interaktif yang mengajarkan dasar-dasar data science, machine learning, dan analisis data menggunakan Python. Materi disesuaikan untuk pemula tanpa background programming.',
                'lokasi_kegiatan' => 'Online via Zoom',
                'flyer_kegiatan' => 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200',
                'sertifikat_kegiatan' => 'sertifikat-data-science.pdf',
                'waktu_mulai' => Carbon::create(2025, 9, 10, 19, 0, 0),
                'waktu_berakhir' => Carbon::create(2025, 9, 10, 21, 0, 0),
            ],
            [
                'kategori_id' => $pelatihanKategori->id,
                'judul_kegiatan' => 'Pelatihan UI/UX Design',
                'slug' => 'pelatihan-ui-ux-design',
                'deskripsi_kegiatan' => 'Pelatihan komprehensif tentang User Interface dan User Experience Design. Peserta akan belajar prinsip-prinsip desain, tools yang digunakan, dan praktik langsung membuat prototype aplikasi.',
                'lokasi_kegiatan' => 'Creative Hub Bandung, Jawa Barat',
                'flyer_kegiatan' => 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200',
                'sertifikat_kegiatan' => 'sertifikat-ui-ux.pdf',
                'waktu_mulai' => Carbon::create(2025, 10, 5, 9, 0, 0),
                'waktu_berakhir' => Carbon::create(2025, 10, 7, 17, 0, 0),
            ],
            [
                'kategori_id' => $workshopKategori->id,
                'judul_kegiatan' => 'Workshop Content Creation',
                'slug' => 'workshop-content-creation',
                'deskripsi_kegiatan' => 'Workshop praktis tentang cara membuat konten yang menarik untuk media sosial, blog, dan platform digital lainnya. Termasuk teknik fotografi, video editing, dan copywriting.',
                'lokasi_kegiatan' => 'Digital Studio Yogyakarta, DIY',
                'flyer_kegiatan' => 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1200',
                'sertifikat_kegiatan' => 'sertifikat-content-creation.pdf',
                'waktu_mulai' => Carbon::create(2025, 11, 12, 10, 0, 0),
                'waktu_berakhir' => Carbon::create(2025, 11, 12, 16, 0, 0),
            ],
            [
                'kategori_id' => $seminarKategori->id,
                'judul_kegiatan' => 'Seminar Teknologi Blockchain',
                'slug' => 'seminar-teknologi-blockchain',
                'deskripsi_kegiatan' => 'Seminar yang membahas tentang teknologi blockchain, cryptocurrency, dan aplikasinya dalam berbagai industri. Dihadiri oleh para ahli dan praktisi blockchain terkemuka.',
                'lokasi_kegiatan' => 'Tech Tower Surabaya, Jawa Timur',
                'flyer_kegiatan' => 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200',
                'sertifikat_kegiatan' => 'sertifikat-blockchain.pdf',
                'waktu_mulai' => Carbon::create(2025, 12, 8, 14, 0, 0),
                'waktu_berakhir' => Carbon::create(2025, 12, 8, 18, 0, 0),
            ],
        ];

        foreach ($kegiatan as $data) {
            Kegiatan::create($data);
        }
    }
}
