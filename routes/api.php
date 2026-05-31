<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/user', fn(Request $request) => $request->user());

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/users', [\App\Http\Controllers\Api\UserController::class, 'all'])->name('load.users');
    Route::get('/conversations', [\App\Http\Controllers\Api\ConversationController::class, 'index'])->name('conversations.index');
    Route::get('/conversations/{hash}', [\App\Http\Controllers\Api\ConversationController::class, 'show'])->name('conversations.show');
    Route::post('/conversations/direct/{user}', [\App\Http\Controllers\Api\ConversationController::class, 'direct'])->name('conversations.direct');
    Route::post('/conversations/groups', [\App\Http\Controllers\Api\ConversationController::class, 'storeGroup'])->name('conversations.groups.store');
    Route::get('/profiles/search', [\App\Http\Controllers\Api\UserController::class, 'search'])->name('profiles.api.search');
    Route::get('/profiles/{username}', [\App\Http\Controllers\Api\UserController::class, 'profile'])->name('profiles.api.show');
    Route::post('/typing', [\App\Http\Controllers\Api\TypingController::class, 'store'])->name('typing.store');
    Route::prefix('messages')->group(function () {
        Route::get('/load', [\App\Http\Controllers\Api\MessageController::class, 'index'])->name('load.messages');
        Route::post('/store', [\App\Http\Controllers\Api\MessageController::class, 'store'])->name('store.messages');
        Route::delete('/delete/{id}', [\App\Http\Controllers\Api\MessageController::class, 'destroy'])->name('destroy.messages');
    });
    Route::prefix('friends')->group(function () {
        Route::post('/{id}', [\App\Http\Controllers\Api\FriendshipController::class, 'store'])->name('friends.store');
        Route::post('/{id}/accept', [\App\Http\Controllers\Api\FriendshipController::class, 'accept'])->name('friends.accept');
        Route::delete('/{id}/reject', [\App\Http\Controllers\Api\FriendshipController::class, 'reject'])->name('friends.reject');
        Route::delete('/{id}', [\App\Http\Controllers\Api\FriendshipController::class, 'destroy'])->name('friends.destroy');
    });
    Route::get('/notifications', [\App\Http\Controllers\Api\NotificationController::class, 'index'])->name('notifications.index');
    Route::prefix('blocks')->group(function () {
        Route::post('/{id}', [\App\Http\Controllers\Api\UserBlockController::class, 'store'])->name('block.users');
        Route::delete('/{id}', [\App\Http\Controllers\Api\UserBlockController::class, 'destroy'])->name('unblock.users');
    });
    Route::post('/reports/{id}', [\App\Http\Controllers\Api\UserReportController::class, 'store'])->name('reports.store');
});
