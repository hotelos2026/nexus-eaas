<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TenantController extends Controller
{
    /**
     * Vérifie si une instance (schéma) existe.
     * Utilisé par la Landing Page pour rediriger ou non vers le login.
     */
    public function exists($name)
    {
        // Nettoyage du nom pour éviter les caractères bizarres
        $slug = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $name));
        $schemaName = 'tenant_' . $slug;

        try {
            // Requête native Postgres pour vérifier l'existence du schéma
            $exists = DB::select("
                SELECT schema_name 
                FROM information_schema.schemata 
                WHERE schema_name = ?
            ", [$schemaName]);

            if (!empty($exists)) {
                return response()->json([
                    'exists' => true,
                    'tenant' => $slug,
                    'message' => 'Instance trouvée'
                ], 200);
            }

            return response()->json([
                'exists' => false, 
                'message' => 'Cette instance n\'existe pas encore.'
            ], 404);

        } catch (\Exception $e) {
            return response()->json([
                'exists' => false,
                'message' => 'Erreur lors de la vérification du serveur.'
            ], 500);
        }
    }
}