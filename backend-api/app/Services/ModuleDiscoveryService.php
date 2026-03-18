<?php

namespace App\Services;

use Illuminate\Support\Facades\File;

class ModuleDiscoveryService
{
    public function getAllAvailableModules($filterSector = null)
    {
        $modulesPath = base_path('Modules');

        if (!File::exists($modulesPath)) {
            return [];
        }

        $modules = [];
        // On scanne directement les dossiers à la racine de /Modules
        $directories = File::directories($modulesPath);

        foreach ($directories as $modulePath) {
            $jsonPath = $modulePath . '/module.json';
            
            if (File::exists($jsonPath)) {
                $config = json_decode(File::get($jsonPath), true);
                
                // On récupère la catégorie dans le JSON (ex: "Academique" ou "Logistique")
                $moduleCategory = $config['category'] ?? 'Shared';

                // FILTRE : On laisse passer si :
                // 1. Aucun filtre n'est demandé
                // 2. OU le module est "Shared"
                // 3. OU le module correspond au secteur du client (ex: "Logistique")
                if ($filterSector && !in_array($moduleCategory, [$filterSector, 'Shared'])) {
                    continue;
                }

                $modules[] = [
                    'id'          => basename($modulePath), // Identifiant unique (nom du dossier)
                    'name'        => $config['name'] ?? basename($modulePath),
                    'category'    => $moduleCategory,
                    'description' => $config['description'] ?? '',
                    'icon'        => $config['icon'] ?? 'Package',
                ];
            }
        }

        return $modules;
    }
}