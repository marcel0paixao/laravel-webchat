<?php

use App\Http\Controllers\{PhoneVerificationController, ProfileController, SettingsController};
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use Laravel\Fortify\Http\Controllers\RegisteredUserController;

Route::group(['middleware' => config('fortify.middleware', ['web'])], function () {
    if (Features::enabled(Features::registration()) && config('fortify.views', true)) {
        Route::get('/register', [RegisteredUserController::class, 'create'])->middleware(['guest:'.config('fortify.guard')])->name('register');
        Route::post('/register', [\App\Http\Controllers\RegistryController::class, 'register'])->middleware(['guest:'.config('fortify.guard')]);
    }
});

Route::get('/', fn() => auth()->check() ? redirect()->route('Home') : redirect()->route('login'));

Route::middleware(['auth:sanctum', config('jetstream.auth_session')])->group(function () {
    Route::get('/phone/verify', [PhoneVerificationController::class, 'notice'])->name('phone.notice');
    Route::post('/phone/verify', [PhoneVerificationController::class, 'verify'])->name('phone.verify');
    Route::post('/phone/resend', [PhoneVerificationController::class, 'resend'])->name('phone.resend');
});

Route::middleware(['auth:sanctum', config('jetstream.auth_session'), 'verified', 'phone.verified'])->group(function () {
    Route::get('/home', [\App\Http\Controllers\HomeController::class, 'home'])->name('Home');
    Route::get('/chat/{hash}', [\App\Http\Controllers\HomeController::class, 'home'])->name('chat.show');
    Route::get('/profiles', [ProfileController::class, 'search'])->name('profiles.search');
    Route::get('/@{username}', [ProfileController::class, 'show'])->name('profiles.show');
    Route::post('/profile', [ProfileController::class, 'update'])->name('profiles.update');
    Route::get('/settings/privacy', [SettingsController::class, 'privacy'])->name('settings.privacy');
});
