<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    /**
     * Bascule le contexte de la base de données sur un schéma spécifique.
     */
    private function switchToTenantSchema($domain)
    {
        $schemaName = 'tenant_' . strtolower($domain);
        
        // On configure la connexion 'tenant' dynamiquement
        config(['database.connections.tenant.search_path' => $schemaName]);
        
        // On purge la connexion pour forcer Laravel à appliquer le nouveau search_path
        DB::purge('tenant');
        DB::reconnect('tenant');
        
        // On force aussi la session PDO au cas où
        DB::connection('tenant')->statement("SET search_path TO \"$schemaName\", public");
    }

    /**
     * Inscription : Crée un nouveau Tenant (Schéma) et son administrateur.
     */
    public function register(Request $request)
    {
        $request->validate([
            'company_name' => 'required|string|max:255',
            'domain'       => 'required|string|alpha_dash', // ex: iscamen
            'name'         => 'required|string|max:255',
            'email'        => 'required|string|email|max:255',
            'password'     => 'required|string|min:8',
        ]);

        try {
            // 1. Enregistrement du tenant dans le schéma central (public)
            // Note: Assure-toi que ton modèle Tenant pointe sur la connexion 'pgsql' (public)
            $tenant = Tenant::create([
                'name' => $request->company_name,
                'domain' => strtolower($request->domain),
            ]);

            // 2. Bascule sur le nouveau schéma pour créer l'utilisateur
            $this->switchToTenantSchema($tenant->domain);

            // 3. Création de l'utilisateur dans son schéma dédié
            $user = User::on('tenant')->create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'owner'
            ]);

            return response()->json([
                'message' => 'Nexus Engine : Instance propulsée avec succès !',
                'tenant'  => $tenant->domain,
                'user'    => $user->email
            ], 201);

        } catch (\Exception $e) {
            Log::error("Erreur Register Tenant: " . $e->getMessage());
            return response()->json([
                'error' => 'Échec de la propulsion',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Connexion : Authentifie l'utilisateur sur son instance spécifique.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
            'tenant'   => 'required' // CRUCIAL: Le frontend doit envoyer "iscamen"
        ]);

        try {
            // 1. Bascule dynamique vers le schéma demandé
            $this->switchToTenantSchema($request->tenant);

            // 2. On cherche l'utilisateur UNIQUEMENT dans ce schéma
            $user = User::on('tenant')->where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json([
                    'message' => 'Identifiants invalides pour l\'espace ' . $request->tenant
                ], 401);
            }

            // 3. CRUCIAL : Forcer le modèle à utiliser la connexion 'tenant' pour Sanctum
            $user->setConnection('tenant');

            // 4. Génération du Token (Sera stocké dans tenant_iscamen.personal_access_tokens)
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Connexion réussie au Nexus OS',
                'access_token' => $token,
                'token_type' => 'Bearer',
                'tenant' => $request->tenant,
                'user' => [
                    'name' => $user->name,
                    'email' => $user->email,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error("Crash Login: " . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors de la connexion',
                'details' => "L'espace '" . $request->tenant . "' est peut-être introuvable."
            ], 500);
        }
    }
}