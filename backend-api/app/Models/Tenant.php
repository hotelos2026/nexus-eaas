<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tenant extends Model
{
    /**
     * FORCE la connexion au schéma central (public).
     * Même si le middleware bascule tout sur 'tenant', ce modèle 
     * doit toujours pointer sur la table globale des clients.
     */
    protected $connection = 'pgsql'; 

    protected $fillable = [
        'name',
        'domain',
        'database_schema',
        'business_type', // Recommandé pour filtrer l'App Store plus tard
        'is_active',     // Crucial pour couper l'accès à une instance
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}