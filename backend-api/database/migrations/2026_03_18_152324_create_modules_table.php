<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('modules', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique(); // ex: POS, GestionStock
            $table->string('name');
            $table->string('category'); // ex: Logistique
            $table->text('description')->nullable();
            
            // Prix en Ariary (15 chiffres pour les gros montants Ar)
            $table->decimal('price_per_month', 15, 2)->default(0);
            $table->decimal('promo_price_per_month', 15, 2)->nullable();
            $table->string('currency')->default('Ar');
            
            $table->string('icon')->default('Package');
            $table->string('color')->default('#6366f1');
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('modules');
    }
};