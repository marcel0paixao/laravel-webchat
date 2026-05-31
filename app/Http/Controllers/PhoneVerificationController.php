<?php
namespace App\Http\Controllers;
use App\Services\SmsVerificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
class PhoneVerificationController extends Controller
{
    public function notice(Request $request, SmsVerificationService $sms)
    {
        if (!$request->user()->hasVerifiedPhone()) { $sms->send($request->user()); }
        return Inertia::render('Auth/VerifyPhone', ['phone' => $request->user()->phone]);
    }
    public function resend(Request $request, SmsVerificationService $sms)
    {
        $sms->send($request->user());
        return back()->with('status', 'Verification code sent.');
    }
    public function verify(Request $request, SmsVerificationService $sms)
    {
        $validated = $request->validate(['code' => ['required','digits:6']]);
        if (!$sms->verify($request->user(), $validated['code'])) {
            return back()->withErrors(['code' => 'Invalid or expired code.']);
        }
        return redirect()->route('Home');
    }
}
