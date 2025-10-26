<?php

namespace App\Http\Controllers;

use App\Models\Testimonial;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TestimonialController extends Controller
{
    /**
     * Display a listing of testimonials for API
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = $request->get('per_page', 20);
            $approved = $request->get('approved', true);

            $query = Testimonial::with(['user', 'event'])
                ->when($approved, function ($query) {
                    return $query->where('is_approved', true);
                })
                ->latest()
                ->paginate($perPage);

            return response()->json([
                'success' => true,
                'message' => 'Testimonials retrieved successfully',
                'data' => $query->items(),
                'pagination' => [
                    'current_page' => $query->currentPage(),
                    'per_page' => $query->perPage(),
                    'total' => $query->total(),
                    'last_page' => $query->lastPage(),
                    'from' => $query->firstItem(),
                    'to' => $query->lastItem(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve testimonials',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created testimonial
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'event_id' => 'required|exists:kegiatan,id',
            'testimonial' => 'required|string|max:1000',
            'rating' => 'required|integer|min:1|max:5',
            'event_category' => 'required|string|max:100'
        ]);

        try {
            $testimonial = Testimonial::create([
                'user_id' => auth()->id(),
                'event_id' => $validated['event_id'],
                'testimonial' => $validated['testimonial'],
                'rating' => $validated['rating'],
                'event_category' => $validated['event_category'],
                'is_approved' => false, // Require admin approval
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Testimonial submitted successfully and pending approval',
                'data' => $testimonial->load(['user', 'event'])
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit testimonial',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified testimonial
     */
    public function show(Testimonial $testimonial): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => $testimonial->load(['user', 'event'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve testimonial',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified testimonial (admin only)
     */
    public function update(Request $request, Testimonial $testimonial): JsonResponse
    {
        $validated = $request->validate([
            'testimonial' => 'sometimes|required|string|max:1000',
            'rating' => 'sometimes|required|integer|min:1|max:5',
            'event_category' => 'sometimes|required|string|max:100',
            'is_approved' => 'sometimes|boolean'
        ]);

        try {
            $testimonial->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Testimonial updated successfully',
                'data' => $testimonial->load(['user', 'event'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update testimonial',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified testimonial (admin only)
     */
    public function destroy(Testimonial $testimonial): JsonResponse
    {
        try {
            $testimonial->delete();

            return response()->json([
                'success' => true,
                'message' => 'Testimonial deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete testimonial',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approve testimonial (admin only)
     */
    public function approve(Testimonial $testimonial): JsonResponse
    {
        try {
            $testimonial->update(['is_approved' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Testimonial approved successfully',
                'data' => $testimonial->load(['user', 'event'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve testimonial',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject testimonial (admin only)
     */
    public function reject(Testimonial $testimonial): JsonResponse
    {
        try {
            $testimonial->update(['is_approved' => false]);

            return response()->json([
                'success' => true,
                'message' => 'Testimonial rejected successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject testimonial',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
