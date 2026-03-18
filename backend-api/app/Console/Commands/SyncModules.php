<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use App\Models\Module;

class SyncModules extends Command
{
    /**
     * Le nom et la signature de la commande (ce que tu tapes dans le terminal).
     */
    protected $signature = 'modules:sync';

    /**
     * La description de la commande.
     */
    protected $description = 'Synchronise les fichiers module.json avec la base de données (Ar/Mois)';

    /**
     * Exécution de la commande.
     */
    public function handle()
    {
        $modulesPath = base_path('Modules');

        if (!File::exists($modulesPath)) {
            $this->error("Le dossier Modules n'existe pas !");
            return;
        }

        // 1. On scanne les secteurs (Logistique, Academique, etc.)
        $sectors = array_filter(glob($modulesPath . '/*'), 'is_dir');

        $count = 0;

        foreach ($sectors as $sectorPath) {
            $sectorName = basename($sectorPath);
            
            // 2. On scanne les modules à l'intérieur du secteur
            $moduleDirs = array_filter(glob($sectorPath . '/*'), 'is_dir');

            foreach ($moduleDirs as $modulePath) {
                $jsonFile = $modulePath . '/module.json';
                $slug = basename($modulePath);
                
                if (File::exists($jsonFile)) {
                    $jsonContent = File::get($jsonFile);
                    $data = json_decode($jsonContent, true);

                    // Vérification si le JSON est bien formé
                    if (json_last_error() !== JSON_ERROR_NONE) {
                        $this->warn("Erreur JSON ignorée dans le module : $slug");
                        continue;
                    }

                    // 3. Mise à jour ou Création dans la BDD
                    Module::updateOrCreate(
                        ['slug' => $slug], // On se base sur le nom du dossier comme ID unique
                        [
                            'name'                  => $data['name'] ?? $slug,
                            'category'              => $sectorName,
                            'description'           => $data['description'] ?? '',
                            'price_per_month'       => $data['price_per_month'] ?? 0,
                            'promo_price_per_month' => $data['promo_price_per_month'] ?? null,
                            'currency'              => 'Ar',
                            'icon'                  => $data['icon'] ?? 'Package',
                            'color'                 => $data['color'] ?? '#6366f1',
                            'is_active'             => true,
                        ]
                    );

                    $this->line("<info>✔</info> Module synchronisé : <comment>$slug</comment> ($sectorName)");
                    $count++;
                }
            }
        }

        $this->newLine();
        $this->info("Terminé ! $count modules ont été synchronisés avec succès (Devise : Ar/Mois).");
    }
}