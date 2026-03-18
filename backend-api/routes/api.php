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
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/tenants/provision', [TenantController::class, 'provision']);
Route::get('/check-tenant/{name}', [TenantController::class, 'exists']);

/**
 * NEXUS FINDER : DÉCOUVERTE DES SECTEURS
 * On filtre 'Shared' pour ne pas le proposer à l'inscription.
 */
Route::get('/sectors', function (ModuleDiscoveryService $discovery) {
    $modules = $discovery->getAllAvailableModules(); 
    
    $sectors = collect($modules)
        ->pluck('category')
        ->unique()
        // Supprime 'Shared' et les noms vides de la liste d'inscription
        ->filter(fn($sector) => !in_array(strtolower($sector), ['shared', 'common', 'core']))
        ->values();
    
    return response()->json($sectors);
});

/*
|--------------------------------------------------------------------------
| 2. ROUTES MULTI-TENANT (INSTANCES ISOLÉES)
|--------------------------------------------------------------------------
*/
Route::middleware(['tenant'])->group(function () {

    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware(['auth:sanctum'])->group(function () {
        
        Route::get('/user', function (Request $request) {
            return response()->json([
                'user'    => $request->user(),
                'tenant'  => $request->header('X-Tenant'),
                'context' => $request->attributes->get('tenant_info')
            ]);
        });

        Route::post('/logout', [AuthController::class, 'logout']);

        /**
         * NEXUS APP STORE
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
         * AI NEXUS LINK
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
    });
});