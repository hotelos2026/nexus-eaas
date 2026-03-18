<?php

namespace App\Services;

use Illuminate\Support\Facades\File;

class ModuleDiscoveryService
{
    public function getAllAvailableModules($filterSector = null)
{
    $modulesPath = base_path('Modules');
    $modules = [];

    // 1. On récupère les dossiers de secteurs (Logistique, Academique...)
    $sectors = File::directories($modulesPath);

    foreach ($sectors as $sectorPath) {
        $sectorName = basename($sectorPath); // ex: Logistique

        // 2. On scanne les modules à l'intérieur de ce secteur
        $moduleDirs = File::directories($sectorPath);

        foreach ($moduleDirs as $modulePath) {
            $jsonPath = $modulePath . '/module.json';

            if (File::exists($jsonPath)) {
                $config = json_decode(File::get($jsonPath), true);
                
                // On garde le secteur défini par le dossier parent
                $moduleCategory = $sectorName;

                // Filtrage par secteur du client
                if ($filterSector && !in_array($moduleCategory, [$filterSector, 'Shared'])) {
                    continue;
                }

                $modules[] = [
                    'id'       => basename($modulePath),
                    'name'     => $config['name'] ?? basename($modulePath),
                    'category' => $moduleCategory, // Logistique, etc.
                    'icon'     => $config['icon'] ?? 'Package'
                ];
            }
        }
    }
    return $modules;
}
}