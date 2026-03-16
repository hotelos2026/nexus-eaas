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
    $schemaName = 'tenant_' . $tenant->domain;

    // 1. Créer le schéma dans Postgres
    DB::statement("CREATE SCHEMA \"$schemaName\"");

    // 2. Lancer les migrations SPECIFIQUEMENT dans ce nouveau schéma
    // On force la connexion 'tenant' à pointer sur le nouveau schéma
    config(['database.connections.tenant.search_path' => $schemaName]);
    DB::purge('tenant');

    Artisan::call('migrate', [
        '--database' => 'tenant',
        '--path' => 'database/migrations/tenant', // Si tu as séparé tes migrations
        '--force' => true,
    ]);
}
}