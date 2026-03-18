<?php

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TenantController;

/*
|--------------------------------------------------------------------------
| 1. ROUTES GLOBALES (NEXUS CORE)
|--------------------------------------------------------------------------
| Ces routes sont accessibles sans header X-Tenant car elles servent à 
| créer ou identifier les instances dans le registre central.
*/

// Inscription / Propulsion d'un nouveau client (EaaS Engine)
// On met les deux pour garantir la compatibilité avec ton Frontend actuel
Route::post('/register', [AuthController::class, 'register']);
Route::post('/tenants/provision', [TenantController::class, 'provision']);

// Nexus Finder : Vérifier si une instance existe
Route::get('/check-tenant/{name}', [TenantController::class, 'exists']);


/*
|--------------------------------------------------------------------------
| 2. ROUTES MULTI-TENANT (ISOLÉES PAR SCHÉMA)
|--------------------------------------------------------------------------
| Le middleware 'tenant' bascule la DB sur le schéma PostgreSQL privé.
*/
Route::middleware(['tenant'])->group(function () {

    /**
     * A. CONNEXION À L'INSTANCE
     */
    Route::post('/login', [AuthController::class, 'login']);

    /**
     * B. ACCÈS PROTÉGÉ (AUTH:SANCTUM)
     */
    Route::middleware(['auth:sanctum'])->group(function () {
        
        // Profil de l'utilisateur (confirmé sur nexus-hq !)
        Route::get('/user', function (\Illuminate\Http\Request $request) {
            return response()->json([
                'user'   => $request->user(),
                'tenant' => $request->header('X-Tenant')
            ]);
        });

        // Déconnexion
        Route::post('/logout', [AuthController::class, 'logout']);

        /**
         * AI NEXUS LINK SERVICE
         * Communication avec le micro-service Python/IA
         */
        Route::get('/test-ai', function () {
            $url = env('AI_SERVICE_URL', 'https://ai-nexus.up.railway.app');
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
        | MODULES MÉTIERS (Futurs développements)
        |------------------------------------------------------------------
        */
        // Route::get('/finance/stats', [FinanceController::class, 'index']);
    });
});