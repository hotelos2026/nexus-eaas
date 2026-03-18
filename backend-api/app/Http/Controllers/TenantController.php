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

        // On vérifie d'abord dans le registre central (plus rapide et propre)
        $tenant = DB::connection('pgsql')->table('tenants')->where('domain', $slug)->first();

        if ($tenant) {
            return response()->json([
                'exists' => true,
                'tenant' => $slug,
                'message' => 'Instance identifiée. Authentification requise...'
            ], 200);
        }

        // Si n'existe pas, appel IA pour message marketing
        return $this->getAiInsights($name);
    }

    /**
     * ÉTAPE 2 : PROVISIONNEMENT TEMPS RÉEL (EaaS Engine)
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

            // 2. ENREGISTREMENT DANS LE REGISTRE CENTRAL (Public)
            // Indispensable pour que le middleware IdentifyTenant fonctionne
            DB::connection('pgsql')->table('tenants')->insert([
                'name' => $request->company_name,
                'domain' => $slug,
                'database_schema' => $schemaName,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 3. Création de l'infrastructure SQL
            DB::statement("CREATE SCHEMA \"$schemaName\"");
            
            // On force la connexion sur le nouveau schéma
            DB::statement("SET search_path TO \"$schemaName\", public");

            // 4. Migration des tables vitales (Users, Configs, Tokens)
            $this->migrateTenantTables($request->sector, $request->company_name);

            // 5. Création de l'Administrateur Maître (Dans le nouveau schéma)
            DB::table('users')->insert([
                'name'       => $request->admin_name,
                'email'      => $request->admin_email,
                'password'   => Hash::make($request->password),
                'role'       => 'owner',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 6. GÉNÉRATION DU MESSAGE DE BIENVENUE IA
            $welcomeMessage = "Nexus Engine activé. Votre infrastructure est prête.";
            try {
                $pythonAiUrl = config('services.ai.url', 'https://ai-nexus.up.railway.app');
                $aiResponse = Http::timeout(5)->post($pythonAiUrl . '/generate-welcome', [
                    'company_name' => $request->company_name,
                    'sector'       => $request->sector
                ]);

                if ($aiResponse->successful()) {
                    $welcomeMessage = $aiResponse->json()['message'] ?? $welcomeMessage;
                }
            } catch (\Exception $e) {
                Log::warning("IA Welcome Service indisponible pour $slug.");
            }

            return response()->json([
                'status'      => 'success',
                'message'     => $welcomeMessage,
                'tenant'      => $slug,
                'instruction' => 'Veuillez vous connecter pour accéder à votre espace.'
            ], 201);

        } catch (\Exception $e) {
            // Rollback : On nettoie tout en cas d'erreur
            DB::connection('pgsql')->table('tenants')->where('domain', $slug)->delete();
            DB::statement("DROP SCHEMA IF EXISTS \"$schemaName\" CASCADE");
            
            Log::error("Échec Propulsion [$slug]: " . $e->getMessage());
            return response()->json([
                'status'  => 'error',
                'message' => "Erreur de déploiement infrastructure : " . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Migration manuelle des tables pour le nouveau schéma
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

        // Table de configuration du tenant
        Schema::create('tenant_configs', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value');
            $table->timestamps();
        });

        // CRUCIAL : Table pour Sanctum (Authentification API)
        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->string('tokenable_type');
            $table->unsignedBigInteger('tokenable_id');
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            $table->index(['tokenable_type', 'tokenable_id']);
        });

        // Insertion des données initiales
        DB::table('tenant_configs')->insert([
            ['key' => 'business_sector', 'value' => $sector, 'created_at' => now()],
            ['key' => 'display_name', 'value' => $fullName, 'created_at' => now()],
            ['key' => 'is_active', 'value' => 'true', 'created_at' => now()],
        ]);
    }

    /**
     * Appel IA pour analyser le nom du tenant s'il est libre
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
            Log::warning("IA Nexus Offline.");
        }

        return response()->json([
            'exists'  => false,
            'message' => "Identifiant [$name] disponible. Prêt pour propulsion."
        ], 404);
    }
}