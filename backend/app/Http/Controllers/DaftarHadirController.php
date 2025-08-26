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
            'user_id' => 'required|exists:users,id',
            'kegiatan_id' => 'required|exists:kegiatan,id',
            'otp' => 'nullable|string|max:10',
        ]);

        // Check if user already registered for this activity
        $existingAttendance = DaftarHadir::where('user_id', $request->user_id)
            ->where('kegiatan_id', $request->kegiatan_id)
            ->first();

        if ($existingAttendance) {
            return response()->json([
                'success' => false,
                'message' => 'User sudah terdaftar untuk kegiatan ini'
            ], 400);
        }

        $daftarHadir = DaftarHadir::create([
            'user_id' => $request->user_id,
            'kegiatan_id' => $request->kegiatan_id,
            'otp' => $request->otp ?? Str::random(6),
            'status_absen' => 'tidak-hadir',
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
}
