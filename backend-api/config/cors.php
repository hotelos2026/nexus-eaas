<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['*'], // Pour la production, vous devriez limiter ceci à l'URL de votre frontend
    'allowed_origins_patterns' => [],
    'allowed_headers' => [
        'Content-Type',
        'X-Requested-With',
        'Authorization',
        'Accept',
        'Origin',
        'X-Tenant', // <-- On autorise explicitement le header du locataire
    ],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true, // <-- Important pour l'authentification avec Sanctum
];
