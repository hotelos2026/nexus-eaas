<?php

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
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
 */
Route::get('/sectors', function (ModuleDiscoveryService $discovery) {
    $modules = $discovery->getAllAvailableModules(); 
    
    $sectors = collect($modules)
        ->pluck('category')
        ->unique()
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
        
        /**
         * INFO UTILISATEUR & CONTEXTE
         */
        Route::get('/user', function (Request $request) {
            return response()->json([
                'user'    => $request->user(),
                'tenant'  => $request->header('X-Tenant'),
                'context' => $request->attributes->get('tenant_info')
            ]);
        });

        Route::post('/logout', [AuthController::class, 'logout']);

        /**
         * NEXUS APP STORE (AUTOMATISÉ & SÉCURISÉ)
         */
        Route::get('/nexus/modules', function (ModuleDiscoveryService $discovery) {
            $tenant = request()->attributes->get('tenant_info');
            
            // Récupère les modules du secteur
            $availableModules = $discovery->getAllAvailableModules($tenant->sector);

            // Récupère les IDs souscrits dans la table 'subscriptions'
            $subscribedIds = DB::table('subscriptions')
                ->where('tenant_id', $tenant->id)
                ->pluck('module_id')
                ->toArray();

            // Enrichit la réponse pour le frontend
            $modules = collect($availableModules)->map(function ($mod) use ($subscribedIds) {
                $mod['is_subscribed'] = in_array($mod['id'], $subscribedIds);
                return $mod;
            });

            return response()->json([
                'status'  => 'success',
                'node'    => $tenant->domain,
                'sector'  => $tenant->sector,
                'modules' => $modules
            ]);
        });

        /**
         * ACTION DE SOUSCRIPTION (ACHAT)
         */
        Route::post('/nexus/modules/{id}/subscribe', function ($id, Request $request) {
            $tenant = $request->attributes->get('tenant_info');

            // Sécurité : On évite les doublons
            DB::table('subscriptions')->updateOrInsert(
                [
                    'tenant_id' => $tenant->id, 
                    'module_id' => $id
                ],
                [
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            );

            return response()->json([
                'status' => 'success',
                'message' => "Module $id activé avec succès."
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