<?php

return [

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    // Xendit 
    'xendit' => [
        'secret_key' => env('XENDIT_SECRET_KEY'),
        'public_key' => env('XENDIT_PUBLIC_KEY'),
        'is_production' => env('XENDIT_IS_PRODUCTION', false),
        'webhook_token' => env('XENDIT_WEBHOOK_TOKEN'),
    ],

];
