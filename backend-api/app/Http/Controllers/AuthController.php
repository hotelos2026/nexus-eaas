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
     * Inscription : Crée un nouveau Tenant (Schéma) et son administrateur.
     */
    public function register(Request $request)
    {
        // 1. Validation des données
        $request->validate([
            'company_name' => 'required|string|max:255',
            'domain'       => 'required|string|alpha_dash|unique:tenants,domain',
            'name'         => 'required|string|max:255',
            'email'        => 'required|string|email|max:255',
            'password'     => 'required|string|min:8',
        ]);

        try {
            // 2. Création du Tenant dans le schéma public (via l'Observer)
            $tenant = Tenant::create([
                'name' => $request->company_name,
                'domain' => $request->domain,
            ]);

            // 3. Bascule dynamique sur le schéma du nouveau tenant
            $schema = 'tenant_' . $request->domain;
            config(['database.connections.tenant.search_path' => $schema]);
            DB::purge('tenant'); 
            
            // 4. Création de l'utilisateur dans son schéma dédié
            $user = User::on('tenant')->create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            return response()->json([
                'message' => 'SaaS et Utilisateur créés avec succès !',
                'tenant'  => $tenant->domain,
                'user'    => $user->email
            ], 201);

        } catch (\Exception $e) {
            Log::error("Erreur Register Tenant: " . $e->getMessage());
            return response()->json([
                'error' => 'Échec de l\'inscription',
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
        'email' => 'required|email',
        'password' => 'required',
    ]);

    try {
        // 1. On cherche l'utilisateur dans le schéma du tenant
        $user = User::on('tenant')->where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Identifiants invalides pour cette instance.'
            ], 401);
        }

        // 2. CRUCIAL : On force l'instance du modèle à utiliser la connexion 'tenant'
        // Sans cela, createToken() cherchera la table dans le schéma public et plantera.
        $user->setConnection('tenant');

        // 3. Génération du Token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ]
        ]);

    } catch (\Exception $e) {
        Log::error("Crash Login: " . $e->getMessage());
        return response()->json([
            'error' => 'Erreur lors de la connexion',
            'details' => $e->getMessage()
        ], 500);
    }
}
}