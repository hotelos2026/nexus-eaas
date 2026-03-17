<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Config;

class IdentifyTenant
{
    public function handle($request, Closure $next)
    {
        $tenantDomain = $request->header('X-Tenant');

        if (!$tenantDomain) {
            return response()->json(['error' => 'Header X-Tenant manquant'], 403);
        }

        // --- ÉTAPE CRUCIALE ---
        // On cherche le tenant dans la connexion 'pgsql' (le schéma public)
        // même si la connexion par défaut a été modifiée ailleurs.
        $tenant = DB::connection('pgsql')
            ->table('tenants')
            ->where('domain', $tenantDomain)
            ->first();

        if (!$tenant) {
            return response()->json(['error' => "Instance [$tenantDomain] introuvable"], 404);
        }

        // --- ÉTAPE DE BASCULE ---
        $schemaName = $tenant->database_schema;

        // On configure la connexion 'tenant' avec le bon schéma
        Config::set('database.connections.tenant.search_path', $schemaName);
        
        // On purge pour forcer Laravel à oublier l'ancienne config
        DB::purge('tenant');
        
        // On définit 'tenant' comme connexion par défaut pour le reste de la requête
        DB::setDefaultConnection('tenant');

        return $next($request);
    }
}