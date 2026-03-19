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
         * NEXUS APP STORE : LISTE DES MODULES AVEC ÉTAT D'ABONNEMENT
         */
        Route::get('/nexus/modules', function (ModuleDiscoveryService $discovery) {
            $tenant = request()->attributes->get('tenant_info');
            
            // Récupère les modules du secteur
            $availableModules = $discovery->getAllAvailableModules($tenant->sector);

            // Récupère les IDs souscrits pour ce tenant spécifique (via ID numérique bigint)
            $subscribedIds = DB::table('subscriptions')
                ->where('tenant_id', $tenant->id)
                ->pluck('module_id')
                ->toArray();

            // Enrichit la réponse pour que le frontend sache quoi afficher
            $modules = collect($availableModules)->map(function ($mod) use ($subscribedIds) {
                // On compare le slug du module avec la liste des abonnements
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
         * ACTION DE SOUSCRIPTION GROUPÉE (PANIER / CHECKOUT)
         * Ajout pour le bouton "Confirmer l'abonnement" du Frontend
         */
        Route::post('/nexus/modules/bulk-subscribe', function (Request $request) {
            $tenant = $request->attributes->get('tenant_info');
            $moduleIds = $request->input('module_ids', []); // Tableau de slugs ex: ['crm-01', 'stock-02']

            if (empty($moduleIds)) {
                return response()->json(['status' => 'error', 'message' => 'Panier vide'], 400);
            }

            try {
                DB::beginTransaction();
                
                foreach ($moduleIds as $id) {
                    DB::table('subscriptions')->updateOrInsert(
                        [
                            'tenant_id' => $tenant->id, // BigInt du tenant
                            'module_id' => $id          // Slug du module
                        ],
                        [
                            'status'     => 'active',
                            'created_at' => now(),
                            'updated_at' => now()
                        ]
                    );
                }

                DB::commit();

                return response()->json([
                    'status' => 'success',
                    'message' => count($moduleIds) . " module(s) activé(s) avec succès."
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json([
                    'status' => 'error',
                    'message' => 'Erreur lors de la souscription',
                    'error' => $e->getMessage()
                ], 500);
            }
        });

        /**
         * SOUSCRIPTION INDIVIDUELLE (ANCIENNE MÉTHODE)
         */
        Route::post('/nexus/modules/{id}/subscribe', function ($id, Request $request) {
            $tenant = $request->attributes->get('tenant_info');

            DB::table('subscriptions')->updateOrInsert(
                ['tenant_id' => $tenant->id, 'module_id' => $id],
                ['status' => 'active', 'updated_at' => now()]
            );

            return response()->json([
                'status' => 'success',
                'message' => "Module $id activé."
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