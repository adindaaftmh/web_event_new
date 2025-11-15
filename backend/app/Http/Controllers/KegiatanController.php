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
     * Generate unique slug
     */
    private function generateUniqueSlug($title)
    {
        $slug = Str::slug($title);
        $originalSlug = $slug;
        $count = 1;

        // Check if slug exists and append number if needed
        while (Kegiatan::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $count;
            $count++;
        }

        return $slug;
    }

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
        // Validasi dengan support URL Cloudinary
        $request->validate([
            'kategori' => 'required|string|max:255',
            'judul_kegiatan' => 'required|string|max:255',
            'deskripsi_kegiatan' => 'required|string',
            'lokasi_kegiatan' => 'required|string|max:255', // Terima URL atau file
            'flyer_kegiatan' => 'nullable|string', // URL dari Cloudinary atau path
            'sertifikat_kegiatan' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,pdf|max:5120',
            'waktu_mulai' => 'required|date|after:now',
            'waktu_selesai' => 'nullable|date|after:waktu_mulai',
            'kapasitas_peserta' => 'nullable|integer|min:1',
            'harga_tiket' => 'nullable|numeric|min:0',
            'kontak_panitia' => 'nullable|string|max:255',
            'penyelenggara' => 'required|string|max:255',
            'tipe_peserta' => 'nullable|string|in:individu,tim',
            'tickets' => 'nullable|string',
        ]);

        // Validate H-3 rule: admin can only create events max 3 days before event date
        $eventDate = \Carbon\Carbon::parse($request->waktu_mulai);
        $now = \Carbon\Carbon::now();
        $minDate = $now->copy()->addDays(3); // H-3

        if ($eventDate->lessThan($minDate)) {
            return response()->json([
                'success' => false,
                'message' => 'Kegiatan hanya dapat dibuat maksimal H-3 dari tanggal pelaksanaan. Event pada ' . $eventDate->format('d M Y') . ' dapat dibuat mulai ' . $minDate->format('d M Y')
            ], 422);
        }

         $flyerPath = null;
        if ($request->flyer_kegiatan) {
            // Cek apakah ini URL Cloudinary (mengandung cloudinary.com)
            if (filter_var($request->flyer_kegiatan, FILTER_VALIDATE_URL) && 
                str_contains($request->flyer_kegiatan, 'cloudinary.com')) {
                // Langsung simpan URL Cloudinary
                $flyerPath = $request->flyer_kegiatan;
            } elseif ($request->hasFile('flyer_kegiatan')) {
                // Fallback: Upload file seperti biasa (jika masih ada yang upload file)
                $flyerPath = $request->file('flyer_kegiatan')->store('flyers', 'public');
            }
        }

        $sertifikatPath = null;
        if ($request->hasFile('sertifikat_kegiatan')) {
            $sertifikatPath = $request->file('sertifikat_kegiatan')->store('certificates', 'public');
        }

        // Find kategori_id by nama_kategori
        $kategori = KategoriKegiatan::where('nama_kategori', $request->kategori)->first();

        // Generate unique slug
        $slug = $this->generateUniqueSlug($request->judul_kegiatan);

        $kegiatan = Kegiatan::create([
            'kategori_id' => $kategori ? $kategori->id : null,
            'judul_kegiatan' => $request->judul_kegiatan,
            'slug' => $slug,
            'deskripsi_kegiatan' => $request->deskripsi_kegiatan,
            'lokasi_kegiatan' => $request->lokasi_kegiatan,
            'flyer_kegiatan' => $flyerPath, //URL Cloudinary atau path lokal
            'sertifikat_kegiatan' => $sertifikatPath,
            'waktu_mulai' => $request->waktu_mulai,
            'waktu_berakhir' => $request->waktu_selesai,
            'kapasitas_peserta' => $request->kapasitas_peserta,
            'harga_tiket' => $request->harga_tiket,
            'kontak_panitia' => $request->kontak_panitia,
            'penyelenggara' => $request->penyelenggara,
            'tipe_peserta' => $request->tipe_peserta ?? 'individu',
            'tickets' => $request->tickets,
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
            'flyer_kegiatan' => 'nullable|string', // ✅ UBAH: Terima URL atau file
            'waktu_mulai' => 'required|date',
            'waktu_selesai' => 'nullable|date|after:waktu_mulai',
            'kapasitas_peserta' => 'nullable|integer|min:1',
            'harga_tiket' => 'nullable|numeric|min:0',
            'kontak_panitia' => 'nullable|string|max:255',
            'penyelenggara' => 'required|string|max:255',
            'tipe_peserta' => 'nullable|string|in:individu,tim',
            'tickets' => 'nullable|string',
        ]);

         $flyerPath = $kegiatan->flyer_kegiatan;
        
        if ($request->flyer_kegiatan) {
            // Cek apakah ini URL Cloudinary
            if (filter_var($request->flyer_kegiatan, FILTER_VALIDATE_URL) && 
                str_contains($request->flyer_kegiatan, 'cloudinary.com')) {
                
                // Jika flyer lama bukan URL Cloudinary, hapus file lokal
                if ($flyerPath && !str_contains($flyerPath, 'cloudinary.com') && 
                    Storage::disk('public')->exists($flyerPath)) {
                    Storage::disk('public')->delete($flyerPath);
                }
                
                // Simpan URL Cloudinary baru
                $flyerPath = $request->flyer_kegiatan;
                
            } elseif ($request->hasFile('flyer_kegiatan')) {
                // Upload file baru
                if ($flyerPath && !str_contains($flyerPath, 'cloudinary.com') && 
                    Storage::disk('public')->exists($flyerPath)) {
                    Storage::disk('public')->delete($flyerPath);
                }
                $flyerPath = $request->file('flyer_kegiatan')->store('flyers', 'public');
            }
        }


        // Find kategori_id by nama_kategori
        $kategori = KategoriKegiatan::where('nama_kategori', $request->kategori)->first();

        $kegiatan->update([
            'kategori_id' => $kategori ? $kategori->id : $kegiatan->kategori_id,
            'judul_kegiatan' => $request->judul_kegiatan,
            'slug' => Str::slug($request->judul_kegiatan),
            'deskripsi_kegiatan' => $request->deskripsi_kegiatan,
            'lokasi_kegiatan' => $request->lokasi_kegiatan,
            'flyer_kegiatan' => $flyerPath, // URL Cloudinary atau path lokal
            'waktu_mulai' => $request->waktu_mulai,
            'waktu_berakhir' => $request->waktu_selesai,
            'kapasitas_peserta' => $request->kapasitas_peserta,
            'harga_tiket' => $request->harga_tiket,
            'kontak_panitia' => $request->kontak_panitia,
            'penyelenggara' => $request->penyelenggara,
            'tipe_peserta' => $request->tipe_peserta ?? $kegiatan->tipe_peserta,
            'tickets' => $request->tickets ?? $kegiatan->tickets,
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

         // Delete flyer file HANYA jika bukan URL Cloudinary
        if ($kegiatan->flyer_kegiatan && 
            !str_contains($kegiatan->flyer_kegiatan, 'cloudinary.com') &&
            Storage::disk('public')->exists($kegiatan->flyer_kegiatan)) {
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

    /**
     * Search activities by keyword
     */
    public function search(Request $request)
    {
        $keyword = $request->query('q');

        if (!$keyword) {
            return response()->json([
                'success' => false,
                'message' => 'Kata kunci pencarian diperlukan'
            ], 400);
        }

        $kegiatan = Kegiatan::with('kategori')
            ->where('judul_kegiatan', 'LIKE', "%{$keyword}%")
            ->orWhere('deskripsi_kegiatan', 'LIKE', "%{$keyword}%")
            ->orWhere('lokasi_kegiatan', 'LIKE', "%{$keyword}%")
            ->orWhereHas('kategori', function ($query) use ($keyword) {
                $query->where('nama_kategori', 'LIKE', "%{$keyword}%");
            })
            ->where('waktu_mulai', '>', now()) // Only show future events
            ->orderBy('waktu_mulai', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $kegiatan,
            'count' => $kegiatan->count(),
            'keyword' => $keyword
        ]);
    }
}
