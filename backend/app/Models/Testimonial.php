<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Testimonial extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'event_id',
        'testimonial',
        'rating',
        'event_category',
        'is_approved',
    ];

    protected $casts = [
        'is_approved' => 'boolean',
        'rating' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns the testimonial
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the event that the testimonial is for
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'event_id');
    }

    /**
     * Scope for approved testimonials
     */
    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }

    /**
     * Scope for pending testimonials
     */
    public function scopePending($query)
    {
        return $query->where('is_approved', false);
    }

    /**
     * Check if testimonial is expired for approval
     */
    public function isExpired(): bool
    {
        return $this->created_at->addDays(30)->isPast();
    }

    /**
     * Get formatted rating as stars
     */
    public function getStarsAttribute(): string
    {
        return str_repeat('⭐', $this->rating);
    }

    /**
     * Get testimonial excerpt (first 100 characters)
     */
    public function getExcerptAttribute(): string
    {
        return strlen($this->testimonial) > 100
            ? substr($this->testimonial, 0, 100) . '...'
            : $this->testimonial;
    }

    /**
     * Get user's display name (nama_lengkap or fallback)
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->user->nama_lengkap ?? 'Anonymous User';
    }

    /**
     * Get user's role/education for display
     */
    public function getDisplayRoleAttribute(): string
    {
        $education = $this->user->pendidikan_terakhir ?? 'Participant';
        return match($education) {
            'S1' => 'University Student',
            'S2' => 'Graduate Student',
            'S3' => 'PhD Student',
            'D3' => 'Diploma Student',
            default => 'Event Participant'
        };
    }

    /**
     * Get user's avatar URL
     */
    public function getAvatarUrlAttribute(): string
    {
        // Generate avatar based on user's name or use default
        $name = $this->user->nama_lengkap ?? 'User';
        $initials = strtoupper(substr($name, 0, 1));

        // You can replace this with actual avatar URL logic
        return "https://ui-avatars.com/api/?name=" . urlencode($name) . "&background=4A7FA7&color=ffffff&size=128";
    }
}
