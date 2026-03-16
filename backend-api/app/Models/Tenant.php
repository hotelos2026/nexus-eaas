<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tenant extends Model
{
    // On autorise Laravel à remplir ces colonnes d'un coup
    protected $fillable = [
        'name',
        'domain',
        'database_schema',
    ];
}