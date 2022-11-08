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
    Route::get('/users',  [\App\Http\Controllers\Api\UserController::class, 'index'])->name('load.users');
    Route::get('/messages',  [\App\Http\Controllers\Api\MessageController::class, 'index'])->name('load.messages');
    Route::post('/messages',  [\App\Http\Controllers\Api\MessageController::class, 'store'])->name('store.messages');
});
