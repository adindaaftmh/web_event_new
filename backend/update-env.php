<?php

echo "=== Update .env Configuration ===\n\n";

// Baca file .env
$envContent = file_get_contents('.env');

// Konfigurasi Gmail SMTP yang baru
$newMailConfig = [
    'MAIL_MAILER=smtp',
    'MAIL_HOST=smtp.gmail.com',
    'MAIL_PORT=587',
    'MAIL_USERNAME=your-email@gmail.com',
    'MAIL_PASSWORD=your-16-digit-app-password',
    'MAIL_ENCRYPTION=tls',
    'MAIL_FROM_ADDRESS="your-email@gmail.com"',
    'MAIL_FROM_NAME="Sistem Manajemen Kegiatan"'
];

// Update konfigurasi email
foreach ($newMailConfig as $config) {
    $key = explode('=', $config)[0];
    $value = explode('=', $config, 2)[1];
    
    // Cari dan ganti konfigurasi yang ada
    $pattern = "/^{$key}=.*$/m";
    if (preg_match($pattern, $envContent)) {
        $envContent = preg_replace($pattern, $config, $envContent);
        echo "✅ Updated: {$key}\n";
    } else {
        // Jika tidak ada, tambahkan di akhir
        $envContent .= "\n{$config}";
        echo "➕ Added: {$key}\n";
    }
}

// Tulis kembali ke file .env
file_put_contents('.env', $envContent);

echo "\n=== Configuration Updated ===\n";
echo "Please update the following values in .env file:\n";
echo "1. MAIL_USERNAME=your-email@gmail.com (replace with your Gmail)\n";
echo "2. MAIL_PASSWORD=your-16-digit-app-password (replace with your App Password)\n";
echo "3. MAIL_FROM_ADDRESS=\"your-email@gmail.com\" (replace with your Gmail)\n\n";

echo "After updating, restart the server:\n";
echo "php artisan serve\n";
