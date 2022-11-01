<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use Inertia\Inertia;
use Illuminate\Support\Facades\{
    Auth
};

use Laravel\Fortify\Http\Controllers\RegisteredUserController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

$verificationLimiter = config('fortify.limiters.verification', '6,1');
$limiter = config('fortify.limiters.login');


Route::group(['middleware' => config('fortify.middleware', ['web'])], function () use ($verificationLimiter, $limiter) {
    $enableViews = config('fortify.views', true);

    // Registration...
    if (Features::enabled(Features::registration())) {
        if ($enableViews) {
            Route::get(Lang::get('/register'), [RegisteredUserController::class, 'create'])
                ->middleware(['guest:'.config('fortify.guard')])
                ->name('register');
        }

        Route::post(Lang::get('/register'), [\App\Http\Controllers\RegistryController::class, 'register'])
            ->middleware(['guest:'.config('fortify.guard')]);
    }
});

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware([
    'auth:sanctum',
    config('jetstream.auth_session'),
    'verified',
])->group(function () {
    Route::get('/', function () {
        if (Auth::user()) {
            return Inertia::render('Home');
        }
        return Inertia::render('Welcome');
    })->name('root');
});
