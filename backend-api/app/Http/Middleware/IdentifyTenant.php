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
        // 1. Extraction de l'identifiant (Priorité au Header X-Tenant envoyé par Axios)
        $tenantDomain = $request->header('X-Tenant') ?? $request->query('tenant');

        if (!$tenantDomain) {
            return response()->json([
                'status' => 'error',
                'message' => 'Accès refusé. Identifiant Nexus (X-Tenant) manquant.'
            ], 403);
        }

        $tenantDomain = strtolower(trim($tenantDomain));

        // 2. Recherche du tenant dans le registre central (Connexion PGSQL par défaut)
        $tenant = DB::connection('pgsql')
            ->table('tenants')
            ->where('domain', $tenantDomain)
            // On enlève le 'is_active' temporairement pour le test 
            // ou on s'assure qu'il est bien à true en DB.
            ->first();

        // SI LE TENANT N'EXISTE PAS -> ON COUPE TOUT DE SUITE
        if (!$tenant) {
            return response()->json([
                'status' => 'error',
                'node' => $tenantDomain,
                'message' => "Le node [$tenantDomain] n'existe pas dans l'écosystème Nexus."
            ], 404);
        }

        try {
            $schemaName = $tenant->database_schema;

            // 3. Configuration dynamique de la connexion 'tenant'
            $config = config('database.connections.pgsql');
            $config['search_path'] = $schemaName;
            
            // On injecte la nouvelle config 'tenant'
            config(['database.connections.tenant' => $config]);

            // 4. RESET DES CONNEXIONS
            DB::purge('pgsql');
            DB::purge('tenant');

            // 5. Application du search_path au niveau PDO
            $quotedSchema = '"' . str_replace('"', '""', $schemaName) . '"';
            DB::connection('tenant')->getPdo()->exec("SET search_path TO $quotedSchema, public");

            // 6. Définir 'tenant' comme connexion par défaut
            // C'est ce qui permet à Auth::user() de chercher dans le bon schéma !
            DB::setDefaultConnection('tenant');

            // 7. Partage des données du tenant dans l'objet Request
            $request->attributes->add(['tenant_info' => $tenant]);

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