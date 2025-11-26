<?php

namespace App\Providers;
 
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\File;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $publicStorage = public_path('storage');

        // Jika sudah ada folder atau linknya, hapus dulu
        if (is_link($publicStorage) || is_dir($publicStorage)) {
            File::deleteDirectory($publicStorage);
        }

        // Buat ulang storage link
        \Illuminate\Support\Facades\Artisan::call('storage:link');
    }
}
