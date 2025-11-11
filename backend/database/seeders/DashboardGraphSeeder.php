<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardGraphSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Generating dummy participants data for dashboard graphs...');

        // Array nama dummy
        $namaDepan = ['Ahmad', 'Budi', 'Citra', 'Dian', 'Eka', 'Fajar', 'Gita', 'Hadi', 'Indra', 'Joko', 'Kartika', 'Lina', 'Maya', 'Nanda', 'Omar', 'Putri', 'Rudi', 'Siti', 'Tari', 'Umar', 'Vina', 'Wulan', 'Yoga', 'Zahra'];
        $namaBelakang = ['Pratama', 'Santoso', 'Wijaya', 'Kusuma', 'Permata', 'Saputra', 'Wati', 'Setiawan', 'Rahayu', 'Hidayat', 'Kartika', 'Nugroho', 'Purnama', 'Lestari', 'Mahendra'];
        
        $pendidikan = ['SMA', 'D3', 'S1', 'S2', 'S3'];
        $tipeTicket = ['Early Bird', 'Regular', 'VIP', 'Premium'];

        // Ambil semua event yang tersedia
        $events = DB::table('kegiatan')->get();
        
        if ($events->isEmpty()) {
            $this->command->error('No events found! Please run KegiatanSeeder first.');
            return;
        }

        $totalParticipants = 0;
        $participantsData = [];

        // Generate data untuk setiap bulan di tahun 2025
        for ($month = 1; $month <= 12; $month++) {
            // Jumlah peserta per bulan: variasi antara 30-80 peserta
            $participantsPerMonth = rand(30, 80);
            
            for ($i = 0; $i < $participantsPerMonth; $i++) {
                // Random event
                $event = $events->random();
                
                // Random tanggal dalam bulan tersebut
                $day = rand(1, min(28, Carbon::create(2025, $month, 1)->daysInMonth));
                $createdAt = Carbon::create(2025, $month, $day)
                    ->setTime(rand(8, 20), rand(0, 59), rand(0, 59));

                // Generate nama random
                $namaLengkap = $namaDepan[array_rand($namaDepan)] . ' ' . $namaBelakang[array_rand($namaBelakang)];
                $email = strtolower(str_replace(' ', '.', $namaLengkap)) . rand(100, 999) . '@email.com';
                
                // Random tipe tiket
                $randomTicket = $tipeTicket[array_rand($tipeTicket)];
                
                // Hitung harga berdasarkan tipe tiket
                $basePrice = $event->harga_tiket ?? 100000;
                $hargaTiket = match($randomTicket) {
                    'Early Bird' => $basePrice * 0.7,
                    'Regular' => $basePrice,
                    'VIP' => $basePrice * 1.5,
                    'Premium' => $basePrice * 2,
                    default => $basePrice
                };
                
                // Bulatkan ke ribuan terdekat
                $hargaTiket = round($hargaTiket / 1000) * 1000;

                $participantsData[] = [
                    'user_id' => null, // NULL untuk dummy data
                    'kegiatan_id' => $event->id,
                    'nama_lengkap' => $namaLengkap,
                    'email' => $email,
                    'no_telepon' => '08' . rand(1000000000, 9999999999),
                    'alamat' => 'Jl. ' . $namaDepan[array_rand($namaDepan)] . ' No.' . rand(1, 100),
                    'pendidikan_terakhir' => $pendidikan[array_rand($pendidikan)],
                    'tipe_peserta' => 'individu',
                    'tiket_dipilih' => $randomTicket,
                    'jumlah_tiket' => 1,
                    'total_harga' => $hargaTiket,
                    'status_verifikasi' => 'verified',
                    'status_kehadiran' => rand(0, 10) > 3 ? 'hadir' : 'tidak_hadir',
                    'otp' => strtoupper(substr(md5(uniqid()), 0, 6)),
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ];

                $totalParticipants++;
            }
        }

        // Insert data dalam batch untuk performa lebih baik
        $chunks = array_chunk($participantsData, 100);
        foreach ($chunks as $chunk) {
            DB::table('daftar_hadir')->insert($chunk);
        }

        $this->command->info("✓ Successfully generated {$totalParticipants} dummy participants!");
        $this->command->info('✓ Data tersebar di 12 bulan tahun 2025 untuk grafik dashboard.');
        
        // Tampilkan statistik per event (untuk top 10)
        $eventStats = DB::table('daftar_hadir')
            ->select('kegiatan_id', DB::raw('count(*) as total_participants'))
            ->whereNull('user_id')
            ->groupBy('kegiatan_id')
            ->orderByDesc('total_participants')
            ->limit(10)
            ->get();

        $this->command->info("\n📊 Top 10 Events with Most Participants:");
        foreach ($eventStats as $index => $stat) {
            $eventName = DB::table('kegiatan')->where('id', $stat->kegiatan_id)->value('judul_kegiatan');
            $this->command->info(($index + 1) . ". {$eventName}: {$stat->total_participants} participants");
        }
    }
}