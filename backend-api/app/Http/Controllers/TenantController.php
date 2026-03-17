<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class TenantController extends Controller
{
    /**
     * ÉTAPE 1 : NEXUS FINDER (Recherche & Analyse IA)
     * Vérifie si le schéma existe, sinon demande à l'IA Python quoi suggérer.
     */
    public function exists($name)
    {
        // Normalisation (Autorise les tirets pour test-prod)
        $slug = strtolower(preg_replace('/[^a-zA-Z0-9-]/', '', $name));
        
        if (strlen($slug) < 2) {
            return response()->json([
                'exists' => false,
                'message' => 'Nom d\'instance invalide.'
            ], 422);
        }

        $schemaName = 'tenant_' . $slug;

        try {
            // Vérification physique dans PostgreSQL
            $exists = DB::select("
                SELECT schema_name FROM information_schema.schemata 
                WHERE schema_name = ?
            ", [$schemaName]);

            if (!empty($exists)) {
                return response()->json([
                    'exists' => true,
                    'tenant' => $slug,
                    'message' => 'Instance Nexus identifiée. Redirection vers le portail...'
                ], 200);
            }

            // Si absent, on demande l'avis de l'IA (FastAPI)
            return $this->getAiInsights($name);

        } catch (\Exception $e) {
            Log::error("Erreur Nexus Finder: " . $e->getMessage());
            return response()->json(['exists' => false, 'message' => 'Nexus Core indisponible.'], 500);
        }
    }

    /**
     * ÉTAPE 2 : PROVISIONNEMENT TEMPS RÉEL
     * Crée le schéma, les tables et l'admin après validation du formulaire.
     */
    public function provision(Request $request)
    {
        $request->validate([
            'company_name' => 'required|string|min:2',
            'admin_email'  => 'required|email',
            'password'     => 'required|min:6',
            'admin_name'   => 'required|string'
        ]);

        $slug = strtolower(preg_replace('/[^a-zA-Z0-9-]/', '', $request->company_name));
        $schemaName = "tenant_" . $slug;

        try {
            // 1. Création du Schéma (Utilisation des doubles quotes pour les tirets)
            DB::statement("CREATE SCHEMA \"$schemaName\"");

            // 2. Bascule du contexte vers le nouveau schéma
            DB::statement("SET search_path TO \"$schemaName\", public");

            // 3. Migration en temps réel (Structure de base)
            $this->migrateTenantTables();

            // 4. Création de l'administrateur réel
            DB::table('users')->insert([
                'name'       => $request->admin_name,
                'email'      => $request->admin_email,
                'password'   => Hash::make($request->password),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'status'  => 'success',
                'message' => "L'instance $slug a été propulsée avec succès !",
                'tenant'  => $slug
            ], 201);

        } catch (\Exception $e) {
            Log::error("Échec Provisionnement [$slug]: " . $e->getMessage());
            return response()->json([
                'status'  => 'error',
                'message' => "Impossible de créer l'instance : " . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Structure interne du tenant (Migrations isolées)
     */
    private function migrateTenantTables()
    {
        Schema::create('users', function ($table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('role')->default('admin');
            $table->timestamps();
        });

        // Tu peux ajouter d'autres tables ici (settings, posts, etc.)
    }

    /**
     * Communication avec le service IA FastAPI
     */
    private function getAiInsights($name)
    {
        try {
            $pythonAiUrl = config('services.ai.url', 'https://ai-nexus.up.railway.app');
            $response = Http::timeout(5)->post($pythonAiUrl . '/analyze-tenant', [
                'tenant_name' => $name
            ]);

            if ($response->successful()) {
                $aiData = $response->json();
                return response()->json([
                    'exists'  => false,
                    'message' => $aiData['analysis'],
                    'sector'  => $aiData['metadata']['sector'] ?? 'Général',
                    'suggested_module' => $aiData['suggested_module'] ?? null
                ], 404);
            }
        } catch (\Exception $e) {
            Log::warning("IA Offline pour: $name");
        }

        return response()->json([
            'exists'  => false,
            'message' => "Instance inconnue. Voulez-vous créer l'espace \"$name\" ?"
        ], 404);
    }
}