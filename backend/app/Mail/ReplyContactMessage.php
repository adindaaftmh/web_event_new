<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReplyContactMessage extends Mailable
{
    use Queueable, SerializesModels;

    public $recipientName;
    public $recipientEmail;
    public $subject;
    public $replyMessage;
    public $originalMessage;

    public function __construct($recipientName, $recipientEmail, $subject, $replyMessage, $originalMessage)
    {
        $this->recipientName = $recipientName;
        $this->recipientEmail = $recipientEmail;
        $this->subject = $subject;
        $this->replyMessage = $replyMessage;
        $this->originalMessage = $originalMessage;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.reply-contact',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
