<?php

namespace App\Services;

use Illuminate\Support\Facades\File;

class ModuleDiscoveryService
{
    /**
     * Récupère les modules, avec un filtre optionnel par secteur.
     */
    public function getAllAvailableModules($filterSector = null)
    {
        $modulesPath = base_path('Modules');

        if (!File::exists($modulesPath)) {
            return [];
        }

        $modules = [];
        $directories = File::directories($modulesPath);

        foreach ($directories as $dirPath) {
            $dirName = basename($dirPath); // Ex: "Logistique", "Academique", "Shared"
            
            // On vérifie si on doit filtrer par secteur
            // On laisse toujours passer les modules du dossier 'Shared' (outils communs)
            if ($filterSector && !in_array($dirName, [$filterSector, 'Shared', 'shared'])) {
                continue;
            }

            // CAS 1 : module.json à la racine du secteur
            $rootJson = $dirPath . '/module.json';
            if (File::exists($rootJson)) {
                $modules[] = $this->parseModule($rootJson, $dirName, $dirPath);
            }

            // CAS 2 : module.json dans un sous-dossier (ex: Logistique/FleetControl)
            $subDirs = File::directories($dirPath);
            foreach ($subDirs as $subPath) {
                $subJson = $subPath . '/module.json';
                if (File::exists($subJson)) {
                    $modules[] = $this->parseModule($subJson, $dirName, $subPath);
                }
            }
        }

        return $modules;
    }

    private function parseModule($jsonPath, $category, $fullPath)
    {
        $config = json_decode(File::get($jsonPath), true);
        return [
            'name'        => $config['name'] ?? basename($fullPath),
            'description' => $config['description'] ?? 'Aucune description',
            'category'    => $category, 
            'path'        => $fullPath
        ];
    }
}