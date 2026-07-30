<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredAcademyController;
use App\Http\Controllers\Auth\RegisteredAgentController;
use App\Http\Controllers\Auth\RegisteredCoachController;
use App\Http\Controllers\Auth\RegisteredPlayerController;
use App\Http\Controllers\Auth\VerifyEmailController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('register', function () {
        return view('auth.register-choice');
    })->name('register');

    // Each role registers on a genuinely separate page per sport (8 total)
    // rather than one shared form with a sport toggle - each page only ever
    // shows that sport's fields (e.g. FIFA Connect ID vs FIBA MAP ID).
    Route::pattern('sport', 'football|basketball');

    Route::get('register/academy/{sport}', [RegisteredAcademyController::class, 'create'])->name('register.academy');
    Route::post('register/academy/{sport}', [RegisteredAcademyController::class, 'store'])->middleware('throttle:register');

    Route::get('register/agent/{sport}', [RegisteredAgentController::class, 'create'])->name('register.agent');
    Route::post('register/agent/{sport}', [RegisteredAgentController::class, 'store'])->middleware('throttle:register');

    Route::get('register/coach/{sport}', [RegisteredCoachController::class, 'create'])->name('register.coach');
    Route::post('register/coach/{sport}', [RegisteredCoachController::class, 'store'])->middleware('throttle:register');

    Route::get('register/player/{sport}', [RegisteredPlayerController::class, 'create'])->name('register.player');
    Route::post('register/player/{sport}', [RegisteredPlayerController::class, 'store'])->middleware('throttle:register');

    Route::get('login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');

    Route::post('login', [AuthenticatedSessionController::class, 'store'])
        ->middleware('throttle:login');

    Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])
        ->name('password.request');

    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])
        ->name('password.email');

    Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])
        ->name('password.reset');

    Route::post('reset-password', [NewPasswordController::class, 'store'])
        ->name('password.store');
});

Route::middleware('auth')->group(function () {
    Route::get('verify-email', EmailVerificationPromptController::class)
        ->name('verification.notice');

    Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::get('confirm-password', [ConfirmablePasswordController::class, 'show'])
        ->name('password.confirm');

    Route::post('confirm-password', [ConfirmablePasswordController::class, 'store']);

    Route::put('password', [PasswordController::class, 'update'])->name('password.update');

    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');
});
