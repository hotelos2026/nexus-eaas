<?php

namespace App\Services;

use Illuminate\Support\Facades\File;

class ModuleDiscoveryService
{
    /**
     * Scanne récursivement le dossier Modules/Secteur/Module/module.json
     */
    public function getAllAvailableModules($tenantSector = null)
    {
        $path = base_path('Modules');
        $allModules = [];

        if (!File::exists($path)) return [];

        // 1. On récupère les Secteurs (Academic, Healthcare...)
        $sectors = File::directories($path);

        foreach ($sectors as $sectorPath) {
            // 2. On récupère les Modules dans chaque secteur
            $modules = File::directories($sectorPath);

            foreach ($modules as $modulePath) {
                $manifestPath = $modulePath . '/module.json';

                if (File::exists($manifestPath)) {
                    $config = json_decode(File::get($manifestPath), true);
                    
                    // 3. Filtrage Intelligent par Secteur
                    // On garde si : pas de filtre OU secteur match OU secteur 'Shared'
                    $isShared = basename($sectorPath) === 'Shared';
                    $matchesSector = $tenantSector && in_array($tenantSector, $config['compatible_sectors'] ?? []);

                    if (!$tenantSector || $isShared || $matchesSector) {
                        $allModules[] = array_merge($config, [
                            'path' => basename($modulePath),
                            'sector' => basename($sectorPath)
                        ]);
                    }
                }
            }
        }
        return $allModules;
    }
}