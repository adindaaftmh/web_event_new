<?php

namespace App\Http\Controllers;

use App\Models\Flyer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class FlyerController extends Controller
{
    /**
     * Display a listing of active flyers.
     */
    public function index()
    {
        $flyers = Flyer::orderBy('order', 'asc')
                      ->orderBy('created_at', 'desc')
                      ->get()
                      ->map(function ($flyer) {
                          return [
                              'id' => $flyer->id,
                              'title' => $flyer->title,
                              'image_path' => $flyer->image_path,
                              'image_url' => $flyer->image_url,
                              'description' => $flyer->description,
                              'order' => $flyer->order,
                              'is_active' => $flyer->is_active,
                              'link_url' => $flyer->link_url,
                              'created_at' => $flyer->created_at,
                              'updated_at' => $flyer->updated_at,
                          ];
                      });

        return response()->json([
            'success' => true,
            'data' => $flyers
        ]);
    }

    /**
     * Display a listing of active flyers only.
     */
    public function activeFlyers()
    {
        $flyers = Flyer::where('is_active', true)
                      ->orderBy('order', 'asc')
                      ->get()
                      ->map(function ($flyer) {
                          return [
                              'id' => $flyer->id,
                              'title' => $flyer->title,
                              'image_url' => $flyer->image_url,
                              'description' => $flyer->description,
                              'link_url' => $flyer->link_url,
                          ];
                      });

        return response()->json([
            'success' => true,
            'data' => $flyers
        ]);
    }

    /**
     * Store a newly created flyer in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'image' => 'required|file|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'description' => 'nullable|string',
            'order' => 'nullable|integer|min:1',
            'is_active' => 'nullable|boolean',
            'link_url' => 'nullable|url|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('flyers', 'public');
        }

        $flyer = Flyer::create([
            'title' => $request->title,
            'image_path' => $imagePath,
            'description' => $request->description,
            'order' => $request->order ?? 1,
            'is_active' => $request->is_active ?? true,
            'link_url' => $request->link_url
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Flyer berhasil ditambahkan',
            'data' => [
                'id' => $flyer->id,
                'title' => $flyer->title,
                'image_path' => $flyer->image_path,
                'image_url' => $flyer->image_url,
                'description' => $flyer->description,
                'order' => $flyer->order,
                'is_active' => $flyer->is_active,
                'link_url' => $flyer->link_url,
                'created_at' => $flyer->created_at,
                'updated_at' => $flyer->updated_at,
            ]
        ], 201);
    }

    /**
     * Display the specified flyer.
     */
    public function show(string $id)
    {
        $flyer = Flyer::find($id);

        if (!$flyer) {
            return response()->json([
                'success' => false,
                'message' => 'Flyer tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $flyer->id,
                'title' => $flyer->title,
                'image_path' => $flyer->image_path,
                'image_url' => $flyer->image_url,
                'description' => $flyer->description,
                'order' => $flyer->order,
                'is_active' => $flyer->is_active,
                'link_url' => $flyer->link_url,
                'created_at' => $flyer->created_at,
                'updated_at' => $flyer->updated_at,
            ]
        ]);
    }

    /**
     * Update the specified flyer in storage.
     */
    public function update(Request $request, string $id)
    {
        $flyer = Flyer::find($id);

        if (!$flyer) {
            return response()->json([
                'success' => false,
                'message' => 'Flyer tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'image' => 'nullable|file|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'description' => 'nullable|string',
            'order' => 'nullable|integer|min:1',
            'is_active' => 'nullable|boolean',
            'link_url' => 'nullable|url|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Update image if new one is uploaded
        if ($request->hasFile('image')) {
            // Delete old image
            if ($flyer->image_path && !filter_var($flyer->image_path, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete($flyer->image_path);
            }
            
            $imagePath = $request->file('image')->store('flyers', 'public');
            $flyer->image_path = $imagePath;
        }

        // Update other fields
        if ($request->has('title')) {
            $flyer->title = $request->title;
        }
        if ($request->has('description')) {
            $flyer->description = $request->description;
        }
        if ($request->has('order')) {
            $flyer->order = $request->order;
        }
        if ($request->has('is_active')) {
            $flyer->is_active = $request->is_active;
        }
        if ($request->has('link_url')) {
            $flyer->link_url = $request->link_url;
        }

        $flyer->save();

        return response()->json([
            'success' => true,
            'message' => 'Flyer berhasil diupdate',
            'data' => [
                'id' => $flyer->id,
                'title' => $flyer->title,
                'image_path' => $flyer->image_path,
                'image_url' => $flyer->image_url,
                'description' => $flyer->description,
                'order' => $flyer->order,
                'is_active' => $flyer->is_active,
                'link_url' => $flyer->link_url,
                'created_at' => $flyer->created_at,
                'updated_at' => $flyer->updated_at,
            ]
        ]);
    }

    /**
     * Remove the specified flyer from storage.
     */
    public function destroy(string $id)
    {
        $flyer = Flyer::find($id);

        if (!$flyer) {
            return response()->json([
                'success' => false,
                'message' => 'Flyer tidak ditemukan'
            ], 404);
        }

        // Delete image file
        if ($flyer->image_path && !filter_var($flyer->image_path, FILTER_VALIDATE_URL)) {
            Storage::disk('public')->delete($flyer->image_path);
        }

        $flyer->delete();

        return response()->json([
            'success' => true,
            'message' => 'Flyer berhasil dihapus'
        ]);
    }

    /**
     * Toggle flyer active status
     */
    public function toggleActive(string $id)
    {
        $flyer = Flyer::find($id);

        if (!$flyer) {
            return response()->json([
                'success' => false,
                'message' => 'Flyer tidak ditemukan'
            ], 404);
        }

        $flyer->is_active = !$flyer->is_active;
        $flyer->save();

        return response()->json([
            'success' => true,
            'message' => 'Status flyer berhasil diubah',
            'data' => [
                'id' => $flyer->id,
                'is_active' => $flyer->is_active
            ]
        ]);
    }

    /**
     * Update flyer order
     */
    public function updateOrder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'flyers' => 'required|array',
            'flyers.*.id' => 'required|exists:flyers,id',
            'flyers.*.order' => 'required|integer|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        foreach ($request->flyers as $flyerData) {
            Flyer::where('id', $flyerData['id'])
                 ->update(['order' => $flyerData['order']]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Urutan flyer berhasil diupdate'
        ]);
    }
}
