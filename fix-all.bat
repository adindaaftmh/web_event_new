@echo off
echo ================================================
echo   Event App - Complete Fix
echo ================================================
echo.

echo [1/4] Clearing Laravel caches...
cd backend
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear
echo.

echo [2/4] Verifying .env configuration...
findstr "^MAIL_MAILER=" .env
findstr "^QUEUE_CONNECTION=" .env
echo.

echo [3/4] Clearing Vite cache...
cd ..\frontend
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo Vite cache cleared.
)
echo.

echo [4/4] Checking ocean.jpg...
if exist "public\assets\ocean.jpg" (
    echo ocean.jpg exists.
) else (
    echo Copying ocean.jpg...
    if not exist "public\assets" mkdir "public\assets"
    copy "src\assets\ocean.jpg" "public\assets\ocean.jpg"
)
echo.

cd ..

echo ================================================
echo   NEXT STEPS:
echo ================================================
echo.
echo 1. RESTART Laravel Server:
echo    cd backend
echo    php artisan serve
echo.
echo 2. RESTART Vite:
echo    cd frontend
echo    npm run dev
echo.
echo 3. CLEAR BROWSER CACHE completely:
echo    - Close ALL tabs
echo    - Ctrl + Shift + Delete
echo    - Clear all time
echo    - Restart browser
echo.
echo 4. OPEN: http://localhost:5173/register
echo    - Hard refresh: Ctrl + Shift + R (5 times)
echo.
echo 5. TEST EMAIL:
echo    cd backend
echo    php test-email.php
echo.
echo ================================================
echo.
pause
