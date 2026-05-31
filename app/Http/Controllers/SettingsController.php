<?php
namespace App\Http\Controllers;

use Inertia\Inertia;

class SettingsController extends Controller
{
    public function privacy()
    {
        return Inertia::render('Settings/Privacy');
    }
}
