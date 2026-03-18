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
        'tenant'   => 'required' 
    ]);

    try {
        // 1. On s'assure que le schéma existe physiquement
        $schemaName = 'tenant_' . strtolower($request->tenant);
        
        // 2. Bascule forcée
        $this->switchToTenantSchema($request->tenant);

        // 3. On cherche l'utilisateur sur la connexion 'tenant'
        // On utilise DB::connection('tenant') pour être certain de l'isolation
        $user = DB::connection('tenant')->table('users')->where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Accès refusé : Identifiants ou instance incorrects.'], 401);
        }

        // 4. On récupère l'objet User complet pour Sanctum
        $userModel = User::on('tenant')->find($user->id);
        $userModel->setConnection('tenant'); // Indispensable pour Sanctum
        
        $token = $userModel->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'tenant' => $request->tenant,
            'user' => ['name' => $user->name, 'email' => $user->email]
        ]);

    } catch (\Exception $e) {
        return response()->json(['error' => 'Erreur Nexus OS', 'details' => $e->getMessage()], 500);
    }
}
}