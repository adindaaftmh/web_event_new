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
                        'no_handphone' => $user->no_handphone
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
                'message' => 'Kode OTP untuk reset password telah dikirim ke email Anda',
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
        $validator = Validator::make($request->all(), [
            'nama_lengkap' => 'sometimes|required|string|max:255',
            'no_handphone' => 'sometimes|required|string|max:20',
            'alamat' => 'sometimes|required|string|max:500',
            'pendidikan_terakhir' => 'sometimes|required|string|in:SMA,D3,S1,S2,S3'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
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
                    'pendidikan_terakhir' => $user->pendidikan_terakhir
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Update profil gagal',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
