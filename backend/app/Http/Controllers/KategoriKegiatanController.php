<?php

namespace App\Http\Controllers;

use App\Models\KategoriKegiatan;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class KategoriKegiatanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $kategoris = KategoriKegiatan::all();
        return response()->json([
            'success' => true,
            'data' => $kategoris
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
            'nama_kategori' => 'required|string|max:255',
            'kategori_logo' => 'nullable|string|max:255',
        ]);

        $kategori = KategoriKegiatan::create([
            'nama_kategori' => $request->nama_kategori,
            'slug' => Str::slug($request->nama_kategori),
            'kategori_logo' => $request->kategori_logo,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kategori kegiatan berhasil dibuat',
            'data' => $kategori
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $kategori = KategoriKegiatan::with('kegiatan')->find($id);
        
        if (!$kategori) {
            return response()->json([
                'success' => false,
                'message' => 'Kategori kegiatan tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $kategori
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
        $kategori = KategoriKegiatan::find($id);
        
        if (!$kategori) {
            return response()->json([
                'success' => false,
                'message' => 'Kategori kegiatan tidak ditemukan'
            ], 404);
        }

        $request->validate([
            'nama_kategori' => 'required|string|max:255',
            'kategori_logo' => 'nullable|string|max:255',
        ]);

        $kategori->update([
            'nama_kategori' => $request->nama_kategori,
            'slug' => Str::slug($request->nama_kategori),
            'kategori_logo' => $request->kategori_logo,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kategori kegiatan berhasil diperbarui',
            'data' => $kategori
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $kategori = KategoriKegiatan::find($id);
        
        if (!$kategori) {
            return response()->json([
                'success' => false,
                'message' => 'Kategori kegiatan tidak ditemukan'
            ], 404);
        }

        $kategori->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kategori kegiatan berhasil dihapus'
        ]);
    }
}
