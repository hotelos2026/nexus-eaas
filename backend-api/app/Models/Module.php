<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug', 
        'name', 
        'category', 
        'description', 
        'price_per_month', 
        'promo_price_per_month', 
        'currency', 
        'icon', 
        'color', 
        'is_active'
    ];
}