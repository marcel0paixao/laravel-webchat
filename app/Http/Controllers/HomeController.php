<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function home(?string $hash = null)
    {
        if (auth()->user()?->is_admin) {
            return redirect()->route('admin.reports.index');
        }

        return Inertia::render('Home', ['conversationHash' => $hash]);
    }
}
