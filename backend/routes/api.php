<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\KategoriKegiatanController;
use App\Http\Controllers\KegiatanController;
use App\Http\Controllers\DaftarHadirController;
use App\Http\Controllers\OtpController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you may register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// OTP and Authentication Routes
Route::post('otp/generate', [OtpController::class, 'generateOtp']);
Route::post('otp/verify-register', [OtpController::class, 'verifyOtpAndRegister']);
Route::post('otp/resend', [OtpController::class, 'resendOtp']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
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
