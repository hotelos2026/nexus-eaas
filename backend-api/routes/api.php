<?php

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TenantController;
use App\Services\ModuleDiscoveryService;
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| 1. ROUTES GLOBALES (NEXUS CORE - REGISTRE CENTRAL)
|--------------------------------------------------------------------------
| Ces routes opèrent sur le schéma 'public'. Elles permettent la découverte
| et la création d'instances. Elles ne nécessitent pas de header X-Tenant.
*/

// Inscription & Provisioning (Création physique de l'instance et du schéma)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/tenants/provision', [TenantController::class, 'provision']);

// Nexus Finder : Vérifier si un nom d'instance est déjà pris
Route::get('/check-tenant/{name}', [TenantController::class, 'exists']);

/**
 * DÉCOUVERTE DYNAMIQUE DES MÉTIERS
 * Utilisée par le Nexus Finder pour afficher les secteurs disponibles 
 * basés sur les dossiers présents dans /Modules à la racine.
 */
Route::get('/sectors', function (ModuleDiscoveryService $discovery) {
    // Scan réel du disque dur
    $modules = $discovery->getAllAvailableModules(); 
    
    // Extraction des catégories (secteurs) uniques
    $sectors = collect($modules)->pluck('category')->unique()->values();
    
    return response()->json($sectors);
});

/*
|--------------------------------------------------------------------------
| 2. ROUTES MULTI-TENANT (INSTANCES ISOLÉES)
|--------------------------------------------------------------------------
| Toutes ces routes passent par le middleware 'tenant' qui bascule 
| la connexion DB vers le schéma privé via le header 'X-Tenant'.
*/
Route::middleware(['tenant'])->group(function () {

    /**
     * A. AUTHENTIFICATION À L'INSTANCE
     */
    Route::post('/login', [AuthController::class, 'login']);

    /**
     * B. ACCÈS PROTÉGÉ (AUTH:SANCTUM)
     * L'utilisateur doit être authentifié au sein de son instance.
     */
    Route::middleware(['auth:sanctum'])->group(function () {
        
        // Récupération de l'identité et du contexte de l'instance
        Route::get('/user', function (Request $request) {
            return response()->json([
                'user'    => $request->user(),
                'tenant'  => $request->header('X-Tenant'),
                'context' => $request->attributes->get('tenant_info') // Infos venant du middleware
            ]);
        });

        // Déconnexion de l'instance
        Route::post('/logout', [AuthController::class, 'logout']);

        /**
         * C. NEXUS APP STORE (MODULARITÉ INTELLIGENTE)
         * Filtre les applications disponibles selon le secteur du client.
         */
        Route::get('/nexus/modules', function (ModuleDiscoveryService $discovery) {
            $tenant = request()->attributes->get('tenant_info');
            
            return response()->json([
                'status'  => 'success',
                'node'    => $tenant->domain,
                'sector'  => $tenant->sector,
                'modules' => $discovery->getAllAvailableModules($tenant->sector)
            ]);
        });

        /**
         * D. AI NEXUS LINK SERVICE
         * Communication avec le micro-service IA (Python/FastAPI)
         */
        Route::get('/test-ai', function () {
            $url = config('services.ai.url', 'https://ai-nexus.up.railway.app');
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
                    'payload'  => $response->successful() ? $response->json() : 'AI service error'
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
        | INJECTION DE ROUTES MODULES
        |------------------------------------------------------------------
        | Tes modules injecteront leurs propres routes ici via leurs 
        | ServiceProviders respectifs.
        */
    });
});