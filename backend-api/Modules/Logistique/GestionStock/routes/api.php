<?php

use Illuminate\Support\Facades\Route;
use Modules\Logistique\GestionStock\Http\Controllers\StockController;

// On utilise le préfixe 'logistique' pour coller à ton code Frontend (api.get('/logistique/stock'))
Route::prefix('logistique')->group(function () {
    Route::get('/stock', [StockController::class, 'index']);
    Route::post('/stock/add', [StockController::class, 'move']); // 'move' gère l'ajout
});