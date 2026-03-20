<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Active le support CORS
        $middleware->append(\Illuminate\Http\Middleware\HandleCors::class);

        // Enregistre l'alias du middleware Multi-tenant
        $middleware->alias([
            'tenant' => \App\Http\Middleware\IdentifyTenant::class,
        ]);

        // Définit l'ordre d'exécution (Priorité)
        $middleware->priority([
            \Illuminate\Http\Middleware\HandleCors::class,
            \App\Http\Middleware\IdentifyTenant::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
            \Illuminate\Auth\Middleware\Authenticate::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();