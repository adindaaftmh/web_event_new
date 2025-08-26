<?php

namespace App\Http\Controllers;

use App\Models\OtpCode;
use App\Models\User;
use App\Mail\OtpMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class OtpController extends Controller
{
    /**
     * Generate OTP for registration
     */
    public function generateOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users,email'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Generate OTP
            $otp = OtpCode::createForEmail($request->email);
            
            // Send OTP via email
            Mail::to($request->email)->send(new OtpMail(
                $otp->otp_code,
                $request->email,
                $otp->expires_at
            ));
            
            return response()->json([
                'success' => true,
                'message' => 'OTP berhasil dikirim ke email Anda',
                'data' => [
                    'email' => $request->email,
                    'expires_at' => $otp->expires_at->format('Y-m-d H:i:s')
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim OTP: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify OTP and register user
     */
    public function verifyOtpAndRegister(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users,email',
            'otp_code' => 'required|string|size:6',
            'name' => 'required|string|max:255',
            'password' => ['required', 'confirmed', Password::defaults()],
            'password_confirmation' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Find and validate OTP
            $otp = OtpCode::where('email', $request->email)
                         ->where('otp_code', $request->otp_code)
                         ->where('is_used', false)
                         ->first();

            if (!$otp) {
                return response()->json([
                    'success' => false,
                    'message' => 'OTP tidak valid atau sudah digunakan'
                ], 400);
            }

            if ($otp->isExpired()) {
                return response()->json([
                    'success' => false,
                    'message' => 'OTP sudah kadaluarsa'
                ], 400);
            }

            // Create user
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            // Mark OTP as used
            $otp->markAsUsed();

            // Generate token
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Registrasi berhasil',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'created_at' => $user->created_at
                    ],
                    'token' => $token
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal melakukan registrasi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Resend OTP
     */
    public function resendOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users,email'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Generate new OTP
            $otp = OtpCode::createForEmail($request->email);
            
            // Send new OTP via email
            Mail::to($request->email)->send(new OtpMail(
                $otp->otp_code,
                $request->email,
                $otp->expires_at
            ));
            
            return response()->json([
                'success' => true,
                'message' => 'OTP baru berhasil dikirim',
                'data' => [
                    'email' => $request->email,
                    'expires_at' => $otp->expires_at->format('Y-m-d H:i:s')
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim OTP: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
