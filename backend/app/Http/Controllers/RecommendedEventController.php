<?php

namespace App\Http\Controllers;

use App\Models\RecommendedEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class RecommendedEventController extends Controller
{
    /**
     * Display a listing of recommended events.
     */
    public function index()
    {
        $events = RecommendedEvent::orderBy('order', 'asc')
                      ->orderBy('created_at', 'desc')
                      ->get()
                      ->map(function ($event) {
                          return [
                              'id' => $event->id,
                              'title' => $event->title,
                              'description' => $event->description,
                              'category' => $event->category,
                              'tags' => $event->tags,
                              'date' => $event->date,
                              'time' => substr($event->time, 0, 5),
                              'location' => $event->location,
                              'gradient' => $event->gradient,
                              'icon' => $event->icon,
                              'buttonText' => $event->button_text,
                              'buttonGradient' => $event->button_gradient,
                              'schoolText' => $event->school_text,
                              'flyerImage' => $event->flyer_image_url,
                              'active' => $event->active,
                              'order' => $event->order,
                          ];
                      });

        return response()->json([
            'success' => true,
            'data' => $events
        ]);
    }

    /**
     * Display active recommended events only.
     */
    public function activeEvents()
    {
        $events = RecommendedEvent::where('active', true)
                      ->orderBy('order', 'asc')
                      ->get()
                      ->map(function ($event) {
                          return [
                              'id' => $event->id,
                              'title' => $event->title,
                              'description' => $event->description,
                              'category' => $event->category,
                              'tags' => $event->tags,
                              'date' => $event->date,
                              'time' => substr($event->time, 0, 5),
                              'location' => $event->location,
                              'gradient' => $event->gradient,
                              'icon' => $event->icon,
                              'buttonText' => $event->button_text,
                              'buttonGradient' => $event->button_gradient,
                              'schoolText' => $event->school_text,
                              'flyerImage' => $event->flyer_image_url,
                          ];
                      });

        return response()->json([
            'success' => true,
            'data' => $events
        ]);
    }

    /**
     * Store a newly created event.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string|max:100',
            'tags' => 'nullable|array',
            'date' => 'required|date',
            'time' => 'required',
            'location' => 'required|string|max:255',
            'gradient' => 'nullable|string',
            'icon' => 'nullable|string',
            'buttonText' => 'nullable|string',
            'buttonGradient' => 'nullable|string',
            'schoolText' => 'nullable|string',
            'flyerImage' => 'nullable|file|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'active' => 'nullable|boolean',
            'order' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $flyerImagePath = null;
        if ($request->hasFile('flyerImage')) {
            $flyerImagePath = $request->file('flyerImage')->store('event-flyers', 'public');
        }

        $event = RecommendedEvent::create([
            'title' => $request->title,
            'description' => $request->description,
            'category' => $request->category,
            'tags' => $request->tags ?? [],
            'date' => $request->date,
            'time' => $request->time,
            'location' => $request->location,
            'gradient' => $request->gradient ?? 'from-blue-500 to-indigo-600',
            'icon' => $request->icon ?? 'book',
            'button_text' => $request->buttonText ?? 'Daftar Sekarang',
            'button_gradient' => $request->buttonGradient ?? 'from-blue-500 to-indigo-600',
            'school_text' => $request->schoolText ?? 'SMKN 4 BOGOR',
            'flyer_image_path' => $flyerImagePath,
            'active' => $request->active ?? true,
            'order' => $request->order ?? 1,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Event berhasil ditambahkan',
            'data' => [
                'id' => $event->id,
                'title' => $event->title,
                'description' => $event->description,
                'category' => $event->category,
                'tags' => $event->tags,
                'date' => $event->date,
                'time' => substr($event->time, 0, 5),
                'location' => $event->location,
                'gradient' => $event->gradient,
                'icon' => $event->icon,
                'buttonText' => $event->button_text,
                'buttonGradient' => $event->button_gradient,
                'schoolText' => $event->school_text,
                'flyerImage' => $event->flyer_image_url,
                'active' => $event->active,
                'order' => $event->order,
            ]
        ], 201);
    }

    /**
     * Display the specified event.
     */
    public function show(string $id)
    {
        $event = RecommendedEvent::find($id);

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Event tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $event->id,
                'title' => $event->title,
                'description' => $event->description,
                'category' => $event->category,
                'tags' => $event->tags,
                'date' => $event->date,
                'time' => substr($event->time, 0, 5),
                'location' => $event->location,
                'gradient' => $event->gradient,
                'icon' => $event->icon,
                'buttonText' => $event->button_text,
                'buttonGradient' => $event->button_gradient,
                'schoolText' => $event->school_text,
                'flyerImage' => $event->flyer_image_url,
                'active' => $event->active,
                'order' => $event->order,
            ]
        ]);
    }

    /**
     * Update the specified event.
     */
    public function update(Request $request, string $id)
    {
        $event = RecommendedEvent::find($id);

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Event tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'category' => 'sometimes|required|string|max:100',
            'tags' => 'nullable|array',
            'date' => 'sometimes|required|date',
            'time' => 'sometimes|required',
            'location' => 'sometimes|required|string|max:255',
            'gradient' => 'nullable|string',
            'icon' => 'nullable|string',
            'buttonText' => 'nullable|string',
            'buttonGradient' => 'nullable|string',
            'schoolText' => 'nullable|string',
            'flyerImage' => 'nullable|file|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'active' => 'nullable|boolean',
            'order' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Update flyer image if new one is uploaded
        if ($request->hasFile('flyerImage')) {
            // Delete old image
            if ($event->flyer_image_path && !filter_var($event->flyer_image_path, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete($event->flyer_image_path);
            }
            
            $flyerImagePath = $request->file('flyerImage')->store('event-flyers', 'public');
            $event->flyer_image_path = $flyerImagePath;
        }

        // Update other fields
        if ($request->has('title')) $event->title = $request->title;
        if ($request->has('description')) $event->description = $request->description;
        if ($request->has('category')) $event->category = $request->category;
        if ($request->has('tags')) $event->tags = $request->tags;
        if ($request->has('date')) $event->date = $request->date;
        if ($request->has('time')) $event->time = $request->time;
        if ($request->has('location')) $event->location = $request->location;
        if ($request->has('gradient')) $event->gradient = $request->gradient;
        if ($request->has('icon')) $event->icon = $request->icon;
        if ($request->has('buttonText')) $event->button_text = $request->buttonText;
        if ($request->has('buttonGradient')) $event->button_gradient = $request->buttonGradient;
        if ($request->has('schoolText')) $event->school_text = $request->schoolText;
        if ($request->has('active')) $event->active = $request->active;
        if ($request->has('order')) $event->order = $request->order;

        $event->save();

        return response()->json([
            'success' => true,
            'message' => 'Event berhasil diupdate',
            'data' => [
                'id' => $event->id,
                'title' => $event->title,
                'description' => $event->description,
                'category' => $event->category,
                'tags' => $event->tags,
                'date' => $event->date,
                'time' => substr($event->time, 0, 5),
                'location' => $event->location,
                'gradient' => $event->gradient,
                'icon' => $event->icon,
                'buttonText' => $event->button_text,
                'buttonGradient' => $event->button_gradient,
                'schoolText' => $event->school_text,
                'flyerImage' => $event->flyer_image_url,
                'active' => $event->active,
                'order' => $event->order,
            ]
        ]);
    }

    /**
     * Remove the specified event.
     */
    public function destroy(string $id)
    {
        $event = RecommendedEvent::find($id);

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Event tidak ditemukan'
            ], 404);
        }

        // Delete flyer image file
        if ($event->flyer_image_path && !filter_var($event->flyer_image_path, FILTER_VALIDATE_URL)) {
            Storage::disk('public')->delete($event->flyer_image_path);
        }

        $event->delete();

        return response()->json([
            'success' => true,
            'message' => 'Event berhasil dihapus'
        ]);
    }

    /**
     * Toggle event active status
     */
    public function toggleActive(string $id)
    {
        $event = RecommendedEvent::find($id);

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Event tidak ditemukan'
            ], 404);
        }

        $event->active = !$event->active;
        $event->save();

        return response()->json([
            'success' => true,
            'message' => 'Status event berhasil diubah',
            'data' => [
                'id' => $event->id,
                'active' => $event->active
            ]
        ]);
    }
}
