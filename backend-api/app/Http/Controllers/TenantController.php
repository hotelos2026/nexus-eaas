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
     * Vérifie l'existence du slug technique dans PostgreSQL.
     */
    public function exists($name)
    {
        // Normalisation stricte pour la recherche de schéma
        $slug = strtolower(preg_replace('/[^a-z0-9-]/', '', $name));
        
        if (strlen($slug) < 2) {
            return response()->json([
                'exists' => false,
                'message' => 'Identifiant trop court pour le Nexus OS.'
            ], 422);
        }

        $schemaName = 'tenant_' . $slug;

        try {
            // Vérification physique du schéma
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

            // Si absent, on interroge l'IA Python pour un message de bienvenue pro
            return $this->getAiInsights($name);

        } catch (\Exception $e) {
            Log::error("Nexus Finder Error: " . $e->getMessage());
            return response()->json(['exists' => false, 'message' => 'Nexus Core (DB) indisponible.'], 500);
        }
    }

    /**
     * ÉTAPE 2 : PROVISIONNEMENT TEMPS RÉEL (EaaS Engine)
     * Reçoit le nom long et le slug court pour créer l'infrastructure isolée.
     */
    public function provision(Request $request)
    {
        $request->validate([
            'company_name' => 'required|string|min:3', // Ex: "Institut Supérieur..."
            'tenant_slug'  => 'required|string|min:3', // Ex: "iscamen"
            'admin_email'  => 'required|email',
            'password'     => 'required|min:8',
            'admin_name'   => 'required|string',
            'sector'       => 'required|string' 
        ]);

        // On utilise le slug technique pour le nom du schéma
        $slug = strtolower(preg_replace('/[^a-z0-9-]/', '', $request->tenant_slug));
        $schemaName = "tenant_" . $slug;

        try {
            // 1. Vérification si le schéma existe déjà
            $check = DB::select("SELECT schema_name FROM information_schema.schemata WHERE schema_name = ?", [$schemaName]);
            if (!empty($check)) {
                return response()->json(['status' => 'error', 'message' => "L'identifiant '$slug' est déjà réservé."], 422);
            }

            // 2. Création du Schéma SQL isolé
            DB::statement("CREATE SCHEMA \"$schemaName\"");

            // 3. Bascule du contexte vers le nouveau schéma
            DB::statement("SET search_path TO \"$schemaName\", public");

            // 4. Migration dynamique de la structure
            $this->migrateTenantTables($request->sector, $request->company_name);

            // 5. Création de l'Owner (Admin Maître)
            DB::table('users')->insert([
                'name'       => $request->admin_name,
                'email'      => $request->admin_email,
                'password'   => Hash::make($request->password),
                'role'       => 'owner',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'status'  => 'success',
                'message' => "Ecosystème propulsé : " . $request->company_name,
                'tenant'  => $slug,
            ], 201);

        } catch (\Exception $e) {
            Log::error("Échec Propulsion [$slug]: " . $e->getMessage());
            return response()->json([
                'status'  => 'error',
                'message' => "Erreur de déploiement infrastructure : " . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Migrations isolées et Configuration Initiale
     */
    private function migrateTenantTables($sector, $fullName)
    {
        // Table des utilisateurs
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('role')->default('user');
            $table->timestamps();
        });

        // Table de configuration (EaaS Config)
        Schema::create('tenant_configs', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value');
            $table->timestamps();
        });

        // Insertion des métadonnées de l'instance
        DB::table('tenant_configs')->insert([
            ['key' => 'business_sector', 'value' => $sector, 'created_at' => now()],
            ['key' => 'display_name', 'value' => $fullName, 'created_at' => now()],
            ['key' => 'is_active', 'value' => 'true', 'created_at' => now()],
        ]);
    }

    /**
     * Appel au service FastAPI pour valider le nom
     */
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
            Log::warning("IA Nexus Déconnectée.");
        }

        return response()->json([
            'exists'  => false,
            'message' => "Instance non identifiée. Prêt pour initialisation."
        ], 404);
    }
}