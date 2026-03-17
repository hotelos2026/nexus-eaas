<?php

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TenantController;

/*
|--------------------------------------------------------------------------
| Routes Publiques (Globales)
|--------------------------------------------------------------------------
*/

// Création d'une nouvelle instance et d'un utilisateur admin
Route::post('/register', [AuthController::class, 'register']);

// Vérification d'existence pour le "Nexus Finder" du Frontend
Route::get('/check-tenant/{name}', [TenantController::class, 'exists']);


/*
|--------------------------------------------------------------------------
| Routes Isolées (Multi-Tenant)
|--------------------------------------------------------------------------
| Le middleware 'tenant' intercepte le header X-Tenant et switch le schéma DB
*/
Route::middleware(['tenant'])->group(function () {

    // Authentification spécifique à l'instance
    Route::post('/login', [AuthController::class, 'login']);

    // Route de test de l'écosystème (DB + IA Service)
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