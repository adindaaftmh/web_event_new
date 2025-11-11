<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public $otpCode;
    public $email;
    public $expiresAt;
    public $type;

    /**
     * Create a new message instance.
     */
    public function __construct($otpCode, $email, $expiresAt, $type = 'register')
    {
        $this->otpCode = $otpCode;
        $this->email = $email;
        $this->expiresAt = $expiresAt;
        $this->type = $type; // 'register' or 'forgot_password'
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = $this->type === 'forgot_password' 
            ? 'Kode OTP Reset Password - Dynotix'
            : 'Kode OTP untuk Registrasi - Dynotix';
            
        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.otp',
            with: [
                'otpCode' => $this->otpCode,
                'email' => $this->email,
                'expiresAt' => $this->expiresAt,
                'type' => $this->type,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
