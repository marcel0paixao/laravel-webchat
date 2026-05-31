<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;
class TouchUserLastSeen
{
    public function handle(Request $request, Closure $next)
    {
        if ($user = $request->user()) {
            if ($user->last_seen_at === null || $user->last_seen_at->lt(now()->subSeconds(30))) {
                $user->forceFill(['last_seen_at' => now()])->saveQuietly();
            }
        }
        return $next($request);
    }
}
