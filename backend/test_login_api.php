<?php

// Test login API endpoint
$url = 'http://localhost:8000/api/login';
$data = [
    'email' => 'test@example.com',
    'password' => 'password123'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Login API Test\n";
echo "URL: $url\n";
echo "HTTP Code: $httpCode\n";
echo "Response: $response\n";

if ($httpCode === 200) {
    $responseData = json_decode($response, true);
    if ($responseData && $responseData['success']) {
        echo "✓ Login successful!\n";
        echo "Token: " . substr($responseData['data']['token'], 0, 20) . "...\n";
        
        // Test get user endpoint with token
        $token = $responseData['data']['token'];
        $userUrl = 'http://localhost:8000/api/user';
        
        $ch2 = curl_init();
        curl_setopt($ch2, CURLOPT_URL, $userUrl);
        curl_setopt($ch2, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $token,
            'Accept: application/json'
        ]);
        curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
        
        $userResponse = curl_exec($ch2);
        $userHttpCode = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
        curl_close($ch2);
        
        echo "\nGet User API Test\n";
        echo "HTTP Code: $userHttpCode\n";
        echo "Response: $userResponse\n";
        
        if ($userHttpCode === 200) {
            echo "✓ Get user successful!\n";
        } else {
            echo "✗ Get user failed!\n";
        }
        
    } else {
        echo "✗ Login failed: " . ($responseData['message'] ?? 'Unknown error') . "\n";
    }
} else {
    echo "✗ HTTP Error: $httpCode\n";
}
