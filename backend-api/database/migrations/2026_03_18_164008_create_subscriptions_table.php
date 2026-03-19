<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('subscriptions', function (Blueprint $table) {
        $table->id();
        // ID du tenant qui achète
        $table->string('tenant_id'); 
        // ID du module (ex: 'GestionStock', 'CRM')
        $table->string('module_id'); 
        // Statut (utile si tu veux gérer des suspensions de paiement plus tard)
        $table->string('status')->default('active'); 
        $table->timestamps();

        // Sécurité : Un tenant ne peut pas s'abonner deux fois au même module
        $table->unique(['tenant_id', 'module_id']);
        
        // Optionnel : Si tu as une table 'tenants', ajoute la clé étrangère
        // $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
