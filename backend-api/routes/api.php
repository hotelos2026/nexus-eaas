<?php

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;

Route::get('/test-ai', function () {
    $url = env('AI_SERVICE_URL');
    
    try {
        $response = Http::get($url . '/');
        return [
            'status' => 'Connexion réussie !',
            'ai_response' => $response->json()
        ];
    } catch (\Exception $e) {
        return [
            'status' => 'Erreur de connexion',
            'error' => $e->getMessage()
        ];
    }
});