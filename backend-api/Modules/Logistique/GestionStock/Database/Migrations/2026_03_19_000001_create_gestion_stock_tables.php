<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        // 1. Les Dépôts (Warehouses)
        Schema::create('inventory_warehouses', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index(); // Ségrégation Multi-tenant
            $table->string('name');
            $table->string('location')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Le Stock (Lien entre Produit global et Dépôt local)
        Schema::create('inventory_stocks', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->unsignedBigInteger('product_id'); // ID de ton catalogue général
            $table->foreignId('warehouse_id')->constrained('inventory_warehouses')->onDelete('cascade');
            $table->integer('quantity')->default(0);
            $table->integer('alert_level')->default(5); // Seuil de réapprovisionnement
            $table->timestamps();

            // Un produit ne peut avoir qu'une ligne de stock par dépôt
            $table->unique(['product_id', 'warehouse_id']);
        });

        // 3. Les Mouvements (Historique immuable)
        Schema::create('inventory_movements', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->foreignId('stock_id')->constrained('inventory_stocks')->onDelete('cascade');
            $table->enum('type', ['IN', 'OUT', 'ADJUST', 'TRANSFER']);
            $table->integer('quantity');
            $table->integer('old_quantity');
            $table->integer('new_quantity');
            $table->string('reference')->nullable(); // N° Bon de commande / Facture
            $table->string('reason')->nullable();    // Ex: "Casse", "Vente", "Réception"
            $table->unsignedBigInteger('user_id');   // Qui a fait l'action
            $table->timestamps();
        });
    }

    public function down() {
        Schema::dropIfExists('inventory_movements');
        Schema::dropIfExists('inventory_stocks');
        Schema::dropIfExists('inventory_warehouses');
    }
};