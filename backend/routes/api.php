        <?php

        use Illuminate\Http\Request;
        use Illuminate\Support\Facades\Route;
        use App\Http\Controllers\AuthController;
        use App\Http\Controllers\UserController;
        use App\Http\Controllers\KategoriKegiatanController;
        use App\Http\Controllers\KegiatanController;
        use App\Http\Controllers\DaftarHadirController;
        use App\Http\Controllers\OtpController;
        use App\Http\Controllers\TestimonialController;
        use App\Http\Controllers\FlyerController;
        use App\Http\Controllers\RecommendedEventController;
        use App\Http\Controllers\ContactMessageController;
        use App\Http\Controllers\PaymentController;
        use App\Http\Controllers\ImageUploadController;



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
            Route::get('/user', [AuthController::class, 'getCurrentUser']);
            Route::post('logout', [AuthController::class, 'logout']);
            Route::post('update-profile', [AuthController::class, 'updateProfile']);
            Route::put('change-password', [AuthController::class, 'changePassword']);
            Route::delete('delete-account', [AuthController::class, 'deleteAccount']);
            
            // User Management Routes (Admin only)
            Route::get('users', [UserController::class, 'getAllUsers']);
            Route::get('users/export/excel', [UserController::class, 'exportUsersToExcel']);
            Route::get('users/{id}', [UserController::class, 'getUserDetail']);
            Route::patch('users/{id}/status', [UserController::class, 'updateStatus']);
            Route::post('users/{id}/reset-password', [UserController::class, 'resetPassword']);
        });

        // Kategori Kegiatan Routes
        Route::apiResource('kategori-kegiatan', KategoriKegiatanController::class);

        // Kegiatan Routes
        Route::apiResource('kegiatan', KegiatanController::class);

        // Daftar Hadir Routes
        Route::apiResource('daftar-hadir', DaftarHadirController::class);
        Route::post('daftar-hadir/absen', [DaftarHadirController::class, 'absen']);
        Route::patch('daftar-hadir/{id}/issue-certificate', [DaftarHadirController::class, 'issueCertificate']);
        Route::patch('daftar-hadir/{id}/revoke-certificate', [DaftarHadirController::class, 'revokeCertificate']);

        // Additional routes for specific functionality
        Route::get('kegiatan-by-kategori/{kategori_id}', [KegiatanController::class, 'getByKategori']);
        Route::get('kegiatan-search', [KegiatanController::class, 'search']);
        Route::get('daftar-hadir-by-kegiatan/{kegiatan_id}', [DaftarHadirController::class, 'getByKegiatan']);
        Route::get('daftar-hadir-by-user/{user_id}', [DaftarHadirController::class, 'getByUser']);
        Route::get('daftar-hadir-export/{kegiatan_id}', [DaftarHadirController::class, 'export']);

        // Testimonial Routes (Public - hanya approved testimonials)
        Route::get('testimonials', [TestimonialController::class, 'index']);
        Route::get('testimonials/{testimonial}', [TestimonialController::class, 'show']);

        // Protected Testimonial Routes (Authenticated users)
        Route::middleware('auth:sanctum')->group(function () {
            Route::post('testimonials', [TestimonialController::class, 'store']);
            Route::put('testimonials/{testimonial}', [TestimonialController::class, 'update']);
            Route::delete('testimonials/{testimonial}', [TestimonialController::class, 'destroy']);

            // Admin only routes for approval
            Route::patch('testimonials/{testimonial}/approve', [TestimonialController::class, 'approve']);
            Route::patch('testimonials/{testimonial}/reject', [TestimonialController::class, 'reject']);
        });

        // Flyer Routes (Public - active flyers only)
        Route::get('flyers/active', [FlyerController::class, 'activeFlyers']);

        // Protected Flyer Routes (Admin only)
        Route::middleware('auth:sanctum')->group(function () {
            Route::apiResource('flyers', FlyerController::class);
            Route::patch('flyers/{flyer}/toggle-active', [FlyerController::class, 'toggleActive']);
            Route::post('flyers/update-order', [FlyerController::class, 'updateOrder']);

            // SEMENTARA: migrasi gambar lokal ke Cloudinary
         Route::post('flyers/migrate-images', [FlyerController::class, 'migrateLocalImagesToCloudinary']);
            });

        // Recommended Event Routes (Public - active events only)
        Route::get('recommended-events/active', [RecommendedEventController::class, 'activeEvents']);
        Route::get('recommended-events', [RecommendedEventController::class, 'index']);

        // Protected Recommended Event Routes (Admin only)
        Route::middleware('auth:sanctum')->group(function () {
            Route::post('recommended-events', [RecommendedEventController::class, 'store']);
            Route::get('recommended-events/{id}', [RecommendedEventController::class, 'show']);
            Route::put('recommended-events/{id}', [RecommendedEventController::class, 'update']);
            Route::patch('recommended-events/{id}', [RecommendedEventController::class, 'update']);
            Route::delete('recommended-events/{id}', [RecommendedEventController::class, 'destroy']);
            Route::patch('recommended-events/{id}/toggle-active', [RecommendedEventController::class, 'toggleActive']);
        });
        // Contact Messages
        Route::post('/contact-messages', [ContactMessageController::class, 'store']);
        
        // Test email configuration (for debugging - no auth required)
        Route::get('/test-mail', function() {
            try {
                return response()->json([
                    'success' => true,
                    'mail_config' => [
                        'mailer' => config('mail.default'),
                        'host' => config('mail.mailers.smtp.host'),
                        'port' => config('mail.mailers.smtp.port'),
                        'encryption' => config('mail.mailers.smtp.encryption'),
                        'from' => config('mail.from'),
                        'view_exists' => view()->exists('emails.reply-contact'),
                        'env_check' => [
                            'MAIL_MAILER' => env('MAIL_MAILER'),
                            'MAIL_FROM_ADDRESS' => env('MAIL_FROM_ADDRESS')
                        ]
                    ]
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ], 500);
            }
        });

        Route::middleware('auth:sanctum')->group(function () {
            Route::get('/contact-messages', [ContactMessageController::class, 'index']);
            Route::put('/contact-messages/{id}/read', [ContactMessageController::class, 'markAsRead']);
            Route::post('/contact-messages/{id}/reply', [ContactMessageController::class, 'sendReply']);
            Route::delete('/contact-messages/{id}', [ContactMessageController::class, 'destroy']);
        });

        // Payment Gateway Xendit
        Route::post('create-transaction', [PaymentController::class, 'createTransaction']);
        Route::post('payment/charge-with-token', [PaymentController::class, 'chargeWithToken']); // Direct charge
        Route::post('payment/notification', [PaymentController::class, 'notification']); // webhook

        //ping route
        Route::get('/ping', function () {
            return response()->json(['message' => 'pong']);
        });

        //tambah image dengan cloudinary
        Route::post('/upload-image', [ImageUploadController::class, 'upload']);