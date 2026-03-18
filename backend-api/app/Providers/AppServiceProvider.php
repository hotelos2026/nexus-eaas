<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Tenant;
use App\Observers\TenantObserver;
use Laravel\Sanctum\PersonalAccessToken; // <--- Ajoute ceci
use Laravel\Sanctum\Sanctum;             // <--- Ajoute ceci

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // 1. Gestion de la création automatique des schémas
        Tenant::observe(TenantObserver::class);

        // 2. FORCE Sanctum à utiliser le modèle standard 
        // Cela permet de s'assurer qu'il respecte la connexion 'default' 
        // que nous changeons dans le Middleware IdentifyTenant.
        Sanctum::usePersonalAccessTokenModel(PersonalAccessToken::class);
    }
}