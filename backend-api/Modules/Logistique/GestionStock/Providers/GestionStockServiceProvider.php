<?php

namespace Modules\Logistique\GestionStock\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;

class GestionStockServiceProvider extends ServiceProvider
{
    /**
     * Boot : Chargement des ressources du module
     */
    public function boot()
    {
        // 1. Charger les migrations automatiquement
        $this->loadMigrationsFrom(__DIR__ . '/../Database/Migrations');

        // 2. Charger les routes API avec le préfixe nexus
        $this->registerRoutes();
    }

    /**
     * Enregistrement des routes
     */
    protected function registerRoutes()
    {
        Route::prefix('api/nexus')
            ->middleware('api') // Applique le middleware standard (JSON, etc.)
            ->namespace('Modules\Logistique\GestionStock\Http\Controllers')
            ->group(__DIR__ . '/../routes/api.php');
    }

    public function register()
    {
        // Utile si tu as des Bindings ou des Singletons à enregistrer
    }
}