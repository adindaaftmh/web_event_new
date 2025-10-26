<?php

// Test update profile dengan file yang lebih besar
$url = 'http://localhost:8000/api/update-profile';

// Login dulu untuk dapat token
$loginUrl = 'http://localhost:8000/api/login';
$loginData = [
    'email' => 'test@example.com',
    'password' => 'password123'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $loginUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($loginData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$loginResponse = curl_exec($ch);
curl_close($ch);

$loginData = json_decode($loginResponse, true);
if (!$loginData || !$loginData['success']) {
    echo "Login failed!\n";
    exit;
}

$token = $loginData['data']['token'];
echo "✓ Login successful\n";

// Buat file dummy yang lebih besar (sekitar 5MB)
$testImagePath = 'large_test_image.jpg';
$largeImageData = str_repeat('A', 5 * 1024 * 1024); // 5MB data
file_put_contents($testImagePath, $largeImageData);

echo "Created test file: " . round(filesize($testImagePath) / 1024 / 1024, 2) . " MB\n";

// Test update profile dengan file besar
$postFields = [
    'nama_lengkap' => 'Test User Large File',
    'no_handphone' => '081234567890',
    'alamat' => 'Jakarta, Indonesia',
    'pendidikan_terakhir' => 'SMA/SMK',
    'profile_image' => new CURLFile($testImagePath, 'image/jpeg', 'large_test.jpg')
];

$ch2 = curl_init();
curl_setopt($ch2, CURLOPT_URL, $url);
curl_setopt($ch2, CURLOPT_POST, true);
curl_setopt($ch2, CURLOPT_POSTFIELDS, $postFields);
curl_setopt($ch2, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'Accept: application/json'
]);
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch2, CURLOPT_TIMEOUT, 60); // Increase timeout for large file

$updateResponse = curl_exec($ch2);
$updateHttpCode = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
curl_close($ch2);

echo "\nUpdate Profile with Large File Test\n";
echo "HTTP Code: $updateHttpCode\n";
echo "Response: $updateResponse\n";

if ($updateHttpCode === 200) {
    echo "✓ Large file upload successful!\n";
    $responseData = json_decode($updateResponse, true);
    if ($responseData && $responseData['profile_image_url']) {
        echo "Profile image URL: " . $responseData['profile_image_url'] . "\n";
    }
} else {
    echo "✗ Large file upload failed!\n";
    $responseData = json_decode($updateResponse, true);
    if ($responseData && isset($responseData['errors'])) {
        echo "Validation errors:\n";
        foreach ($responseData['errors'] as $field => $errors) {
            echo "- $field: " . implode(', ', $errors) . "\n";
        }
    }
}

// Cleanup
unlink($testImagePath);

// Test dengan file yang terlalu besar (15MB - should fail)
echo "\n" . str_repeat("=", 50) . "\n";
echo "Testing file that exceeds 10MB limit...\n";

$oversizeImagePath = 'oversize_test_image.jpg';
$oversizeImageData = str_repeat('B', 15 * 1024 * 1024); // 15MB data
file_put_contents($oversizeImagePath, $oversizeImageData);

echo "Created oversize test file: " . round(filesize($oversizeImagePath) / 1024 / 1024, 2) . " MB\n";

$postFields2 = [
    'nama_lengkap' => 'Test User Oversize File',
    'profile_image' => new CURLFile($oversizeImagePath, 'image/jpeg', 'oversize_test.jpg')
];

$ch3 = curl_init();
curl_setopt($ch3, CURLOPT_URL, $url);
curl_setopt($ch3, CURLOPT_POST, true);
curl_setopt($ch3, CURLOPT_POSTFIELDS, $postFields2);
curl_setopt($ch3, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'Accept: application/json'
]);
curl_setopt($ch3, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch3, CURLOPT_TIMEOUT, 60);

$updateResponse2 = curl_exec($ch3);
$updateHttpCode2 = curl_getinfo($ch3, CURLINFO_HTTP_CODE);
curl_close($ch3);

echo "\nOversize File Test (should fail)\n";
echo "HTTP Code: $updateHttpCode2\n";
echo "Response: $updateResponse2\n";

if ($updateHttpCode2 === 422) {
    echo "✓ Validation correctly rejected oversize file!\n";
} else {
    echo "✗ Unexpected response for oversize file\n";
}

// Cleanup
unlink($oversizeImagePath);
