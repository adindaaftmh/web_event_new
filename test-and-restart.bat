@echo off
echo ================================================
echo   Complete Test: Tampilan dan Email
echo ================================================
echo.

echo [1/5] Testing email configuration...
cd backend
php test-email.php
echo.

echo [2/5] Clearing Laravel caches...
php artisan config:clear
php artisan cache:clear
php artisan view:clear
echo.

echo [3/5] Checking .env configuration...
echo MAIL_MAILER:
findstr "MAIL_MAILER" .env
echo MAIL_HOST:
findstr "MAIL_HOST" .env
echo MAIL_PORT:
findstr "MAIL_PORT" .env
echo MAIL_USERNAME:
findstr "MAIL_USERNAME" .env
echo QUEUE_CONNECTION:
findstr "QUEUE_CONNECTION" .env
echo.

echo [4/5] Frontend: Clearing node_modules cache...
cd ..\frontend
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo Vite cache cleared.
)
echo.

echo [5/5] Instructions:
echo.
echo ================================================
echo   NEXT STEPS:
echo ================================================
echo.
echo 1. Close ALL browser windows
echo 2. Start Laravel server:
echo    cd backend
echo    php artisan serve
echo.
echo 3. In NEW terminal, start Vite:
echo    cd frontend
echo    npm run dev
echo.
echo 4. Open browser and visit:
echo    http://localhost:5173/register
echo.
echo 5. Press Ctrl + Shift + R to hard refresh
echo.
echo 6. Test registration flow
echo.
echo ================================================
echo.
pause
