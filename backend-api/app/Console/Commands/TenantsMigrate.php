<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;

class TenantsMigrate extends Command
{
    protected $signature = 'tenants:migrate';
    protected $description = 'Lance les migrations pour tous les schémas de locataires PostgreSQL';

    public function handle()
    {
        // 1. Récupérer tous les locataires depuis le schéma public
        $tenants = DB::table('tenants')->get();

        foreach ($tenants as $tenant) {
            $this->info("Migration de l'instance : {$tenant->domain} ({$tenant->database_schema})");

            // 2. Switcher le search_path pour ce locataire précisément
            DB::statement("SET search_path TO \"{$tenant->database_schema}\", public");

            // 3. Lancer la migration sur la connexion par défaut (qui pointe maintenant sur le bon schéma)
            Artisan::call('migrate', [
                '--path' => 'database/migrations/tenant',
                '--force' => true,
            ]);

            $this->comment(Artisan::output());
        }

        $this->info("Propulsion terminée pour tous les nodes Nexus.");
    }
}