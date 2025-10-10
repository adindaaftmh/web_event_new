<?php

namespace App\Http\Controllers;

use App\Models\Kegiatan;
use App\Models\KategoriKegiatan;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

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
            'kategori' => 'required|string|max:255',
            'judul_kegiatan' => 'required|string|max:255',
            'deskripsi_kegiatan' => 'required|string',
            'lokasi_kegiatan' => 'required|string|max:255',
            'flyer_kegiatan' => 'nullable|file|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'waktu_mulai' => 'required|date',
            'waktu_selesai' => 'nullable|date|after:waktu_mulai',
            'kapasitas_peserta' => 'nullable|integer|min:1',
            'harga_tiket' => 'nullable|numeric|min:0',
            'kontak_panitia' => 'nullable|string|max:255',
        ]);

        $flyerPath = null;
        if ($request->hasFile('flyer_kegiatan')) {
            $flyerPath = $request->file('flyer_kegiatan')->store('flyers', 'public');
        }

        // Find kategori_id by nama_kategori
        $kategori = KategoriKegiatan::where('nama_kategori', $request->kategori)->first();

        $kegiatan = Kegiatan::create([
            'kategori_id' => $kategori ? $kategori->id : null,
            'judul_kegiatan' => $request->judul_kegiatan,
            'slug' => Str::slug($request->judul_kegiatan),
            'deskripsi_kegiatan' => $request->deskripsi_kegiatan,
            'lokasi_kegiatan' => $request->lokasi_kegiatan,
            'flyer_kegiatan' => $flyerPath,
            'waktu_mulai' => $request->waktu_mulai,
            'waktu_berakhir' => $request->waktu_selesai,
            'kapasitas_peserta' => $request->kapasitas_peserta,
            'harga_tiket' => $request->harga_tiket,
            'kontak_panitia' => $request->kontak_panitia,
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
            'kategori' => 'required|string|max:255',
            'judul_kegiatan' => 'required|string|max:255',
            'deskripsi_kegiatan' => 'required|string',
            'lokasi_kegiatan' => 'required|string|max:255',
            'flyer_kegiatan' => 'nullable|file|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'waktu_mulai' => 'required|date',
            'waktu_selesai' => 'nullable|date|after:waktu_mulai',
            'kapasitas_peserta' => 'nullable|integer|min:1',
            'harga_tiket' => 'nullable|numeric|min:0',
            'kontak_panitia' => 'nullable|string|max:255',
        ]);

        $flyerPath = $kegiatan->flyer_kegiatan;
        if ($request->hasFile('flyer_kegiatan')) {
            // Delete old flyer if exists
            if ($flyerPath && Storage::disk('public')->exists($flyerPath)) {
                Storage::disk('public')->delete($flyerPath);
            }
            $flyerPath = $request->file('flyer_kegiatan')->store('flyers', 'public');
        }

        // Find kategori_id by nama_kategori
        $kategori = KategoriKegiatan::where('nama_kategori', $request->kategori)->first();

        $kegiatan->update([
            'kategori_id' => $kategori ? $kategori->id : $kegiatan->kategori_id,
            'judul_kegiatan' => $request->judul_kegiatan,
            'slug' => Str::slug($request->judul_kegiatan),
            'deskripsi_kegiatan' => $request->deskripsi_kegiatan,
            'lokasi_kegiatan' => $request->lokasi_kegiatan,
            'flyer_kegiatan' => $flyerPath,
            'waktu_mulai' => $request->waktu_mulai,
            'waktu_berakhir' => $request->waktu_selesai,
            'kapasitas_peserta' => $request->kapasitas_peserta,
            'harga_tiket' => $request->harga_tiket,
            'kontak_panitia' => $request->kontak_panitia,
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

        // Delete flyer file if exists
        if ($kegiatan->flyer_kegiatan && Storage::disk('public')->exists($kegiatan->flyer_kegiatan)) {
            Storage::disk('public')->delete($kegiatan->flyer_kegiatan);
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
