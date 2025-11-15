<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'storage/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'https://web-event-new.vercel.app', // frontend kamu di Vercel
        'https://dynotix.vercel.app', //url baruw
        'http://localhost:5183',
        'http://127.0.0.1:5183',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
