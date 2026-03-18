<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Note: On ne force PAS de connexion ($connection) ici.
     * C'est le middleware IdentifyTenant qui bascule la connexion par défaut 
     * sur 'tenant' avant que ce modèle ne soit appelé.
     */

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',          // Ajouté : pour gérer les permissions (owner, admin, user)
        'is_active',     // Ajouté : pour suspendre un accès utilisateur spécifique
        'avatar_url',    // Ajouté : utile pour ton Header Next.js
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Helper pour vérifier rapidement le rôle dans les policies ou les routes.
     */
    public function isOwner(): bool
    {
        return $this->role === 'owner';
    }

    public function isAdmin(): bool
    {
        return in_array($this->role, ['owner', 'admin']);
    }
}