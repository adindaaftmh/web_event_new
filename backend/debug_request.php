<?php

// Debug script untuk melihat apa yang diterima backend
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: *');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$debug_info = [
    'method' => $_SERVER['REQUEST_METHOD'],
    'headers' => getallheaders(),
    'post_data' => $_POST,
    'files' => $_FILES,
    'raw_input' => file_get_contents('php://input'),
    'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'not set'
];

echo json_encode($debug_info, JSON_PRETTY_PRINT);
?>
