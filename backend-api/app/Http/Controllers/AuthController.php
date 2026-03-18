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
     * INSCRIPTION (Provisioning)
     * Crée le tenant dans le Core et génère son infrastructure SQL isolée.
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

                // 1. Création du registre central (Schéma Public)
                $tenant = Tenant::create([
                    'name' => $request->company_name,
                    'domain' => $domain,
                    'database_schema' => $schemaName,
                    'is_active' => true
                ]);

                // 2. Création physique du schéma PostgreSQL
                DB::statement("CREATE SCHEMA IF NOT EXISTS \"$schemaName\"");

                // 3. Exécution des migrations pour le nouveau tenant
                // On configure temporairement la connexion pour Artisan
                config(['database.connections.tenant.search_path' => $schemaName]);
                DB::purge('tenant');

                Artisan::call('migrate', [
                    '--database' => 'tenant',
                    '--path'     => 'database/migrations', // Utilise tes migrations standards
                    '--force'    => true,
                ]);

                // 4. Création de l'utilisateur Admin dans le nouveau schéma
                $user = User::on('tenant')->create([
                    'name'     => $request->name,
                    'email'    => $request->email,
                    'password' => Hash::make($request->password),
                    'role'     => 'owner'
                ]);

                return response()->json([
                    'status'  => 'success',
                    'message' => 'Nexus Engine : Instance propulsée avec succès !',
                    'data'    => [
                        'tenant' => $tenant->domain,
                        'admin'  => $user->email
                    ]
                ], 201);
            });

        } catch (\Exception $e) {
            Log::error("Échec Propulsion Nexus [$request->domain]: " . $e->getMessage());
            return response()->json([
                'error'   => 'Échec de la propulsion infrastructure',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * CONNEXION
     * Authentifie l'utilisateur sur le schéma déjà sélectionné par le Middleware.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        try {
            // Le Middleware 'IdentifyTenant' a déjà fait le switch de connexion.
            // On cherche l'utilisateur directement dans le schéma actif.
            $user = User::where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json([
                    'message' => 'Accès refusé : Identifiants incorrects sur cette instance.'
                ], 401);
            }

            // Génération du Token Sanctum
            $token = $user->createToken('nexus_auth_token')->plainTextToken;

            return response()->json([
                'status'       => 'success',
                'access_token' => $token,
                'token_type'   => 'Bearer',
                'user'         => [
                    'name'  => $user->name,
                    'email' => $user->email,
                    'role'  => $user->role
                ]
            ]);

        } catch (\Exception $e) {
            Log::error("Erreur Login Nexus: " . $e->getMessage());
            return response()->json([
                'error' => 'Erreur interne Nexus OS',
                'debug' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * DÉCONNEXION
     */
    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();
            return response()->json([
                'status'  => 'success',
                'message' => 'Session Nexus terminée.'
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erreur lors de la déconnexion'], 500);
        }
    }
}