<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Symfony\Component\HttpFundation\Response;
use Illuminate\Support\Facades\{
    Auth
};

class UserController extends Controller
{
    public function index()
    {
        return response()->json([
            'users' => User::where('id', '!=', Auth::id())->get()
        ], 200);
    }
}
