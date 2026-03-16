<?php

namespace App\Observers;

use App\Models\Tenant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

class TenantObserver
{
    /**
     * Étape 1 : Avant la création en base.
     * On génère le nom du schéma pour satisfaire la contrainte NOT NULL.
     */
    public function creating(Tenant $tenant)
    {
        // On utilise le domaine pour le nom du schéma (ex: tenant_apple)
        // C'est plus lisible que l'ID et ça évite le problème du "null"
        $tenant->database_schema = 'tenant_' . strtolower($tenant->domain);
    }

    /**
     * Étape 2 : Après la création en base.
     * On s'occupe de la partie lourde (Infrastructure).
     */
    public function created(Tenant $tenant)
    {
        $schemaName = $tenant->database_schema;

        try {
            // 1. Création physique du schéma
            DB::statement("CREATE SCHEMA IF NOT EXISTS $schemaName");

            // 2. Configuration dynamique de la connexion 'tenant'
            // Attention : Pour Postgres, on utilise 'search_path'
            config(['database.connections.tenant.search_path' => $schemaName]);
            
            // On purge la connexion pour forcer Laravel à prendre en compte le nouveau search_path
            DB::purge('tenant');
            DB::reconnect('tenant');

            // 3. Migration des tables "Apps" dans le nouveau schéma
            Artisan::call('migrate', [
                '--database' => 'tenant',
                '--path'     => 'database/migrations/tenant', 
                '--force'    => true,
            ]);

            Log::info("Instance créée avec succès pour : {$tenant->name} (Schéma: $schemaName)");

        } catch (\Exception $e) {
            Log::error("Erreur lors de la création de l'instance pour {$tenant->name}: " . $e->getMessage());
            // Optionnel : tu pourrais supprimer le tenant ici si l'infra échoue
            throw $e;
        }
    }
}