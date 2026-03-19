<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    // Indispensable pour autoriser l'insertion depuis le panier
    protected $fillable = [
        'tenant_id', 
        'module_id', 
        'status', 
        'expires_at'
    ];

    /**
     * Relation avec le Tenant
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Relation avec le Module
     */
    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }
}