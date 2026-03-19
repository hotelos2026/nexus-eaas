<?php

use Illuminate\Support\Facades\Route;
use Modules\Logistique\GestionStock\Http\Controllers\StockController;

Route::prefix('inventory')->group(function () {
    // CORRIGÉ : Utilisation de ::class et suppression du .php
    Route::get('/stocks', [StockController::class, 'index']);
    Route::post('/move', [StockController::class, 'move']);
});