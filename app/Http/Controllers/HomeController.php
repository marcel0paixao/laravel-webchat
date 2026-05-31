<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function home(?string $hash = null)
    {
        return Inertia::render('Home', ['conversationHash' => $hash]);
    }
}
