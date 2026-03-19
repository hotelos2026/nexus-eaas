<?php

namespace Modules\Logistique\GestionStock\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\Logistique\GestionStock\Services\StockService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class StockController extends Controller
{
    /**
     * Liste le stock global par dépôt pour un Tenant
     */
    public function index(Request $request)
    {
        // On récupère le Tenant depuis le header (clé de ton architecture)
        $tenantId = $request->header('X-Tenant');

        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID missing'], 400);
        }

        $stocks = DB::table('inventory_stocks')
            ->join('inventory_warehouses', 'inventory_stocks.warehouse_id', '=', 'inventory_warehouses.id')
            // Optionnel : Joindre la table products si elle existe déjà
            // ->join('products', 'inventory_stocks.product_id', '=', 'products.id') 
            ->where('inventory_stocks.tenant_id', $tenantId)
            ->select(
                'inventory_stocks.*', 
                'inventory_warehouses.name as warehouse_name'
                // 'products.name as product_name' 
            )
            ->get();

        return response()->json($stocks);
    }

    /**
     * Effectue un mouvement (IN / OUT / ADJUST)
     */
    public function move(Request $request)
    {
        $request->validate([
            'product_id'   => 'required|integer',
            'warehouse_id' => 'required|integer',
            'quantity'     => 'required|integer|min:1',
            'type'         => 'required|in:IN,OUT,ADJUST',
            'reference'    => 'nullable|string',
            'reason'       => 'nullable|string',
        ]);

        $tenantId = $request->header('X-Tenant');

        try {
            // Utilisation du StockService pour garantir l'atomicité de la transaction
            $newBalance = StockService::updateStock(
                $tenantId,
                $request->product_id,
                $request->warehouse_id,
                $request->quantity,
                $request->type,
                (Auth::check() ? Auth::id() : 1), // ID 1 par défaut pour les tests/système
                $request->reference,
                $request->reason
            );

            return response()->json([
                'status' => 'success',
                'message' => 'Mouvement enregistré avec succès',
                'new_balance' => $newBalance
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }
}