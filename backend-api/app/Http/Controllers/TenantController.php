<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use App\Services\ModuleDiscoveryService; // Assure-toi que le namespace est correct

class TenantController extends Controller
{
    /**
     * ÉTAPE 1 : NEXUS FINDER
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

        $tenant = DB::connection('pgsql')->table('tenants')->where('domain', $slug)->first();

        if ($tenant) {
            return response()->json([
                'exists' => true,
                'tenant' => $slug,
                'message' => 'Instance identifiée. Authentification requise...'
            ], 200);
        }

        return $this->getAiInsights($name);
    }

    /**
     * ÉTAPE 2 : PROVISIONNEMENT (EaaS Engine)
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
            $check = DB::select("SELECT schema_name FROM information_schema.schemata WHERE schema_name = ?", [$schemaName]);
            if (!empty($check)) {
                return response()->json(['status' => 'error', 'message' => "L'identifiant '$slug' est déjà réservé."], 422);
            }

            // Enregistrement Central
            DB::connection('pgsql')->table('tenants')->insert([
                'name' => $request->company_name,
                'domain' => $slug,
                'database_schema' => $schemaName,
                'sector' => $request->sector,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Création de l'infrastructure SQL
            DB::statement("CREATE SCHEMA \"$schemaName\"");
            DB::statement("SET search_path TO \"$schemaName\", public");

            // Migration des tables et installation des modules
            $this->migrateTenantTables($request->sector, $request->company_name);

            // Création Admin
            DB::table('users')->insert([
                'name'       => $request->admin_name,
                'email'      => $request->admin_email,
                'password'   => Hash::make($request->password),
                'role'       => 'owner',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'status'      => 'success',
                'tenant'      => $slug,
                'message'     => "Nexus Engine activé pour {$request->company_name}.",
                'instruction' => 'Connectez-vous pour configurer vos modules.'
            ], 201);

        } catch (\Exception $e) {
            DB::connection('pgsql')->table('tenants')->where('domain', $slug)->delete();
            DB::statement("DROP SCHEMA IF EXISTS \"$schemaName\" CASCADE");
            Log::error("Échec Propulsion [$slug]: " . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * ÉTAPE 3 : APP STORE (Fusion JSON + DB)
     * C'est cette méthode qui envoie les prix et designs au Frontend
     */
    public function getModules(Request $request, ModuleDiscoveryService $discovery)
    {
        $tenantSlug = $request->header('X-Tenant');
        
        // 1. On récupère le design et les prix depuis les fichiers JSON
        $availableModules = $discovery->getAllAvailableModules();

        // 2. On vérifie les abonnements dans la DB du tenant
        // Note: Assure-toi que ton middleware a bien défini le search_path sur le bon schéma
        $subscriptions = [];
        if (Schema::hasTable('modules')) {
            $subscriptions = DB::table('modules')
                ->where('is_subscribed', true)
                ->pluck('name')
                ->toArray();
        }

        // 3. Fusion des données
        $finalModules = array_map(function($mod) use ($subscriptions) {
            $mod['is_subscribed'] = in_array($mod['name'], $subscriptions);
            return $mod;
        }, $availableModules);

        return response()->json($finalModules);
    }

    private function migrateTenantTables($sector, $fullName)
    {
        // Table Users
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('role')->default('user');
            $table->timestamps();
        });

        // Table Modules (Statut de l'App Store)
        Schema::create('modules', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->boolean('is_subscribed')->default(false);
            $table->timestamps();
        });

        // Table Configs
        Schema::create('tenant_configs', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value');
            $table->timestamps();
        });

        // Table Sanctum
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

        // Activation automatique du module selon le secteur
        $defaultModule = ($sector === 'Logistique') ? 'Inventaire & Stock' : null;
        if ($defaultModule) {
            DB::table('modules')->insert([
                'name' => $defaultModule,
                'is_subscribed' => true,
                'created_at' => now()
            ]);
        }

        DB::table('tenant_configs')->insert([
            ['key' => 'business_sector', 'value' => $sector, 'created_at' => now()],
            ['key' => 'display_name', 'value' => $fullName, 'created_at' => now()],
        ]);
    }

    private function getAiInsights($name)
    {
        try {
            $pythonAiUrl = config('services.ai.url', 'https://ai-nexus.up.railway.app');
            $response = Http::timeout(3)->post($pythonAiUrl . '/analyze-tenant', ['tenant_name' => $name]);
            if ($response->successful()) {
                return response()->json(['exists' => false, 'message' => $response->json()['analysis']], 404);
            }
        } catch (\Exception $e) { Log::warning("IA Nexus Offline."); }

        return response()->json(['exists' => false, 'message' => "Identifiant [$name] disponible."], 404);
    }
}