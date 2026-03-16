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

    // 1. Création du schéma physique
    DB::statement("CREATE SCHEMA IF NOT EXISTS \"$schemaName\"");

    // 2. On définit une variable d'environnement temporaire pour cette exécution
    // Cela aide Laravel à savoir quel schéma viser si tu as configuré ton config/database.php
    putenv("DB_SCHEMA=$schemaName");
    config(['database.connections.tenant.search_path' => $schemaName]);
    DB::purge('tenant');

    // 3. Exécution de la migration avec sortie forcée pour le debug
    Artisan::call('migrate', [
        '--database' => 'tenant',
        '--force'    => true,
        '--path'     => 'database/migrations', // Force le chemin standard
    ]);
}
}