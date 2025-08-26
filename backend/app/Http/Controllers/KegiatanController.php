<?php

namespace App\Http\Controllers;

use App\Models\Kegiatan;
use App\Models\KategoriKegiatan;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class KegiatanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $kegiatan = Kegiatan::with('kategori')->get();
        return response()->json([
            'success' => true,
            'data' => $kegiatan
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
            'kategori_id' => 'required|exists:kategori_kegiatan,id',
            'judul_kegiatan' => 'required|string|max:255',
            'deskripsi_kegiatan' => 'required|string',
            'lokasi_kegiatan' => 'required|string|max:255',
            'flyer_kegiatan' => 'nullable|string|max:255',
            'sertifikat_kegiatan' => 'nullable|string|max:255',
            'waktu_mulai' => 'required|date',
            'waktu_berakhir' => 'required|date|after:waktu_mulai',
        ]);

        $kegiatan = Kegiatan::create([
            'kategori_id' => $request->kategori_id,
            'judul_kegiatan' => $request->judul_kegiatan,
            'slug' => Str::slug($request->judul_kegiatan),
            'deskripsi_kegiatan' => $request->deskripsi_kegiatan,
            'lokasi_kegiatan' => $request->lokasi_kegiatan,
            'flyer_kegiatan' => $request->flyer_kegiatan,
            'sertifikat_kegiatan' => $request->sertifikat_kegiatan,
            'waktu_mulai' => $request->waktu_mulai,
            'waktu_berakhir' => $request->waktu_berakhir,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kegiatan berhasil dibuat',
            'data' => $kegiatan->load('kategori')
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $kegiatan = Kegiatan::with(['kategori', 'daftarHadir.user'])->find($id);
        
        if (!$kegiatan) {
            return response()->json([
                'success' => false,
                'message' => 'Kegiatan tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $kegiatan
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
        $kegiatan = Kegiatan::find($id);
        
        if (!$kegiatan) {
            return response()->json([
                'success' => false,
                'message' => 'Kegiatan tidak ditemukan'
            ], 404);
        }

        $request->validate([
            'kategori_id' => 'required|exists:kategori_kegiatan,id',
            'judul_kegiatan' => 'required|string|max:255',
            'deskripsi_kegiatan' => 'required|string',
            'lokasi_kegiatan' => 'required|string|max:255',
            'flyer_kegiatan' => 'nullable|string|max:255',
            'sertifikat_kegiatan' => 'nullable|string|max:255',
            'waktu_mulai' => 'required|date',
            'waktu_berakhir' => 'required|date|after:waktu_mulai',
        ]);

        $kegiatan->update([
            'kategori_id' => $request->kategori_id,
            'judul_kegiatan' => $request->judul_kegiatan,
            'slug' => Str::slug($request->judul_kegiatan),
            'deskripsi_kegiatan' => $request->deskripsi_kegiatan,
            'lokasi_kegiatan' => $request->lokasi_kegiatan,
            'flyer_kegiatan' => $request->flyer_kegiatan,
            'sertifikat_kegiatan' => $request->sertifikat_kegiatan,
            'waktu_mulai' => $request->waktu_mulai,
            'waktu_berakhir' => $request->waktu_berakhir,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kegiatan berhasil diperbarui',
            'data' => $kegiatan->load('kategori')
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $kegiatan = Kegiatan::find($id);
        
        if (!$kegiatan) {
            return response()->json([
                'success' => false,
                'message' => 'Kegiatan tidak ditemukan'
            ], 404);
        }

        $kegiatan->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kegiatan berhasil dihapus'
        ]);
    }

    /**
     * Get activities by category
     */
    public function getByKategori(string $kategori_id)
    {
        $kegiatan = Kegiatan::with('kategori')
            ->where('kategori_id', $kategori_id)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $kegiatan
        ]);
    }
}
