<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PlayerController;
use App\Http\Controllers\SearchController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API routes - the foundation for a future native mobile app.
|--------------------------------------------------------------------------
| Token-based auth (Sanctum personal access tokens), not the cookie/SPA
| flow - a mobile client has no browser session to share. Every route here
| already exists in some form on the web; this just exposes the same data
| as clean, versioned-free JSON for a client that isn't a browser.
*/

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');

// The static /players/search path is registered before the dynamic
// /players/{player} one on purpose - Laravel matches routes in registration
// order, and a wildcard segment would otherwise swallow "search" as if it
// were a player slug and 404 via a failed route-model-binding lookup.
Route::get('/players/search', [SearchController::class, 'players'])->name('api.players.search');
Route::get('/players/{player}', [PlayerController::class, 'show']);

Route::get('/jobs', [JobController::class, 'index']);
Route::get('/jobs/{job_post}', [JobController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/notifications', [NotificationController::class, 'index']);
});
