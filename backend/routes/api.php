<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\KategoriKegiatanController;
use App\Http\Controllers\KegiatanController;
use App\Http\Controllers\DaftarHadirController;
use App\Http\Controllers\OtpController;
use App\Http\Controllers\AuthController;



// Authentication Routes
Route::post('login', [AuthController::class, 'login']);
Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('verify-reset-otp', [AuthController::class, 'verifyResetOtp']);
Route::post('reset-password', [AuthController::class, 'resetPassword']);

// OTP and Registration Routes
Route::post('otp/generate', [OtpController::class, 'generateOtp']);
Route::post('otp/verify-register', [OtpController::class, 'verifyOtpAndRegister']);
Route::post('otp/resend', [OtpController::class, 'resendOtp']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('logout', [AuthController::class, 'logout']);
});

// Kategori Kegiatan Routes
Route::apiResource('kategori-kegiatan', KategoriKegiatanController::class);

// Kegiatan Routes
Route::apiResource('kegiatan', KegiatanController::class);

// Daftar Hadir Routes
Route::apiResource('daftar-hadir', DaftarHadirController::class);
Route::post('daftar-hadir/absen', [DaftarHadirController::class, 'absen']);

// Additional routes for specific functionality
Route::get('kegiatan-by-kategori/{kategori_id}', [KegiatanController::class, 'getByKategori']);
Route::get('daftar-hadir-by-kegiatan/{kegiatan_id}', [DaftarHadirController::class, 'getByKegiatan']);
Route::get('daftar-hadir-by-user/{user_id}', [DaftarHadirController::class, 'getByUser']);
    