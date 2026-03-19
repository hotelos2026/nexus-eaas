<?php

namespace Modules\Logistique\GestionStock\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockController extends Controller
{
    /**
     * Récupère la liste réelle des stocks depuis Postgres (Railway)
     */
    public function index(Request $request)
    {
        // On récupère le tenant envoyé par le header de Next.js
        $tenantId = $request->header('X-Tenant', 'test-corp');

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
     * Enregistre un mouvement (Ajout/Retrait) directement en base
     */
    public function move(Request $request)
    {
        $tenantId = $request->header('X-Tenant', 'test-corp');
        
        $validated = $request->validate([
            'sku'  => 'required|string',
            'qty'  => 'required|integer',
            'type' => 'nullable|in:in,out' 
        ]);

        // Si le type n'est pas précisé (ex: depuis ton bouton), on considère que c'est une entrée (in)
        $type = $request->input('type', 'in');
        $modifier = $type === 'in' ? $validated['qty'] : -$validated['qty'];

        // On cherche le produit pour ce tenant précis
        $product = DB::table('products')
            ->where('sku', $validated['sku'])
            ->where('tenant_id', $tenantId)
            ->first();
        
        if ($product) {
            // Mise à jour de la quantité
            DB::table('inventory_stocks')
                ->where('product_id', $product->id)
                ->increment('quantity', $modifier);

            return response()->json([
                'message' => 'Mouvement enregistré avec succès',
                'new_qty_added' => $modifier
            ]);
        }

        return response()->json([
            'error' => 'Produit non trouvé en base de données. Verifiez le SKU.'
        ], 404);
    }
}