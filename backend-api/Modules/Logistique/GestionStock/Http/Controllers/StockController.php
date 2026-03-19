<?php

namespace Modules\Logistique\GestionStock\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\Logistique\GestionStock\Services\StockService;
use Modules\Logistique\Events\StockUpdated; // L'événement pour le temps réel
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class StockController extends Controller
{
    /**
     * Liste le stock global par dépôt pour un Tenant avec calcul des KPIs
     */
    public function index(Request $request)
    {
        $tenantId = $request->header('X-Tenant');

        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID missing'], 400);
        }

        // Récupération des articles en stock avec jointure dépôt
        $items = DB::table('inventory_stocks')
            ->join('inventory_warehouses', 'inventory_stocks.warehouse_id', '=', 'inventory_warehouses.id')
            ->leftJoin('products', 'inventory_stocks.product_id', '=', 'products.id') 
            ->where('inventory_stocks.tenant_id', $tenantId)
            ->select(
                'inventory_stocks.id',
                'inventory_stocks.product_id',
                'products.name as name',
                'products.sku as sku',
                'products.price as price',
                'inventory_stocks.quantity as qty',
                'inventory_stocks.min_stock as min_stock',
                'inventory_warehouses.name as warehouse'
            )
            ->get();

        // Retourne les données formatées pour ton Dashboard Premium
        return response()->json([
            'items' => $items,
            'status' => 'success'
        ]);
    }

    /**
     * Effectue un mouvement (IN / OUT / ADJUST) et diffuse en temps réel
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
            DB::beginTransaction();

            // 1. Mise à jour de la base de données via le Service
            $newBalance = StockService::updateStock(
                $tenantId,
                $request->product_id,
                $request->warehouse_id,
                $request->quantity,
                $request->type,
                (Auth::check() ? Auth::id() : 1), 
                $request->reference,
                $request->reason
            );

            // 2. Déclenchement de l'événement Temps Réel (Broadcasting)
            // Cet événement sera reçu par ton useEffect(Echo) côté React
            broadcast(new StockUpdated([
                'id' => $request->product_id,
                'new_qty' => $newBalance,
                'tenant' => $tenantId
            ]))->toOthers();

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Mouvement enregistré et diffusé',
                'new_balance' => $newBalance
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }
}