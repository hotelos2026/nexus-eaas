<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Artisan;

class AuthController extends Controller
{
    /**
     * Bascule le contexte vers le schéma du tenant.
     * Utilise les doubles quotes pour protéger le nom du schéma PostgreSQL.
     */
    private function switchToTenantSchema($domain)
    {
        // On suit la nomenclature de ton middleware : database_schema (ex: tenant_apple)
        $schemaName = 'tenant_' . strtolower($domain);
        
        config(['database.connections.tenant.search_path' => $schemaName]);
        
        DB::purge('tenant');
        DB::reconnect('tenant');
        
        // Fix PDO pour forcer le search_path
        DB::connection('tenant')->statement("SET search_path TO \"$schemaName\", public");
        
        return $schemaName;
    }

    /**
     * Inscription : Provisionne une instance Nexus et crée l'admin.
     */
    public function register(Request $request)
    {
        $request->validate([
            'company_name' => 'required|string|max:255',
            'domain'       => 'required|string|alpha_dash|unique:pgsql.tenants,domain',
            'name'         => 'required|string|max:255',
            'email'        => 'required|string|email|max:255',
            'password'     => 'required|string|min:8',
        ]);

        try {
            return DB::transaction(function () use ($request) {
                $domain = strtolower($request->domain);
                $schemaName = 'tenant_' . $domain;

                // 1. Création du Tenant dans le Core (Schéma Public)
                $tenant = Tenant::create([
                    'name' => $request->company_name,
                    'domain' => $domain,
                    'database_schema' => $schemaName,
                    'is_active' => true
                ]);

                // 2. CRÉATION PHYSIQUE DU SCHÉMA DANS POSTGRES
                DB::statement("CREATE SCHEMA IF NOT EXISTS \"$schemaName\"");

                // 3. MIGRATION DES TABLES DANS LE NOUVEAU SCHÉMA
                // On force la connexion 'tenant' pour Artisan
                $this->switchToTenantSchema($domain);
                
                Artisan::call('migrate', [
                    '--database' => 'tenant',
                    '--path' => 'database/migrations/tenant', // Dossier spécifique si existant
                    '--force' => true,
                ]);

                // 4. Création de l'Administrateur dans le nouveau schéma
                $user = User::on('tenant')->create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                    'role' => 'owner'
                ]);

                return response()->json([
                    'status'  => 'success',
                    'message' => 'Nexus Engine : Instance propulsée avec succès !',
                    'data'    => [
                        'tenant' => $tenant->domain,
                        'schema' => $schemaName,
                        'admin'  => $user->email
                    ]
                ], 201);
            });

        } catch (\Exception $e) {
            Log::error("Échec Propulsion Nexus [$request->domain]: " . $e->getMessage());
            return response()->json([
                'error'   => 'Échec de la propulsion',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Connexion : Authentifie l'utilisateur sur son instance.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
            'tenant'   => 'required' 
        ]);

        try {
            // 1. Bascule sur le schéma demandé
            $this->switchToTenantSchema($request->tenant);

            // 2. Recherche de l'utilisateur
            $user = User::on('tenant')->where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json([
                    'message' => 'Accès refusé : Identifiants ou instance incorrects.'
                ], 401);
            }

            // 3. Génération du Token via Sanctum (sur la connexion tenant)
            // On s'assure que le modèle est bien lié à la connexion 'tenant'
            $user->setConnection('tenant');
            $token = $user->createToken('nexus_auth_token')->plainTextToken;

            return response()->json([
                'status' => 'success',
                'access_token' => $token,
                'token_type' => 'Bearer',
                'tenant' => $request->tenant,
                'user' => [
                    'name'  => $user->name,
                    'email' => $user->email,
                    'role'  => $user->role
                ]
            ]);

        } catch (\Exception $e) {
            Log::error("Erreur Login Nexus: " . $e->getMessage());
            return response()->json(['error' => 'Erreur Nexus OS'], 500);
        }
    }

    /**
     * Déconnexion : Révoque le token.
     */
    public function logout(Request $request)
    {
        try {
            // Le middleware 'auth:sanctum' a déjà identifié l'utilisateur
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Session Nexus terminée.'
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erreur lors de la déconnexion'], 500);
        }
    }
}