<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/users',  [\App\Http\Controllers\Api\UserController::class, 'all'])->name('load.users');
    Route::group(['prefix' => 'messages'], function () {
        Route::get('/load',  [\App\Http\Controllers\Api\MessageController::class, 'index'])->name('load.messages');
        Route::post('/store',  [\App\Http\Controllers\Api\MessageController::class, 'store'])->name('store.messages');
        Route::delete('/delete/{id}',  [\App\Http\Controllers\Api\MessageController::class, 'destroy'])->name('destroy.messages');
    });
});
