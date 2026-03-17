<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TenantController extends Controller
{
    /**
     * Point d'entrée pour la validation d'instance (Nexus Finder).
     * Vérifie PostgreSQL, et si absent, interroge l'IA Python.
     */
    public function exists($name)
    {
        // 1. Normalisation stricte du nom (sécurité injection)
        $slug = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $name));
        
        if (strlen($slug) < 3) {
            return response()->json([
                'exists' => false,
                'message' => 'Le nom de l\'instance est trop court.'
            ], 422);
        }

        $schemaName = 'tenant_' . $slug;

        try {
            // 2. Requête système sur le dictionnaire de données PostgreSQL
            $exists = DB::select("
                SELECT schema_name 
                FROM information_schema.schemata 
                WHERE schema_name = ?
            ", [$schemaName]);

            // CAS A : L'instance est active et trouvée
            if (!empty($exists)) {
                return response()->json([
                    'exists' => true,
                    'tenant' => $slug,
                    'message' => 'Instance Nexus identifiée. Redirection...'
                ], 200);
            }

            // CAS B : Inconnu -> On délègue l'analyse à l'IA Python
            return $this->getAiInsights($name);

        } catch (\Exception $e) {
            Log::error("Erreur Critique Nexus Controller: " . $e->getMessage());
            return response()->json([
                'exists' => false,
                'message' => 'Le Nexus Core rencontre une difficulté technique. Réessayez.'
            ], 500);
        }
    }

    /**
     * Interroge le service IA (FastAPI) pour une réponse contextualisée.
     */
    private function getAiInsights($name)
    {
        try {
            // Récupération de l'URL depuis config/services.php ou .env
            $pythonAiUrl = config('services.ai.url', 'https://ai-nexus.up.railway.app');
            
            // Appel POST avec un timeout court pour ne pas bloquer l'UX
            $response = Http::timeout(4)->post($pythonAiUrl . '/analyze-tenant', [
                'tenant_name' => $name
            ]);

            if ($response->successful()) {
                $aiData = $response->json();
                return response()->json([
                    'exists' => false,
                    'message' => $aiData['analysis'], // Message généré par Python
                    'sector' => $aiData['metadata']['sector'] ?? 'Général'
                ], 404);
            }
        } catch (\Exception $e) {
            Log::warning("IA Service Offline ou Timeout pour: $name");
        }

        // Message de secours (Fallback) si Python ne répond pas
        return response()->json([
            'exists' => false,
            'message' => "Je ne trouve aucune instance active pour \"$name\". Souhaitez-vous provisionner cet espace maintenant ?"
        ], 404);
    }
}