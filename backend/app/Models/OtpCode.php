<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class OtpCode extends Model
{
    protected $fillable = [
        'email',
        'otp_code',
        'expires_at',
        'is_used'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_used' => 'boolean'
    ];

    /**
     * Check if OTP is expired
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Check if OTP is valid (not expired and not used)
     */
    public function isValid(): bool
    {
        return !$this->isExpired() && !$this->is_used;
    }

    /**
     * Mark OTP as used
     */
    public function markAsUsed(): void
    {
        $this->update(['is_used' => true]);
    }

    /**
     * Generate new OTP code
     */
    public static function generateCode(): string
    {
        return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Create new OTP for email
     */
    public static function createForEmail(string $email): self
    {
        // Delete existing unused OTPs for this email
        self::where('email', $email)
            ->where('is_used', false)
            ->delete();

        return self::create([
            'email' => $email,
            'otp_code' => self::generateCode(),
            'expires_at' => Carbon::now()->addMinutes(5), // OTP valid for 5 minutes
            'is_used' => false
        ]);
    }
}
