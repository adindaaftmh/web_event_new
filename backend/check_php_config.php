<?php

echo "PHP Upload Configuration Check\n";
echo "==============================\n";

$configs = [
    'upload_max_filesize' => ini_get('upload_max_filesize'),
    'post_max_size' => ini_get('post_max_size'),
    'max_execution_time' => ini_get('max_execution_time'),
    'max_input_time' => ini_get('max_input_time'),
    'memory_limit' => ini_get('memory_limit')
];

foreach ($configs as $key => $value) {
    echo "$key: $value\n";
}

echo "\nRecommended settings for 10MB uploads:\n";
echo "upload_max_filesize = 10M\n";
echo "post_max_size = 12M\n";
echo "max_execution_time = 300\n";
echo "max_input_time = 300\n";
echo "memory_limit = 128M\n";

// Convert to bytes for comparison
function convertToBytes($val) {
    $val = trim($val);
    $last = strtolower($val[strlen($val)-1]);
    $val = (int)$val;
    switch($last) {
        case 'g':
            $val *= 1024;
        case 'm':
            $val *= 1024;
        case 'k':
            $val *= 1024;
    }
    return $val;
}

$uploadMax = convertToBytes(ini_get('upload_max_filesize'));
$postMax = convertToBytes(ini_get('post_max_size'));

echo "\nCurrent limits in bytes:\n";
echo "upload_max_filesize: " . number_format($uploadMax) . " bytes (" . round($uploadMax/1024/1024, 2) . " MB)\n";
echo "post_max_size: " . number_format($postMax) . " bytes (" . round($postMax/1024/1024, 2) . " MB)\n";

if ($uploadMax >= 10485760 && $postMax >= 10485760) {
    echo "\n✅ PHP configuration supports 10MB+ uploads\n";
} else {
    echo "\n❌ PHP configuration needs to be updated for 10MB uploads\n";
    echo "Please update php.ini file\n";
}
?>
