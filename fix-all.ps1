# Ultimate Fix Script for Event App
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Event App - Complete Fix Script" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clear Backend Caches
Write-Host "[1/6] Clearing Laravel caches..." -ForegroundColor Yellow
Set-Location "backend"
php artisan config:clear | Out-Null
php artisan cache:clear | Out-Null
php artisan view:clear | Out-Null
php artisan route:clear | Out-Null
Write-Host "✅ Laravel caches cleared" -ForegroundColor Green
Write-Host ""

# Step 2: Verify .env configuration
Write-Host "[2/6] Checking .env configuration..." -ForegroundColor Yellow
$envContent = Get-Content ".env"
$mailMailer = $envContent | Select-String "^MAIL_MAILER="
$queueConn = $envContent | Select-String "^QUEUE_CONNECTION="

Write-Host "  $mailMailer" -ForegroundColor White
if ($mailMailer -notmatch "MAIL_MAILER=smtp") {
    Write-Host "  ⚠️  WARNING: MAIL_MAILER should be 'smtp'" -ForegroundColor Red
} else {
    Write-Host "  ✅ MAIL_MAILER is correct" -ForegroundColor Green
}

Write-Host "  $queueConn" -ForegroundColor White
if ($queueConn -match "QUEUE_CONNECTION=sync") {
    Write-Host "  ✅ QUEUE_CONNECTION is correct" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  WARNING: QUEUE_CONNECTION should be 'sync'" -ForegroundColor Red
}
Write-Host ""

# Step 3: Test Mail Configuration
Write-Host "[3/6] Testing mail configuration..." -ForegroundColor Yellow
php artisan tinker --execute="dump(config('mail.mailers.smtp.transport')); exit;"
Write-Host ""

# Step 4: Clear Frontend Cache
Write-Host "[4/6] Clearing frontend Vite cache..." -ForegroundColor Yellow
Set-Location "..\frontend"
if (Test-Path "node_modules\.vite") {
    Remove-Item -Recurse -Force "node_modules\.vite"
    Write-Host "✅ Vite cache cleared" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No Vite cache to clear" -ForegroundColor Gray
}
Write-Host ""

# Step 5: Verify Ocean Image
Write-Host "[5/6] Checking ocean.jpg..." -ForegroundColor Yellow
$oceanExists = Test-Path "public\assets\ocean.jpg"
if ($oceanExists) {
    Write-Host "✅ ocean.jpg exists in public/assets/" -ForegroundColor Green
} else {
    Write-Host "⚠️  ocean.jpg NOT found in public/assets/" -ForegroundColor Red
    Write-Host "  Copying from src/assets..." -ForegroundColor Yellow
    if (Test-Path "src\assets\ocean.jpg") {
        New-Item -Path "public\assets" -ItemType Directory -Force | Out-Null
        Copy-Item "src\assets\ocean.jpg" "public\assets\ocean.jpg"
        Write-Host "✅ ocean.jpg copied" -ForegroundColor Green
    } else {
        Write-Host "❌ ocean.jpg not found in src/assets/ either!" -ForegroundColor Red
    }
}
Write-Host ""

# Step 6: Instructions
Write-Host "[6/6] Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  MANUAL STEPS REQUIRED:" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. RESTART Laravel Server:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   php artisan serve" -ForegroundColor Gray
Write-Host ""
Write-Host "2. RESTART Vite Dev Server:" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. CLEAR Browser Cache:" -ForegroundColor White
Write-Host "   - Close ALL browser tabs" -ForegroundColor Gray
Write-Host "   - Ctrl + Shift + Delete" -ForegroundColor Gray
Write-Host "   - Clear ALL data" -ForegroundColor Gray
Write-Host "   - Restart browser" -ForegroundColor Gray
Write-Host ""
Write-Host "4. OPEN and TEST:" -ForegroundColor White
Write-Host "   http://localhost:5173/register" -ForegroundColor Gray
Write-Host "   - Hard refresh: Ctrl + Shift + R (5x)" -ForegroundColor Gray
Write-Host ""
Write-Host "5. TEST Email:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   php test-email.php" -ForegroundColor Gray
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location -Path '..'
