<?php

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TenantController;

/*
|--------------------------------------------------------------------------
| 1. ROUTES GLOBALES (NEXUS CORE)
|--------------------------------------------------------------------------
| Ces routes ne dépendent pas d'un schéma spécifique. Elles servent à 
| l'administration centrale et à l'aiguillage initial.
*/
Route::prefix('tenants')->group(function () {
    // Création d'une nouvelle instance (Provisioning)
    Route::post('/provision', [TenantController::class, 'provision']);
    
    // Vérification d'existence (utilisé par le Front pour valider le slug)
    Route::get('/check/{slug}', [TenantController::class, 'exists']);
});


/*
|--------------------------------------------------------------------------
| 2. ROUTES MULTI-TENANT (ISOLÉES PAR SCHÉMA)
|--------------------------------------------------------------------------
| Toutes ces routes passent par le middleware 'tenant' qui bascule 
| dynamiquement la connexion DB vers le schéma de l'école.
*/
Route::middleware(['tenant'])->group(function () {

    /**
     * A. ACCÈS PUBLIC À L'INSTANCE
     * Portails de connexion spécifiques à l'école.
     */
    Route::post('/login', [AuthController::class, 'login']);


    /**
     * B. ACCÈS PROTÉGÉ (AUTH:SANCTUM)
     * L'utilisateur doit être authentifié DANS son schéma d'école.
     */
    Route::middleware(['auth:sanctum'])->group(function () {
        
        // Profil de l'utilisateur connecté
        Route::get('/user', function (\Illuminate\Http\Request $request) {
            return response()->json([
                'user' => $request->user(),
                'tenant' => $request->input('tenant') // Injecté par IdentifyTenant
            ]);
        });

        // Déconnexion (Révocation du token Sanctum)
        Route::post('/logout', [AuthController::class, 'logout']);

        /**
         * AI NEXUS LINK SERVICE
         * Route de communication avec le micro-service IA.
         */
        Route::get('/test-ai', function () {
            $url = env('AI_SERVICE_URL', 'http://localhost:5000');
            // Récupération du schéma actif pour le contexte IA
            $currentSchema = config('database.connections.tenant.search_path');
            
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
                    'error'  => $e->getMessage(),
                    'hint'   => 'Check if the AI micro-service is running on ' . $url
                ], 503);
            }
        });

        /*
        |------------------------------------------------------------------
        | AJOUTE TES ROUTES DE MODULES ICI (Scolarité, Finance, etc.)
        |------------------------------------------------------------------
        */
        // Route::get('/students', [StudentController::class, 'index']);
        // Route::post('/modules/activate', [ModuleController::class, 'activate']);

    });
});