<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;

class IdentifyTenant
{
    public function handle($request, Closure $next)
    {
        // On accepte le Header (Front-end) ou le query param (Tests/Debug)
        $tenantDomain = $request->header('X-Tenant') ?? $request->query('tenant');

        if (!$tenantDomain) {
            return response()->json(['error' => 'Identifiant Nexus (X-Tenant) manquant'], 403);
        }

        // 1. On cherche le tenant dans le schéma central (public)
        // Note: Assure-toi que la table 'tenants' a bien une colonne 'database_schema'
        $tenant = DB::connection('pgsql')
            ->table('tenants')
            ->where('domain', strtolower($tenantDomain))
            ->first();

        if (!$tenant) {
            return response()->json(['error' => "Instance [$tenantDomain] non identifiée sur le Nexus Core"], 404);
        }

        try {
            $schemaName = $tenant->database_schema;

            // 2. Configuration dynamique de la connexion 'tenant'
            Config::set('database.connections.tenant.search_path', $schemaName);
            
            // 3. Purge et Reconnexion (Crucial pour vider le cache PDO)
            DB::purge('tenant');
            DB::reconnect('tenant');

            // 4. FIX POSTGRES : Forcer le search_path au niveau de la session PDO
            // Sans ça, Laravel peut parfois rester bloqué sur 'public'
            DB::connection('tenant')->statement("SET search_path TO \"$schemaName\", public");

            // 5. Définir comme connexion par défaut
            DB::setDefaultConnection('tenant');

            // 6. Optionnel : Partager le tenant dans la requête pour y accéder facilement
            $request->attributes->add(['tenant' => $tenant]);

        } catch (\Exception $e) {
            Log::error("Échec de bascule Nexus : " . $e->getMessage());
            return response()->json(['error' => 'Erreur d\'aiguillage infrastructure'], 500);
        }

        return $next($request);
    }
}