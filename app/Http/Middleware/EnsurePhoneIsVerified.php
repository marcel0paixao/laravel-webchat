<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;
class EnsurePhoneIsVerified
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->user() && !$request->user()->hasVerifiedPhone()) {
            return $request->expectsJson()
                ? response()->json(['message' => 'Phone verification required.'], 409)
                : redirect()->route('phone.notice');
        }
        return $next($request);
    }
}
