<?php

namespace App\Http\Responses;

use Illuminate\Support\Facades\Auth;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{

    public function toResponse($request)
    {
        $user = Auth::user();
        $route = 'Home';

        //

        return $request->wantsJson()
            ? response()->json(['two_factor' => false])
            : redirect()->route($route);
    }

}
