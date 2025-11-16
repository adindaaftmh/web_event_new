<?php

namespace App\Http\Controllers;

use App\Models\DaftarHadir;
use App\Models\Kegiatan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DaftarHadirController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $daftarHadir = DaftarHadir::with(['user', 'kegiatan.kategori'])->get();
        return response()->json([
            'success' => true,
            'data' => $daftarHadir
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'kegiatan_id' => 'required|exists:kegiatan,id',
            'nama_lengkap' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'no_telepon' => 'required|string|max:20',
            'alamat' => 'nullable|string',
            'pendidikan_terakhir' => 'nullable|string|max:100',
            'tipe_peserta' => 'required|in:individu,tim',
            'nama_tim' => 'nullable|required_if:tipe_peserta,tim|string|max:255',
            'data_tim' => 'nullable|string',
            'tiket_dipilih' => 'nullable|string|max:255',
            'jumlah_tiket' => 'nullable|integer|min:1',
            'total_harga' => 'nullable|numeric|min:0',
            'status_kehadiran' => 'nullable|in:hadir,tidak_hadir',
            'status_verifikasi' => 'nullable|in:pending,verified,rejected',
            'otp' => 'nullable|string|max:10',
        ]);

        // Check if event registration is still open (before event starts)
        $kegiatan = Kegiatan::find($request->kegiatan_id);

        if (!$kegiatan) {
            return response()->json([
                'success' => false,
                'message' => 'Kegiatan tidak ditemukan'
            ], 404);
        }

        // Check if event has ended
        $now = now();
        if ($kegiatan->waktu_berakhir && $now->greaterThan($kegiatan->waktu_berakhir)) {
            return response()->json([
                'success' => false,
                'message' => 'Pendaftaran kegiatan sudah ditutup karena kegiatan sudah selesai'
            ], 400);
        }

        // Check if user already registered for this activity (by email)
        $existingAttendance = DaftarHadir::where('email', $request->email)
            ->where('kegiatan_id', $request->kegiatan_id)
            ->first();

        if ($existingAttendance) {
            return response()->json([
                'success' => false,
                'message' => 'Email ini sudah terdaftar untuk kegiatan ini. Silakan cek halaman Profile -> Token Hadir untuk melihat tiket Anda.',
                'data' => [
                    'registration_id' => $existingAttendance->id,
                    'token' => $existingAttendance->otp
                ]
            ], 400);
        }

        $daftarHadir = DaftarHadir::create([
            'user_id' => $request->user_id,
            'kegiatan_id' => $request->kegiatan_id,
            'nama_lengkap' => $request->nama_lengkap,
            'email' => $request->email,
            'no_telepon' => $request->no_telepon,
            'alamat' => $request->alamat,
            'pendidikan_terakhir' => $request->pendidikan_terakhir,
            'tipe_peserta' => $request->tipe_peserta,
            'nama_tim' => $request->nama_tim,
            'data_tim' => $request->data_tim,
            'tiket_dipilih' => $request->tiket_dipilih,
            'jumlah_tiket' => $request->jumlah_tiket ?? 1,
            'total_harga' => $request->total_harga ?? 0,
            'status_verifikasi' => $request->status_verifikasi ?? 'pending',
            'otp' => $request->otp ?? Str::random(6),
            'status_kehadiran' => $request->status_kehadiran ?? 'tidak_hadir',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran berhasil',
            'data' => $daftarHadir->load(['user', 'kegiatan'])
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $daftarHadir = DaftarHadir::with(['user', 'kegiatan.kategori'])->find($id);
        
        if (!$daftarHadir) {
            return response()->json([
                'success' => false,
                'message' => 'Data kehadiran tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $daftarHadir
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $daftarHadir = DaftarHadir::find($id);
        
        if (!$daftarHadir) {
            return response()->json([
                'success' => false,
                'message' => 'Data kehadiran tidak ditemukan'
            ], 404);
        }

        $request->validate([
            'otp' => 'nullable|string|max:10',
            'status_absen' => 'required|in:hadir,tidak-hadir',
            'waktu_absen' => 'nullable|date',
        ]);

        $daftarHadir->update([
            'otp' => $request->otp,
            'status_absen' => $request->status_absen,
            'waktu_absen' => $request->status_absen === 'hadir' ? now() : null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Data kehadiran berhasil diperbarui',
            'data' => $daftarHadir->load(['user', 'kegiatan'])
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $daftarHadir = DaftarHadir::find($id);
        
        if (!$daftarHadir) {
            return response()->json([
                'success' => false,
                'message' => 'Data kehadiran tidak ditemukan'
            ], 404);
        }

        $daftarHadir->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data kehadiran berhasil dihapus'
        ]);
    }

    /**
     * Absen dengan OTP
     */
    public function absen(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'kegiatan_id' => 'required|exists:kegiatan,id',
            'otp' => 'required|string|max:10',
        ]);

        $daftarHadir = DaftarHadir::where('user_id', $request->user_id)
            ->where('kegiatan_id', $request->kegiatan_id)
            ->first();

        if (!$daftarHadir) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak terdaftar untuk kegiatan ini'
            ], 404);
        }

        if ($daftarHadir->otp !== $request->otp) {
            return response()->json([
                'success' => false,
                'message' => 'OTP tidak valid'
            ], 400);
        }

        if ($daftarHadir->status_absen === 'hadir') {
            return response()->json([
                'success' => false,
                'message' => 'Anda sudah melakukan absen'
            ], 400);
        }

        $daftarHadir->update([
            'status_absen' => 'hadir',
            'waktu_absen' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Absen berhasil',
            'data' => $daftarHadir->load(['user', 'kegiatan'])
        ]);
    }

    /**
     * Issue certificate for an attendance record
     */
    public function issueCertificate(Request $request, string $id)
    {
        $daftarHadir = DaftarHadir::find($id);

        if (!$daftarHadir) {
            return response()->json([
                'success' => false,
                'message' => 'Data kehadiran tidak ditemukan'
            ], 404);
        }

        $request->validate([
            'nomor_sertifikat' => 'required|string|max:100',
            'tanggal_terbit_sertifikat' => 'nullable|date',
        ]);

        $daftarHadir->nomor_sertifikat = $request->nomor_sertifikat;
        $daftarHadir->tanggal_terbit_sertifikat = $request->tanggal_terbit_sertifikat ?? now();
        $daftarHadir->save();

        return response()->json([
            'success' => true,
            'message' => 'Sertifikat berhasil diterbitkan',
            'data' => $daftarHadir->load(['user', 'kegiatan'])
        ]);
    }

    /**
     * Revoke certificate for an attendance record
     */
    public function revokeCertificate(string $id)
    {
        $daftarHadir = DaftarHadir::find($id);

        if (!$daftarHadir) {
            return response()->json([
                'success' => false,
                'message' => 'Data kehadiran tidak ditemukan'
            ], 404);
        }

        $daftarHadir->nomor_sertifikat = null;
        $daftarHadir->tanggal_terbit_sertifikat = null;
        $daftarHadir->save();

        return response()->json([
            'success' => true,
            'message' => 'Sertifikat berhasil dicabut',
            'data' => $daftarHadir->load(['user', 'kegiatan'])
        ]);
    }

    /**
     * Get attendance by activity
     */
    public function getByKegiatan(string $kegiatan_id)
    {
        $daftarHadir = DaftarHadir::with(['user', 'kegiatan.kategori'])
            ->where('kegiatan_id', $kegiatan_id)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $daftarHadir
        ]);
    }

    /**
     * Get attendance by user
     */
    public function getByUser(string $user_id)
    {
        $daftarHadir = DaftarHadir::with(['user', 'kegiatan.kategori'])
            ->where('user_id', $user_id)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $daftarHadir
        ]);
    }

    /**
     * Export attendance data to CSV
     */
    public function export(Request $request, string $kegiatan_id)
    {
        $kegiatan = Kegiatan::find($kegiatan_id);

        if (!$kegiatan) {
            return response()->json([
                'success' => false,
                'message' => 'Kegiatan tidak ditemukan'
            ], 404);
        }

        $daftarHadir = DaftarHadir::with(['user', 'kegiatan'])
            ->where('kegiatan_id', $kegiatan_id)
            ->get();

        $filename = 'peserta_' . Str::slug($kegiatan->judul_kegiatan) . '_' . date('Y-m-d') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($daftarHadir) {
            $file = fopen('php://output', 'w');

            // Header row
            fputcsv($file, [
                'No',
                'Nama Lengkap',
                'Email',
                'No. Handphone',
                'Tanggal Daftar',
                'Status Kehadiran',
                'Waktu Absen'
            ]);

            // Data rows
            foreach ($daftarHadir as $index => $item) {
                fputcsv($file, [
                    $index + 1,
                    $item->user->nama_lengkap,
                    $item->user->email,
                    $item->user->no_handphone,
                    $item->created_at->format('d/m/Y H:i'),
                    $item->status_absen === 'hadir' ? 'Hadir' : 'Tidak Hadir',
                    $item->waktu_absen ? $item->waktu_absen->format('d/m/Y H:i') : '-'
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
