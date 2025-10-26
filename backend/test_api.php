<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

echo "Testing User and Profile Update...\n";

try {
    // Test user exists
    $user = User::where('email', 'test@example.com')->first();
    if ($user) {
        echo "✓ User found: " . $user->nama_lengkap . " (ID: " . $user->id . ")\n";
        echo "  Email: " . $user->email . "\n";
        echo "  Phone: " . $user->no_handphone . "\n";
        echo "  Address: " . $user->alamat . "\n";
        echo "  Education: " . $user->pendidikan_terakhir . "\n";
        echo "  Profile Image: " . ($user->profile_image ?? 'None') . "\n";
        
        // Test password
        if (Hash::check('password123', $user->password)) {
            echo "✓ Password verification works\n";
        } else {
            echo "✗ Password verification failed\n";
        }
        
        // Test profile update
        $user->alamat = 'Updated Address Test';
        $user->save();
        echo "✓ Profile update test successful\n";
        
    } else {
        echo "✗ User not found\n";
    }

} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}
?>
