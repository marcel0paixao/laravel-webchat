<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class BannedController extends Controller
{
    public function __invoke()
    {
        abort_unless(auth()->user()?->banned_at, 404);

        return Inertia::render('Banned', [
            'ban' => [
                'reason' => auth()->user()->ban_reason,
                'details' => auth()->user()->ban_details,
                'banned_at' => auth()->user()->banned_at,
            ],
        ]);
    }
}
