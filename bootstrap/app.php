<?php

use App\Http\Middleware\CheckUserStatus;
use App\Http\Middleware\EnsureAccountIsActive;
use App\Http\Middleware\RedirectIfAuthenticated;
use App\Http\Middleware\RoleMiddleware;
use App\Http\Middleware\SecurityHeaders;
use App\Http\Middleware\SetLocale;
use App\Http\Middleware\SetSport;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'role' => RoleMiddleware::class,
            'status' => CheckUserStatus::class,
            'guest' => RedirectIfAuthenticated::class,
            'active' => EnsureAccountIsActive::class,
        ]);

        $middleware->append(SecurityHeaders::class);

        $middleware->web(append: [
            SetLocale::class,
            SetSport::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
