<?php

namespace App\Http\Controllers;

use App\Models\OtpCode;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class OtpController extends Controller
{
    /**
     * Generate OTP for registration
     */
    public function generateOtp(Request $request)
    {
        // Normalize email
        $email = strtolower(trim($request->email));
        
        $validator = Validator::make(['email' => $email], [
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
            $otp = OtpCode::createForEmail($email);
            
            \Log::info('OTP Generated:', ['email' => $email, 'otp_code' => $otp->otp_code]);
            
            // Generate attractive email template and send OTP
            $htmlContent = \App\Services\BrevoService::generateOtpEmailTemplate(
                $otp->otp_code,
                $otp->expires_at->format('H:i:s')
            );
            
            \App\Services\BrevoService::sendEmail(
                $email,
                'Verifikasi Email - Kode OTP Registrasi Anda',
                $htmlContent
            );
            
            return response()->json([
                'success' => true,
                'message' => 'OTP berhasil dikirim ke email Anda',
                'data' => [
                    'email' => $email,
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
        // Normalize email first
        $email = strtolower(trim($request->email));
        
        // Check if email already registered
        $existingUser = User::where('email', $email)->first();
        if ($existingUser) {
            return response()->json([
                'success' => false,
                'message' => 'Email sudah terdaftar. Silakan gunakan email lain atau login.',
                'errors' => ['email' => ['Email sudah terdaftar']]
            ], 422);
        }
        
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'otp_code' => 'required|string|size:6',
            'nama_lengkap' => 'required|string|max:255',
            'no_handphone' => 'required|string|max:15',
            'alamat' => 'required|string',
            'pendidikan_terakhir' => 'required|in:SD/MI,SMP/MTS,SMA/SMK,Diploma/Sarjana,Lainnya',
            'password' => [
                'required', 
                'confirmed',
                'min:8'
            ],
            'password_confirmation' => 'required'
        ], [
            'password.min' => 'Password harus minimal 8 karakter',
            'password.confirmed' => 'Password dan konfirmasi password tidak cocok',
        ]);

        if ($validator->fails()) {
            \Log::warning('Validation failed:', $validator->errors()->toArray());
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Normalize email (trim and lowercase)
            $email = strtolower(trim($request->email));
            $otpCode = trim($request->otp_code);
            
            // Log for debugging
            \Log::info('OTP Verification Attempt:', [
                'email' => $email,
                'otp_code' => $otpCode,
            ]);
            
            // Find and validate OTP
            $otp = OtpCode::where('email', $email)
                         ->where('otp_code', $otpCode)
                         ->where('is_used', false)
                         ->first();

            if (!$otp) {
                // Check if OTP exists but already used
                $usedOtp = OtpCode::where('email', $email)
                                 ->where('otp_code', $otpCode)
                                 ->where('is_used', true)
                                 ->first();
                
                if ($usedOtp) {
                    \Log::warning('OTP already used:', ['email' => $email, 'otp' => $otpCode]);
                    return response()->json([
                        'success' => false,
                        'message' => 'OTP sudah pernah digunakan'
                    ], 400);
                }
                
                // Check if wrong OTP for this email
                $anyOtp = OtpCode::where('email', $email)
                                ->where('is_used', false)
                                ->latest()
                                ->first();
                
                if ($anyOtp) {
                    \Log::warning('Wrong OTP code:', [
                        'email' => $email,
                        'provided_otp' => $otpCode,
                        'correct_otp' => $anyOtp->otp_code
                    ]);
                    return response()->json([
                        'success' => false,
                        'message' => 'Kode OTP salah'
                    ], 400);
                }
                
                \Log::warning('No OTP found for email:', ['email' => $email]);
                return response()->json([
                    'success' => false,
                    'message' => 'OTP tidak ditemukan untuk email ini'
                ], 400);
            }

            if ($otp->isExpired()) {
                return response()->json([
                    'success' => false,
                    'message' => 'OTP sudah kadaluarsa'
                ], 400);
            }

            // Create user with normalized email
            $user = User::create([
                'nama_lengkap' => $request->nama_lengkap,
                'email' => $email, // Use normalized email
                'no_handphone' => $request->no_handphone,
                'alamat' => $request->alamat,
                'pendidikan_terakhir' => $request->pendidikan_terakhir,
                'password' => Hash::make($request->password),
                'status_akun' => 'aktif',
            ]);
            
            \Log::info('User created successfully:', ['email' => $email]);

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
                        'nama_lengkap' => $user->nama_lengkap,
                        'email' => $user->email,
                        'no_handphone' => $user->no_handphone,
                        'created_at' => $user->created_at
                    ],
                    'token' => $token
                ]
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Registration Failed:', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Gagal melakukan registrasi: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Resend OTP
     */
    public function resendOtp(Request $request)
    {
        // Normalize email
        $email = strtolower(trim($request->email));
        
        $validator = Validator::make(['email' => $email], [
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
            $otp = OtpCode::createForEmail($email);
            
            \Log::info('OTP Resent:', ['email' => $email, 'otp_code' => $otp->otp_code]);
            
            // Send new OTP via email
            Mail::to($email)->send(new OtpMail(
                $otp->otp_code,
                $email,
                $otp->expires_at
            ));
            
            return response()->json([
                'success' => true,
                'message' => 'OTP baru berhasil dikirim',
                'data' => [
                    'email' => $email,
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
