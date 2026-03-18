<?php

namespace App\Services;

use Illuminate\Support\Facades\File;

class ModuleDiscoveryService
{
    public function getAllAvailableModules()
    {
        $modulesPath = base_path('Modules');

        if (!File::exists($modulesPath)) {
            return [];
        }

        $modules = [];
        $directories = File::directories($modulesPath);

        foreach ($directories as $dirPath) {
            $dirName = basename($dirPath);
            
            // CAS 1 : Le module.json est directement dans le dossier (ex: Modules/Logistique/module.json)
            $rootJson = $dirPath . '/module.json';
            if (File::exists($rootJson)) {
                $modules[] = $this->parseModule($rootJson, $dirName, $dirPath);
            }

            // CAS 2 : On cherche dans les sous-dossiers (ex: Modules/Academique/SchoolManager/module.json)
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

    /**
     * Extrait proprement les infos du fichier JSON
     */
    private function parseModule($jsonPath, $category, $fullPath)
    {
        $config = json_decode(File::get($jsonPath), true);
        return [
            'name'     => $config['name'] ?? basename($fullPath),
            'category' => $category, // Utilisé pour le select du frontend
            'path'     => $fullPath
        ];
    }
}