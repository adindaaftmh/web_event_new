@echo off
echo ========================================
echo Setup Admin Account untuk Event App
echo ========================================
echo.

echo [1/3] Running migration untuk menambahkan kolom role...
php artisan migrate --path=database/migrations/2025_10_23_043300_add_role_to_users_table.php

echo.
echo [2/3] Membuat akun admin...
php artisan db:seed --class=AdminSeeder

echo.
echo [3/3] Setup selesai!
echo.
echo ========================================
echo Akun Admin sudah siap!
echo ========================================
echo URL Login: http://localhost:5173/admin/login
echo Email: admin@example.com
echo Password: admin123
echo ========================================
echo.
pause
