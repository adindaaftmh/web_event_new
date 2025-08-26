<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\Mail;
use App\Mail\OtpMail;

// Load Laravel application
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Test Email Configuration ===\n\n";

// Test 1: Check mail configuration
echo "1. Checking mail configuration...\n";
$mailConfig = config('mail');
echo "   Mail Driver: " . $mailConfig['default'] . "\n";
echo "   Mail Host: " . $mailConfig['mailers']['smtp']['host'] . "\n";
echo "   Mail Port: " . $mailConfig['mailers']['smtp']['port'] . "\n";
echo "   Mail Encryption: " . $mailConfig['mailers']['smtp']['encryption'] . "\n";
echo "   Mail Username: " . $mailConfig['mailers']['smtp']['username'] . "\n";
echo "   Mail From Address: " . $mailConfig['from']['address'] . "\n";
echo "   Mail From Name: " . $mailConfig['from']['name'] . "\n\n";

// Test 2: Try to send test email
echo "2. Testing email sending...\n";
try {
    $testEmail = 'test@example.com'; // Ganti dengan email Anda
    
    Mail::to($testEmail)->send(new OtpMail(
        '123456', // Test OTP
        $testEmail,
        now()->addMinutes(10)
    ));
    
    echo "   ✅ Email sent successfully!\n";
    echo "   📧 Check your email: $testEmail\n\n";
    
} catch (Exception $e) {
    echo "   ❌ Email sending failed!\n";
    echo "   Error: " . $e->getMessage() . "\n\n";
}

// Test 3: Check if using log driver
if ($mailConfig['default'] === 'log') {
    echo "3. ⚠️  WARNING: Using LOG driver\n";
    echo "   Email will be saved to: storage/logs/laravel.log\n";
    echo "   To send to Gmail, change MAIL_MAILER=smtp in .env file\n\n";
}

echo "=== Test Complete ===\n";
echo "If you want to send to Gmail:\n";
echo "1. Update .env file with Gmail SMTP settings\n";
echo "2. Restart the server\n";
echo "3. Run this test again\n";
