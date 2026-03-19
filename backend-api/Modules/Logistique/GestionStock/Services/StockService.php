<?php

namespace Modules\Logistique\GestionStock\Services;

use Illuminate\Support\Facades\DB;

class StockService {
    public static function updateStock($tenantId, $productId, $warehouseId, $qty, $type, $userId, $ref = null, $reason = null) {
        return DB::transaction(function () use ($tenantId, $productId, $warehouseId, $qty, $type, $userId, $ref, $reason) {
            
            // 1. Trouver ou créer l'emplacement de stock
            $stock = DB::table('inventory_stocks')
                ->where(['tenant_id' => $tenantId, 'product_id' => $productId, 'warehouse_id' => $warehouseId])
                ->lockForUpdate()
                ->first();

            if (!$stock) {
                $stockId = DB::table('inventory_stocks')->insertGetId([
                    'tenant_id' => $tenantId, 'product_id' => $productId, 'warehouse_id' => $warehouseId,
                    'quantity' => 0, 'created_at' => now(), 'updated_at' => now()
                ]);
                $oldQty = 0;
            } else {
                $stockId = $stock->id;
                $oldQty = $stock->quantity;
            }

            // 2. Calculer le nouveau stock
            $newQty = ($type === 'IN') ? ($oldQty + $qty) : ($oldQty - $qty);

            if ($newQty < 0 && $type !== 'ADJUST') {
                throw new \Exception("Action impossible : Stock insuffisant.");
            }

            // 3. Appliquer le changement
            DB::table('inventory_stocks')->where('id', $stockId)->update([
                'quantity' => $newQty, 'updated_at' => now()
            ]);

            // 4. Historiser le mouvement
            DB::table('inventory_movements')->insert([
                'tenant_id' => $tenantId,
                'stock_id' => $stockId,
                'type' => $type,
                'quantity' => $qty,
                'old_quantity' => $oldQty,
                'new_quantity' => $newQty,
                'reference' => $ref,
                'reason' => $reason,
                'user_id' => $userId,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return $newQty;
        });
    }
}