<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use App\Mail\ReplyContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class ContactMessageController extends Controller
{
    /**
     * Get all contact messages (Admin only)
     */
    public function index(Request $request)
    {
        try {
            $messages = ContactMessage::orderBy('created_at', 'desc')->get();
            
            return response()->json([
                'success' => true,
                'data' => $messages
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil pesan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a new contact message
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'subject' => 'required|string|max:255',
            'message' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $contactMessage = ContactMessage::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Pesan berhasil dikirim',
                'data' => $contactMessage
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim pesan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark message as read
     */
    public function markAsRead($id)
    {
        try {
            $message = ContactMessage::findOrFail($id);
            $message->update(['is_read' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Pesan ditandai sudah dibaca',
                'data' => $message
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal update status pesan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a contact message
     */
    public function destroy($id)
    {
        try {
            $message = ContactMessage::findOrFail($id);
            $message->delete();

            return response()->json([
                'success' => true,
                'message' => 'Pesan berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus pesan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send email reply to contact message
     */
    public function sendReply(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'reply_message' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $message = ContactMessage::findOrFail($id);
            
            Log::info('Attempting to send email to: ' . $message->email);
            
            // Generate email template and send via Brevo
            $htmlContent = \App\Services\BrevoService::generateReplyContactTemplate(
                $message->name,
                $request->reply_message,
                [
                    'subject' => $message->subject,
                    'message' => $message->message,
                    'date' => $message->created_at->format('d F Y, H:i')
                ]
            );
            
            \App\Services\BrevoService::sendEmail(
                $message->email,
                'Re: ' . $message->subject,
                $htmlContent
            );

            Log::info('Email sent successfully via Brevo');

            // Mark as read after replying
            $message->update(['is_read' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Email berhasil dikirim'
            ]);
        } catch (\Exception $e) {
            Log::error('Email sending failed: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim email',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }
}