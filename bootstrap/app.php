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
use Illuminate\Http\Request;

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

        // Railway (like Heroku/Render/Fly) terminates TLS at its edge and
        // forwards to the container over plain HTTP, with the original
        // scheme/host/IP passed via X-Forwarded-* headers. Without this,
        // $request->secure() is always false behind that proxy - which
        // silently dropped the HSTS header (SecurityHeaders only sets it
        // when secure()) and made url()/asset() generate http:// links on
        // an https:// page. '*' is safe here because Railway's network
        // model means the container is never reachable except through
        // their edge - there's no direct path for a client to spoof these
        // headers by connecting straight to the app.
        $middleware->trustProxies(at: '*', headers: Request::HEADER_X_FORWARDED_FOR
            | Request::HEADER_X_FORWARDED_HOST
            | Request::HEADER_X_FORWARDED_PORT
            | Request::HEADER_X_FORWARDED_PROTO
            | Request::HEADER_X_FORWARDED_AWS_ELB);

        $middleware->append(SecurityHeaders::class);

        $middleware->web(append: [
            SetLocale::class,
            SetSport::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
