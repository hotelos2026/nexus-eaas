<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class TenantController extends Controller
{
    /**
     * ÉTAPE 1 : NEXUS FINDER (Recherche & Analyse IA)
     * Vérifie si l'instance existe déjà physiquement.
     */
    public function exists($name)
    {
        $slug = strtolower(preg_replace('/[^a-z0-9-]/', '', $name));
        
        if (strlen($slug) < 2) {
            return response()->json([
                'exists' => false,
                'message' => 'Identifiant trop court pour le Nexus OS.'
            ], 422);
        }

        $schemaName = 'tenant_' . $slug;

        try {
            $exists = DB::select("
                SELECT schema_name FROM information_schema.schemata 
                WHERE schema_name = ?
            ", [$schemaName]);

            if (!empty($exists)) {
                return response()->json([
                    'exists' => true,
                    'tenant' => $slug,
                    'message' => 'Instance identifiée. Authentification requise...'
                ], 200);
            }

            // Appel IA pour un message marketing si l'instance n'existe pas
            return $this->getAiInsights($name);

        } catch (\Exception $e) {
            Log::error("Nexus Finder Error: " . $e->getMessage());
            return response()->json(['exists' => false, 'message' => 'Nexus Core (DB) indisponible.'], 500);
        }
    }

    /**
     * ÉTAPE 2 : PROVISIONNEMENT TEMPS RÉEL (EaaS Engine)
     * Crée le schéma, les tables, l'admin et génère le message de bienvenue IA.
     */
    public function provision(Request $request)
    {
        $request->validate([
            'company_name' => 'required|string|min:3',
            'tenant_slug'  => 'required|string|min:3',
            'admin_email'  => 'required|email',
            'password'     => 'required|min:8',
            'admin_name'   => 'required|string',
            'sector'       => 'required|string' 
        ]);

        $slug = strtolower(preg_replace('/[^a-z0-9-]/', '', $request->tenant_slug));
        $schemaName = "tenant_" . $slug;

        try {
            // 1. Sécurité : Vérifier si le schéma existe
            $check = DB::select("SELECT schema_name FROM information_schema.schemata WHERE schema_name = ?", [$schemaName]);
            if (!empty($check)) {
                return response()->json(['status' => 'error', 'message' => "L'identifiant '$slug' est déjà réservé."], 422);
            }

            // 2. Création de l'infrastructure SQL
            DB::statement("CREATE SCHEMA \"$schemaName\"");
            DB::statement("SET search_path TO \"$schemaName\", public");

            // 3. Migration des tables vitales
            $this->migrateTenantTables($request->sector, $request->company_name);

            // 4. Création de l'Administrateur Maître
            DB::table('users')->insert([
                'name'       => $request->admin_name,
                'email'      => $request->admin_email,
                'password'   => Hash::make($request->password),
                'role'       => 'owner',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 5. GÉNÉRATION DU MESSAGE DE BIENVENUE IA
            $welcomeMessage = "Nexus Engine activé. Votre infrastructure est prête.";
            try {
                $pythonAiUrl = config('services.ai.url', 'https://ai-nexus.up.railway.app');
                $aiResponse = Http::timeout(3)->post($pythonAiUrl . '/generate-welcome', [
                    'company_name' => $request->company_name,
                    'sector' => $request->sector
                ]);

                if ($aiResponse->successful()) {
                    $welcomeMessage = $aiResponse->json()['message'];
                }
            } catch (\Exception $e) {
                Log::warning("IA Welcome Service indisponible.");
            }

            return response()->json([
                'status'  => 'success',
                'message' => $welcomeMessage,
                'tenant'  => $slug,
                'instruction' => 'Veuillez vous connecter pour accéder à votre espace.'
            ], 201);

        } catch (\Exception $e) {
            // Rollback manuel en cas d'erreur de schéma
            DB::statement("DROP SCHEMA IF EXISTS \"$schemaName\" CASCADE");
            Log::error("Échec Propulsion [$slug]: " . $e->getMessage());
            return response()->json([
                'status'  => 'error',
                'message' => "Erreur de déploiement infrastructure : " . $e->getMessage()
            ], 500);
        }
    }

    private function migrateTenantTables($sector, $fullName)
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('role')->default('user');
            $table->timestamps();
        });

        Schema::create('tenant_configs', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value');
            $table->timestamps();
        });

        DB::table('tenant_configs')->insert([
            ['key' => 'business_sector', 'value' => $sector, 'created_at' => now()],
            ['key' => 'display_name', 'value' => $fullName, 'created_at' => now()],
            ['key' => 'is_active', 'value' => 'true', 'created_at' => now()],
        ]);
    }

    private function getAiInsights($name)
    {
        try {
            $pythonAiUrl = config('services.ai.url', 'https://ai-nexus.up.railway.app');
            $response = Http::timeout(3)->post($pythonAiUrl . '/analyze-tenant', [
                'tenant_name' => $name
            ]);

            if ($response->successful()) {
                return response()->json([
                    'exists'  => false,
                    'message' => $response->json()['analysis']
                ], 404);
            }
        } catch (\Exception $e) {
            Log::warning("IA Nexus Offline.");
        }

        return response()->json([
            'exists'  => false,
            'message' => "Identifiant disponible. Prêt pour propulsion."
        ], 404);
    }
}