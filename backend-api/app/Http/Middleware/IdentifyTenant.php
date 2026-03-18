<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class IdentifyTenant
{
    /**
     * Gère l'identification de l'instance Nexus et l'aiguillage vers le bon schéma PostgreSQL.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Extraction de l'identifiant (Priorité au Header X-Tenant)
        $tenantDomain = $request->header('X-Tenant') ?? $request->query('tenant');

        if (!$tenantDomain) {
            return response()->json([
                'status' => 'error',
                'message' => 'Identifiant Nexus (X-Tenant) manquant.'
            ], 403);
        }

        $tenantDomain = strtolower(trim($tenantDomain));

        // 2. Recherche du tenant dans le schéma public (connexion 'pgsql')
        $tenant = DB::connection('pgsql')
            ->table('tenants')
            ->where('domain', $tenantDomain)
            ->where('is_active', true)
            ->first();

        if (!$tenant) {
            return response()->json([
                'status' => 'error',
                'message' => "Instance Nexus [$tenantDomain] non identifiée ou inactive."
            ], 404);
        }

        try {
            $schemaName = $tenant->database_schema;

            // 3. Configuration dynamique de la connexion 'tenant'
            // On clone la config par défaut de Railway (pgsql)
            $config = config('database.connections.pgsql');
            $config['search_path'] = $schemaName;
            
            config(['database.connections.tenant' => $config]);

            // 4. Reset des connexions existantes
            DB::purge('tenant');

            // 5. Application du search_path au niveau PDO (Indispensable pour Postgres)
            $quotedSchema = '"' . str_replace('"', '""', $schemaName) . '"';
            $pdo = DB::connection('tenant')->getPdo();
            $pdo->exec("SET search_path TO $quotedSchema, public");

            // 6. Définir 'tenant' comme connexion par défaut pour cette requête
            DB::setDefaultConnection('tenant');

            // 7. Partage des données du tenant dans l'objet Request
            $request->attributes->add(['tenant' => $tenant]);

        } catch (\Exception $e) {
            Log::error("Erreur switch schéma [$tenantDomain] -> [$schemaName] : " . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur technique d\'aiguillage infrastructure.',
                'debug' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }

        return $next($request);
    }
}