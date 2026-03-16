<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Tenant;             // <--- Ajoute ceci
use App\Observers\TenantObserver;   // <--- Ajoute ceci

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
        // C'EST ICI QUE LA MAGIE OPÈRE
        Tenant::observe(TenantObserver::class);
    }
}