<?php

return [
    'secret_key' => env('XENDIT_SECRET_KEY'),
    'public_key' => env('XENDIT_PUBLIC_KEY'),
    'is_production' => env('XENDIT_IS_PRODUCTION', false),
    'webhook_token' => env('XENDIT_WEBHOOK_TOKEN'),
];
