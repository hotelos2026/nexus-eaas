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
        // 1. Extraction de l'identifiant (Priorité au Header X-Tenant pour Next.js)
        $tenantDomain = $request->header('X-Tenant') ?? $request->query('tenant');

        if (!$tenantDomain) {
            return response()->json([
                'status' => 'error',
                'message' => 'Identifiant Nexus (X-Tenant) manquant.'
            ], 403);
        }

        $tenantDomain = strtolower(trim($tenantDomain));

        try {
            // --- ÉTAPE CRUCIALE : Forcer la recherche dans le schéma PUBLIC ---
            // On s'assure que la connexion principale pointe sur 'public' pour trouver la table 'tenants'
            Config::set('database.connections.pgsql.search_path', 'public');
            DB::purge('pgsql'); 

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

            $schemaName = $tenant->database_schema;

            // 2. Configuration dynamique de la connexion 'tenant'
            $config = Config::get('database.connections.pgsql');
            $config['search_path'] = $schemaName;
            
            Config::set('database.connections.tenant', $config);
            
            // 3. Purge et Reconnexion pour appliquer le schéma
            DB::purge('tenant');
            
            // 4. SET search_path au niveau PDO (Double sécurité pour PostgreSQL)
            $quotedSchema = '"' . str_replace('"', '""', $schemaName) . '"';
            DB::connection('tenant')->getPdo()->exec("SET search_path TO $quotedSchema, public");

            // 5. Définir 'tenant' comme connexion par défaut pour cette requête
            DB::setDefaultConnection('tenant');

            // 6. Injecter l'objet tenant dans la requête pour usage ultérieur
            $request->attributes->add(['tenant' => $tenant]);

        } catch (\Exception $e) {
            Log::critical("Échec bascule Nexus [$tenantDomain] : " . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur technique d\'aiguillage infrastructure.',
                'debug' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }

        return $next($request);
    }
}