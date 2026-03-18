<?php

namespace App\Services;

use Illuminate\Support\Facades\File;

class ModuleDiscoveryService
{
    public function getAllAvailableModules()
    {
        // base_path('Modules') pointe à la RACINE du projet, pas dans app/
        $modulesPath = base_path('Modules');

        if (!File::exists($modulesPath)) {
            return [];
        }

        $modules = [];
        // On scanne les dossiers (ex: Academic, Healthcare)
        $categories = File::directories($modulesPath);

        foreach ($categories as $categoryPath) {
            $categoryName = basename($categoryPath);
            
            // On scanne les sous-modules (ex: SchoolManager)
            $subModules = File::directories($categoryPath);
            
            foreach ($subModules as $modulePath) {
                $jsonPath = $modulePath . '/module.json';
                
                if (File::exists($jsonPath)) {
                    $config = json_decode(File::get($jsonPath), true);
                    $modules[] = [
                        'name' => $config['name'] ?? basename($modulePath),
                        'category' => $categoryName, // C'est CA qui remplit ton select
                        'path' => $modulePath
                    ];
                }
            }
        }

        return $modules;
    }
}