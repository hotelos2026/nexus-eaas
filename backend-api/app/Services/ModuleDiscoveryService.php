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
        if (!File::exists($modulesPath)) return [];
        
        $sectors = File::directories($modulesPath);

        foreach ($sectors as $sectorPath) {
            $sectorName = basename($sectorPath);

            // 2. On scanne les modules à l'intérieur de ce secteur
            $moduleDirs = File::directories($sectorPath);

            foreach ($moduleDirs as $modulePath) {
                $jsonPath = $modulePath . '/module.json';

                if (File::exists($jsonPath)) {
                    $config = json_decode(File::get($jsonPath), true);
                    
                    $moduleCategory = $sectorName;

                    // Filtrage par secteur du client
                    if ($filterSector && !in_array($moduleCategory, [$filterSector, 'Shared'])) {
                        continue;
                    }

                    // --- LA CORRECTION EST ICI ---
                    // On ajoute TOUS les champs nécessaires pour le Frontend
                    $modules[] = [
                        'id'                    => basename($modulePath),
                        'slug'                  => basename($modulePath), // Utile pour les imports dynamiques
                        'name'                  => $config['name'] ?? basename($modulePath),
                        'category'              => $moduleCategory,
                        'description'           => $config['description'] ?? 'Aucune description disponible.',
                        'price_per_month'       => $config['price_per_month'] ?? 0,
                        'promo_price_per_month' => $config['promo_price_per_month'] ?? null,
                        'currency'              => $config['currency'] ?? 'Ar',
                        'icon'                  => $config['icon'] ?? 'Package',
                        'color'                 => $config['color'] ?? '#6366f1', // Couleur par défaut (Indigo)
                        'is_promo'              => $config['is_promo'] ?? false,
                    ];
                }
            }
        }
        return $modules;
    }
}