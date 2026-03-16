<?php

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// Routes publiques (sans switch de schéma au départ)
Route::post('/register', [AuthController::class, 'register']);

// Routes nécessitant l'identification du Tenant (via header X-Tenant)
Route::middleware(['tenant'])->group(function () {

    // On déplace le login ici pour que le middleware switch 
    // bien sur la base du client AVANT de chercher l'utilisateur
    Route::post('/login', [AuthController::class, 'login']);

    Route::get('/test-ai', function () {
        $url = env('AI_SERVICE_URL');
        $currentTenant = config('database.connections.tenant.search_path');
        
        try {
            $response = Http::withHeaders([
                'X-Instance-Context' => $currentTenant
            ])->get($url . '/');

            return [
                'status' => 'Connexion réussie !',
                'instance' => $currentTenant,
                'ai_response' => $response->json()
            ];
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'Erreur de connexion au service IA',
                'instance' => $currentTenant,
                'error' => $e->getMessage()
            ], 500);
        }
    });
});