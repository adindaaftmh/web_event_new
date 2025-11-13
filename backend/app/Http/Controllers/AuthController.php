<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\OtpCode;
use App\Mail\OtpMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
     * Login user
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = User::where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email atau password salah'
                ], 401);
            }

            if ($user->status_akun !== 'aktif') {
                return response()->json([
                    'success' => false,
                    'message' => 'Akun Anda belum aktif'
                ], 403);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login berhasil',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'nama_lengkap' => $user->nama_lengkap,
                        'email' => $user->email,
                        'no_handphone' => $user->no_handphone,
                        'alamat' => $user->alamat,
                        'pendidikan_terakhir' => $user->pendidikan_terakhir,
                        'role' => $user->role ?? 'user',
                        'status_akun' => $user->status_akun,
                        'profile_image' => $user->profile_image ? url($user->profile_image) : null
                    ],
                    'token' => $token
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Login gagal',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get current authenticated user
     */
    public function getCurrentUser(Request $request)
    {
        try {
            $user = $request->user();
            
            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'nama_lengkap' => $user->nama_lengkap,
                    'email' => $user->email,
                    'no_handphone' => $user->no_handphone,
                    'alamat' => $user->alamat,
                    'pendidikan_terakhir' => $user->pendidikan_terakhir,
                    'profile_image' => $user->profile_image ? url($user->profile_image) : null,
                    'status_akun' => $user->status_akun
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Logout berhasil'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout gagal',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Request password reset OTP
     */
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Email tidak ditemukan atau tidak valid',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Generate OTP
            $otp = OtpCode::createForEmail($request->email);
            
            // Log OTP untuk testing (akan muncul di storage/logs/laravel.log)
            \Log::info('===== FORGOT PASSWORD OTP =====');
            \Log::info('Email: ' . $request->email);
            \Log::info('OTP Code: ' . $otp->otp_code);
            \Log::info('Expires at: ' . $otp->expires_at->format('Y-m-d H:i:s'));
            \Log::info('==============================');
            
            // Generate attractive email template and send OTP for password reset
            try {
                $htmlContent = \App\Services\BrevoService::generateForgotPasswordEmailTemplate(
                    $otp->otp_code,
                    $otp->expires_at->format('H:i:s')
                );
                
                \App\Services\BrevoService::sendEmail(
                    $request->email,
                    'Reset Password - Kode OTP Anda',
                    $htmlContent
                );
                \Log::info('✅ Email OTP reset password berhasil dikirim ke: ' . $request->email);
            } catch (\Exception $mailError) {
                \Log::error('❌ Email sending failed: ' . $mailError->getMessage());
                \Log::warning('OTP logged instead - check laravel.log');
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Kode OTP untuk reset password telah dikirim ke email Anda',
                'data' => [
                    'email' => $request->email,
                    'expires_at' => $otp->expires_at->format('Y-m-d H:i:s'),
                    'otp_code' => env('APP_DEBUG') ? $otp->otp_code : null // Show OTP in debug mode
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Forgot password error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim OTP: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify OTP for password reset
     */
    public function verifyResetOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'otp_code' => 'required|string|size:6'
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

            return response()->json([
                'success' => true,
                'message' => 'OTP valid',
                'data' => [
                    'email' => $request->email
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Verifikasi OTP gagal',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reset password
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'otp_code' => 'required|string|size:6',
            'password' => [
                'required', 
                'confirmed',
                'min:8',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/'
            ],
            'password_confirmation' => 'required'
        ], [
            'password.regex' => 'Password harus mengandung minimal 8 karakter dengan kombinasi huruf besar, huruf kecil, angka, dan karakter spesial',
            'password.min' => 'Password harus minimal 8 karakter',
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

            // Update user password
            $user = User::where('email', $request->email)->first();
            $user->password = Hash::make($request->password);
            $user->save();

            // Mark OTP as used
            $otp->markAsUsed();

            return response()->json([
                'success' => true,
                'message' => 'Password berhasil direset'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Reset password gagal',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request)
    {
        // Log incoming request data for debugging
        \Log::info('Update Profile Request:', [
            'all_data' => $request->all(),
            'files' => $request->allFiles(),
            'headers' => $request->headers->all()
        ]);

        $validator = Validator::make($request->all(), [
            'nama_lengkap' => 'sometimes|string|max:255',
            'no_handphone' => 'sometimes|string|max:20|min:10',
            'alamat' => 'sometimes|string|max:500',
            'pendidikan_terakhir' => 'sometimes|string|in:SD/MI,SMP/MTS,SMA/SMK,Diploma/Sarjana,Lainnya',
            'profile_image' => 'sometimes|image|mimes:jpeg,png,jpg,gif,webp|max:10240'
        ]);

        if ($validator->fails()) {
            \Log::error('Profile Update Validation failed:', [
                'errors' => $validator->errors()->toArray(),
                'input_data' => $request->all(),
                'files' => $request->allFiles()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
                'debug_info' => [
                    'received_fields' => array_keys($request->all()),
                    'received_files' => array_keys($request->allFiles()),
                    'validation_rules' => [
                        'nama_lengkap' => 'sometimes|string|max:255',
                        'no_handphone' => 'sometimes|string|max:20|min:10',
                        'alamat' => 'sometimes|string|max:500',
                        'pendidikan_terakhir' => 'sometimes|string|in:SD/MI,SMP/MTS,SMA/SMK,Diploma/Sarjana,Lainnya',
                        'profile_image' => 'sometimes|image|mimes:jpeg,png,jpg,gif,webp|max:10240'
                    ]
                ]
            ], 422);
        }

        try {
            $user = $request->user();

            // Update only provided fields
            if ($request->has('nama_lengkap')) {
                $user->nama_lengkap = $request->nama_lengkap;
            }
            if ($request->has('no_handphone')) {
                $user->no_handphone = $request->no_handphone;
            }
            if ($request->has('alamat')) {
                $user->alamat = $request->alamat;
            }
            if ($request->has('pendidikan_terakhir')) {
                $user->pendidikan_terakhir = $request->pendidikan_terakhir;
            }

            // Handle profile image upload
            $profileImageUrl = null;
            if ($request->hasFile('profile_image')) {
                $image = $request->file('profile_image');
                $imageName = time() . '_' . $user->id . '.' . $image->getClientOriginalExtension();
                
                // Create uploads directory if it doesn't exist
                $uploadPath = public_path('uploads/profiles');
                if (!file_exists($uploadPath)) {
                    mkdir($uploadPath, 0755, true);
                }
                
                // Move the uploaded file
                $image->move($uploadPath, $imageName);
                
                // Delete old profile image if exists
                if ($user->profile_image) {
                    $oldImagePath = public_path($user->profile_image);
                    if (file_exists($oldImagePath)) {
                        unlink($oldImagePath);
                    }
                }
                
                // Update user profile image path
                $profileImageUrl = 'uploads/profiles/' . $imageName;
                $user->profile_image = $profileImageUrl;
            }

            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Profil berhasil diperbarui',
                'data' => [
                    'id' => $user->id,
                    'nama_lengkap' => $user->nama_lengkap,
                    'email' => $user->email,
                    'no_handphone' => $user->no_handphone,
                    'alamat' => $user->alamat,
                    'pendidikan_terakhir' => $user->pendidikan_terakhir,
                    'profile_image' => $user->profile_image ? url($user->profile_image) : null
                ],
                'profile_image_url' => $user->profile_image ? url($user->profile_image) : null
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Update profil gagal',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete user account
     */
    public function deleteAccount(Request $request)
    {
        try {
            $user = $request->user();
            
            // Delete user's profile image if exists
            if ($user->profile_image) {
                $imagePath = public_path($user->profile_image);
                if (file_exists($imagePath)) {
                    unlink($imagePath);
                }
            }

            // Delete all user tokens (logout from all devices)
            $user->tokens()->delete();

            // Delete user account
            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'Akun berhasil dihapus'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus akun',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Change password for authenticated user
     */
    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6',
            'confirm_password' => 'required|string|same:new_password'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = $request->user();

            // Verify current password
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Password lama tidak sesuai'
                ], 401);
            }

            // Update password
            $user->password = Hash::make($request->new_password);
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Password berhasil diubah'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengubah password',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
