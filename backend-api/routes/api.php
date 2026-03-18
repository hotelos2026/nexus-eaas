<?php

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TenantController;
use App\Services\ModuleDiscoveryService;
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| 1. ROUTES GLOBALES (NEXUS CORE)
|--------------------------------------------------------------------------
| Ces routes servent à créer ou identifier les instances dans le registre 
| central (schéma public). Pas besoin de header X-Tenant ici.
*/

// Inscription / Provisioning d'une nouvelle instance
Route::post('/register', [AuthController::class, 'register']);
Route::post('/tenants/provision', [TenantController::class, 'provision']);

// Nexus Finder : Vérifier l'existence d'un node (ex: apple.network)
Route::get('/check-tenant/{name}', [TenantController::class, 'exists']);


// Route pour que le formulaire d'inscription sache quels secteurs existent
Route::get('/sectors', function (App\Services\ModuleDiscoveryService $discovery) {
    $modules = $discovery->getAllAvailableModules(); // On récupère tout
    
    // On extrait uniquement les catégories/secteurs uniques
    $sectors = collect($modules)->pluck('category')->unique()->values();
    
    return response()->json($sectors);
});

/*
|--------------------------------------------------------------------------
| 2. ROUTES MULTI-TENANT (ISOLÉES)
|--------------------------------------------------------------------------
| Le middleware 'tenant' identifie le schéma PostgreSQL privé.
*/
Route::middleware(['tenant'])->group(function () {

    /**
     * A. AUTHENTIFICATION À L'INSTANCE
     */
    Route::post('/login', [AuthController::class, 'login']);

    /**
     * B. ACCÈS PROTÉGÉ (AUTH:SANCTUM)
     */
    Route::middleware(['auth:sanctum'])->group(function () {
        
        // Profil utilisateur & Contexte Instance
        Route::get('/user', function (Request $request) {
            return response()->json([
                'user'   => $request->user(),
                'tenant' => $request->header('X-Tenant'),
                'context'=> $request->attributes->get('tenant_info')
            ]);
        });

        // Déconnexion de l'instance
        Route::post('/logout', [AuthController::class, 'logout']);

        /**
         * C. NEXUS APP STORE (MODULARITÉ INTELLIGENTE)
         * Détecte les dossiers dans /Modules selon le secteur du client.
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
         * Pont vers le micro-service Python/IA
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
        | MODULES MÉTIERS (Injectés dynamiquement par les modules installés)
        |------------------------------------------------------------------
        */
        // Ici viendront les routes spécifiques à SchoolManager, FleetControl, etc.
    });
});