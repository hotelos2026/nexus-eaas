<?php

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
// On protège la route avec le middleware qu'on a créé
Route::middleware(['tenant'])->group(function () {

    Route::get('/test-ai', function () {
        $url = env('AI_SERVICE_URL');
        
        // On récupère les infos du tenant actuel (configurées par le middleware)
        $currentTenant = config('database.connections.tenant.search_path');
        
        try {
            // On peut envoyer le nom du schéma à l'IA pour qu'elle sache 
            // pour quel client elle travaille (optionnel mais puissant)
            $response = Http::withHeaders([
                'X-Instance-Context' => $currentTenant
            ])->get($url . '/');

            return [
                'status' => 'Connexion réussie !',
                'instance' => $currentTenant, // On confirme qu'on est dans le bon schéma
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

// Cette route est publique (pas besoin de token pour s'inscrire)
Route::post('/register', [AuthController::class, 'register']);