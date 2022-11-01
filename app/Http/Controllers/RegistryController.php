<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterRequest;
use Laravel\Fortify\Contracts\CreatesNewUsers;
use Laravel\Fortify\Contracts\RegisterResponse;
use Laravel\Fortify\Http\Controllers\RegisteredUserController;

class RegistryController extends RegisteredUserController
{
    /**
     * Create a new registered user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Laravel\Fortify\Contracts\CreatesNewUsers  $creator
     * @return \Laravel\Fortify\Contracts\RegisterResponse
     */
    public function register(RegisterRequest $request, CreatesNewUsers $creator): RegisterResponse
    {
        return $this->store($request, $creator);
    }
}
