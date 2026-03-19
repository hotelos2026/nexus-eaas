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
| 1. ROUTES GLOBALES (NEXUS CORE)
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
         * NEXUS APP STORE : LA FUSION CRUCIALE (JSON + DB)
         * C'est ici que tes prix (JSON) rencontrent ton statut (DB)
         */
        Route::get('/nexus/modules', function (ModuleDiscoveryService $discovery) {
            $tenant = request()->attributes->get('tenant_info');
            
            // 1. Récupère les modules complets (avec prix/icons) via le Service JSON
            $availableModules = $discovery->getAllAvailableModules($tenant->sector);

            // 2. Vérifie les abonnements dans la table 'modules' du schéma client
            // Correction : On utilise la table 'modules' cohérente avec le TenantController
            $subscribedNames = DB::table('modules')
                ->where('is_subscribed', true)
                ->pluck('name')
                ->toArray();

            // 3. Enrichissement : On injecte 'is_subscribed' dans les données du JSON
            $modules = collect($availableModules)->map(function ($mod) use ($subscribedNames) {
                // On compare le NOM du module (ex: "Inventaire & Stock")
                $mod['is_subscribed'] = in_array($mod['name'], $subscribedNames);
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
         * SOUSCRIPTION GROUPÉE (PANIER)
         */
        Route::post('/nexus/modules/bulk-subscribe', function (Request $request) {
            $tenant = $request->attributes->get('tenant_info');
            $moduleNames = $request->input('module_names', []); // On utilise les noms pour la cohérence

            if (empty($moduleNames)) {
                return response()->json(['status' => 'error', 'message' => 'Panier vide'], 400);
            }

            try {
                DB::beginTransaction();
                
                foreach ($moduleNames as $name) {
                    // Correction : On tape dans la table 'modules' locale
                    DB::table('modules')->updateOrInsert(
                        ['name' => $name],
                        [
                            'is_subscribed' => true,
                            'updated_at' => now()
                        ]
                    );
                }

                DB::commit();
                return response()->json(['status' => 'success', 'message' => "Activation réussie."]);

            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
            }
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
                return response()->json(['status' => 'AI Service Offline', 'error' => $e->getMessage()], 503);
            }
        });
    });
});