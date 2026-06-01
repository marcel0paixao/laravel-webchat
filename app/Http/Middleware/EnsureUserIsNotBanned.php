<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureUserIsNotBanned
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        if ($user && $user->banned_at) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Your account is banned.', 'redirect' => route('banned')], 423);
            }
            if (!$request->routeIs('banned')) {
                return redirect()->route('banned');
            }
        }

        return $next($request);
    }
}
