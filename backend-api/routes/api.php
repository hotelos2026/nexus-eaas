<?php

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TenantController;

/*
|--------------------------------------------------------------------------
| Routes Globales (Provisioning)
|--------------------------------------------------------------------------
*/

// Cette route correspond à : backend-nexus.up.railway.app/api/tenants/provision
Route::prefix('tenants')->group(function () {
    Route::post('/provision', [TenantController::class, 'provision']); // CHANGÉ ICI
});

// Vérification d'existence pour le "Nexus Finder"
Route::get('/check-tenant/{slug}', [TenantController::class, 'exists']);


/*
|--------------------------------------------------------------------------
| Routes Multi-Tenant (Isolées)
|--------------------------------------------------------------------------
*/
Route::middleware(['tenant'])->group(function () {

    Route::post('/login', [AuthController::class, 'login']);

    Route::get('/test-ai', function () {
        $url = env('AI_SERVICE_URL');
        $currentTenant = config('database.connections.tenant.search_path') ?? 'default';
        
        try {
            $response = Http::withHeaders([
                'X-Instance-Context' => $currentTenant
            ])->get($url . '/');

            return [
                'status' => 'Nexus Link Active',
                'instance' => $currentTenant,
                'ai_response' => $response->json()
            ];
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'AI Service Offline',
                'error' => $e->getMessage()
            ], 500);
        }
    });
});