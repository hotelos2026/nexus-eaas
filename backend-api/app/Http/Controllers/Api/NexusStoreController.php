<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NexusStoreController extends Controller
{
    public function bulkSubscribe(Request $request)
    {
        // 1. Validation : on attend un tableau d'IDs de modules et le slug du tenant
        $request->validate([
            'tenant_slug' => 'required|string',
            'module_ids' => 'required|array',
        ]);

        // 2. Trouver le Tenant par son domaine/slug
        $tenant = Tenant::where('domain', $request->tenant_slug)->first();

        if (!$tenant) {
            return response()->json(['message' => 'Tenant non trouvé'], 404);
        }

        try {
            DB::beginTransaction();

            $subscribed = [];
            foreach ($request->module_ids as $moduleId) {
                // On utilise updateOrCreate pour éviter les erreurs de doublons
                $sub = Subscription::updateOrCreate(
                    [
                        'tenant_id' => $tenant->id,
                        'module_id' => $moduleId, // Ici c'est le slug du module (ex: 'crm-001')
                    ],
                    [
                        'status' => 'active',
                        'updated_at' => now(),
                    ]
                );
                $subscribed[] = $sub;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Modules activés avec succès',
                'count' => count($subscribed)
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'abonnement',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}