<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // 1. Validation rigoureuse
        $request->validate([
            'company_name' => 'required|string|max:255',
            'domain'       => 'required|string|alpha_dash|unique:tenants,domain',
            'name'         => 'required|string|max:255',
            'email'        => 'required|string|email|max:255',
            'password'     => 'required|string|min:8',
        ]);

        try {
            // 2. Création du Tenant (Schéma Public)
            // L'Observer va automatiquement créer le schéma Postgres 'tenant_domain'
            $tenant = Tenant::create([
                'name' => $request->company_name,
                'domain' => $request->domain,
            ]);

            // 3. Connexion dynamique au nouveau schéma
            // On informe Laravel qu'on veut travailler dans le schéma qui vient d'être créé
            $schema = 'tenant_' . $request->domain;
            config(['database.connections.tenant.search_path' => $schema]);
            DB::purge('tenant'); // On vide la connexion précédente
            
            // 4. Création de l'utilisateur admin du Tenant
            // On force l'usage de la connexion 'tenant'
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
            return response()->json([
                'error' => 'Échec de l\'inscription',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}