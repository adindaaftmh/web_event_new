<?php

// Test update profile dengan file upload
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

// Buat file dummy untuk test upload
$testImagePath = 'test_image.jpg';
$imageData = base64_decode('/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=');
file_put_contents($testImagePath, $imageData);

// Test update profile dengan file
$postFields = [
    'nama_lengkap' => 'Test User With Photo',
    'no_handphone' => '081234567890',
    'alamat' => 'Jakarta Pusat, Indonesia',
    'pendidikan_terakhir' => 'Diploma/Sarjana',
    'profile_image' => new CURLFile($testImagePath, 'image/jpeg', 'test.jpg')
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

$updateResponse = curl_exec($ch2);
$updateHttpCode = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
curl_close($ch2);

echo "\nUpdate Profile with File Upload Test\n";
echo "HTTP Code: $updateHttpCode\n";
echo "Response: $updateResponse\n";

if ($updateHttpCode === 200) {
    echo "✓ Profile update with file upload successful!\n";
    $responseData = json_decode($updateResponse, true);
    if ($responseData && $responseData['profile_image_url']) {
        echo "Profile image URL: " . $responseData['profile_image_url'] . "\n";
    }
} else {
    echo "✗ Profile update failed!\n";
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
