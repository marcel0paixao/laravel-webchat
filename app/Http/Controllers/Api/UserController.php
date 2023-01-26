<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\{
    Controller, Api\MessageController
};
use Illuminate\Http\Request;
use App\Models\{User, Message};
use Symfony\Component\HttpFundation\Response;
use Illuminate\Support\Facades\{
    Auth, DB
};

class UserController extends Controller
{
    public function all()
    {
        $last_messages = MessageController::last_messages();
        foreach ($users = User::where('users.id', '!=', Auth::id())->get() as $key => $user) {
            $user->last_message = $last_messages[$user->id] ?? null;
        }
        return response()->json([
            'users' => $users
        ], 200);
    }
}
