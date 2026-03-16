<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\Tenant;
use Illuminate\Support\Facades\DB;

class IdentifyTenant
{
    public function handle($request, Closure $next)
    {
        // 1. On récupère le domaine via le header HTTP
        $tenantDomain = $request->header('X-Tenant');

        if (!$tenantDomain) {
            return response()->json(['error' => 'Identifiant d\'instance (X-Tenant) manquant'], 403);
        }

        // 2. On vérifie si l'entreprise existe dans le schéma public
        $tenant = Tenant::where('domain', $tenantDomain)->first();

        if (!$tenant) {
            return response()->json(['error' => 'Instance introuvable'], 404);
        }

        // 3. LA MAGIE : On switch le search_path de Postgres sur ce schéma
        $schemaName = $tenant->database_schema;
        
        // On configure la connexion 'tenant' définie dans config/database.php
        config(['database.connections.tenant.search_path' => $schemaName]);
        
        // On force la reconnexion pour appliquer le nouveau schéma
        DB::purge('tenant');
        DB::reconnect('tenant');

        // 4. On définit 'tenant' comme connexion par défaut pour cette requête
        DB::setDefaultConnection('tenant');

        return $next($request);
    }
}