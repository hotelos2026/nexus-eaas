<?php

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| 1. ROUTES GLOBALES (NEXUS CORE)
|--------------------------------------------------------------------------
*/
// Inscription d'un nouveau client (Provisioning automatique)
Route::post('/register', [AuthController::class, 'register']);
Route::get('/check-tenant/{name}', [App\Http\Controllers\TenantController::class, 'exists']);
/*
|--------------------------------------------------------------------------
| 2. ROUTES MULTI-TENANT (MIDDLEWARE 'tenant')
|--------------------------------------------------------------------------
*/
Route::middleware(['tenant'])->group(function () {

    // A. Connexion (Public pour l'instance identifiée par X-Tenant)
    Route::post('/login', [AuthController::class, 'login']);

    // B. Accès Protégé (Authentification Sanctum DANS le schéma)
    Route::middleware(['auth:sanctum'])->group(function () {
        
        // Profil de l'utilisateur
        Route::get('/user', function (\Illuminate\Http\Request $request) {
            return response()->json([
                'user'   => $request->user(),
                'tenant' => $request->header('X-Tenant') // Récupère le nom du tenant
            ]);
        });

        // Déconnexion
        Route::post('/logout', [AuthController::class, 'logout']);

        /**
         * AI NEXUS LINK SERVICE
         */
        Route::get('/test-ai', function () {
            $url = env('AI_SERVICE_URL', 'http://localhost:5000');
            // Récupération du search_path actuel pour le contexte IA
            $currentSchema = config('database.connections.pgsql.search_path');
            
            try {
                $response = Http::timeout(5)
                    ->withHeaders([
                        'X-Instance-Context' => $currentSchema,
                        'Accept' => 'application/json'
                    ])->get($url . '/');

                return response()->json([
                    'status'   => 'Nexus AI Link Active',
                    'instance' => $currentSchema,
                    'payload'  => $response->successful() ? $response->json() : 'AI service returned error'
                ]);

            } catch (\Exception $e) {
                return response()->json([
                    'status' => 'AI Service Offline',
                    'error'  => $e->getMessage()
                ], 503);
            }
        });

        /*
        |------------------------------------------------------------------
        | MODULES FUTURS (Scolarité, Finance, etc.)
        |------------------------------------------------------------------
        */
        // Route::apiResource('students', StudentController::class);
    });
});