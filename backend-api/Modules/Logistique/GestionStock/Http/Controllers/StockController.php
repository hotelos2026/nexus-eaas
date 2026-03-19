<?php

namespace Modules\Logistique\GestionStock\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Modules\Logistique\Events\StockUpdated;

class StockController extends Controller
{
    /**
     * Récupère la liste réelle des stocks
     */
    public function index(Request $request)
    {
        $tenantId = $request->header('X-Tenant');

        // On va chercher les données dans les tables 'products' et 'inventory_stocks'
        $items = DB::table('products')
            ->join('inventory_stocks', 'products.id', '=', 'inventory_stocks.product_id')
            ->where('products.tenant_id', $tenantId)
            ->select(
                'products.id',
                'products.name',
                'products.sku',
                'products.price',
                'inventory_stocks.quantity as qty',
                'inventory_stocks.min_stock'
            )
            ->get();

        return response()->json([
            'items' => $items,
            'status' => 'success'
        ]);
    }

    /**
     * Enregistre un mouvement (Ajout/Retrait) et prévient Reverb
     */
    public function move(Request $request)
    {
        $tenantId = $request->header('X-Tenant');
        
        $validated = $request->validate([
            'sku' => 'required|string',
            'qty' => 'required|integer',
            'type' => 'required|in:in,out' // 'in' pour arrivage, 'out' pour vente
        ]);

        $modifier = $validated['type'] === 'in' ? $validated['qty'] : -$validated['qty'];

        // Mise à jour en base de données
        $product = DB::table('products')->where('sku', $validated['sku'])->first();
        
        if ($product) {
            DB::table('inventory_stocks')
                ->where('product_id', $product->id)
                ->increment('quantity', $modifier);

            // 🔥 ON PRÉVIENT REVERB POUR LE TEMPS RÉEL
            broadcast(new StockUpdated($tenantId, [
                'sku' => $validated['sku'],
                'new_qty' => $modifier,
                'id' => $product->id
            ]))->toOthers();

            return response()->json(['message' => 'Mouvement enregistré']);
        }

        return response()->json(['error' => 'Produit non trouvé'], 404);
    }
}