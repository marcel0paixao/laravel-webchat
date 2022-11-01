<?php

namespace App\Http\Responses;

use Illuminate\Support\Facades\Auth;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{

    public function toResponse($request)
    {
        $user = Auth::user();
        $route = 'internal-home';

        if ($user->role_id > 1) {
            if (session()->exists('initial_action')) {
                $action = session()->get('initial_action');

                //TODO: create constants file
                if($action === 'post_job') {
                    $route = 'internal-home';
                } else if ($action === 'search_professional') {
                    $route = 'internal-home';
                }
            }

            session()->remove('initial_action');
        }

        return $request->wantsJson()
            ? response()->json(['two_factor' => false])
            : redirect()->route($route);
    }

}
