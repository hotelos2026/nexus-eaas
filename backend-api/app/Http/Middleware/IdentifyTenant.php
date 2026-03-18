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
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Extraction de l'identifiant (Priorité au Header X-Tenant pour le Front Next.js)
        $tenantDomain = $request->header('X-Tenant') ?? $request->query('tenant');

        if (!$tenantDomain) {
            return response()->json([
                'status' => 'error',
                'message' => 'Identifiant Nexus (X-Tenant) manquant dans la requête.'
            ], 403);
        }

        $tenantDomain = strtolower(trim($tenantDomain));

        // 2. Recherche du tenant dans la connexion 'pgsql' (Schéma Core / Public)
        // On récupère le nom du schéma de base de données associé au domaine
        $tenant = DB::connection('pgsql')
            ->table('tenants')
            ->where('domain', $tenantDomain)
            ->where('is_active', true) // Sécurité : On vérifie si l'école n'est pas suspendue
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
            // On clone la config par défaut mais en changeant le search_path
            $config = Config::get('database.connections.pgsql');
            $config['search_path'] = $schemaName;
            
            Config::set('database.connections.tenant', $config);
            
            // 4. Reset des connexions existantes pour appliquer le nouveau schéma
            DB::purge('tenant');
            DB::reconnect('tenant');

            // 5. PROTECTION CRUCIALE : SET search_path au niveau PDO
            // On utilise quoteIdentifier pour éviter toute injection SQL sur le nom du schéma
            $pdo = DB::connection('tenant')->getPdo();
            $quotedSchema = '"' . str_replace('"', '""', $schemaName) . '"';
            $pdo->exec("SET search_path TO $quotedSchema, public");

            // 6. Définir 'tenant' comme connexion par défaut pour tout le cycle de vie de la requête
            DB::setDefaultConnection('tenant');

            // 7. Partage des données du tenant dans l'objet Request
            // Utile pour récupérer l'ID de l'école ou le nom partout dans Laravel via $request->get('tenant')
            $request->attributes->add(['tenant' => $tenant]);

            // Logger l'accès (Optionnel, utile en debug)
            // Log::debug("Nexus Switch: [$tenantDomain] -> Schema: [$schemaName]");

        } catch (\Exception $e) {
            Log::critical("Échec critique de bascule Nexus pour [$tenantDomain] : " . $e->getMessage(), [
                'exception' => $e
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur technique d\'aiguillage infrastructure.'
            ], 500);
        }

        return $next($request);
    }
}