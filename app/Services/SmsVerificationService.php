<?php
namespace App\Services;
use App\Models\SmsVerificationCode;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Aws\Sns\SnsClient;
class SmsVerificationService
{
    public function send(User $user): void
    {
        $code = (string) random_int(100000, 999999);
        SmsVerificationCode::where('user_id', $user->id)->whereNull('used_at')->update(['used_at' => now()]);
        SmsVerificationCode::create([
            'user_id' => $user->id,
            'phone' => (string) $user->phone,
            'code_hash' => Hash::make($code),
            'expires_at' => now()->addMinutes(10),
        ]);
        $message = "Your Webchats verification code is {$code}";
        if (config('services.sms.provider') === 'sns' && $user->phone) {
            $client = new SnsClient([
                'version' => 'latest',
                'region' => config('services.ses.region', 'us-east-1'),
                'credentials' => [
                    'key' => config('services.ses.key'),
                    'secret' => config('services.ses.secret'),
                ],
            ]);
            $client->publish(['PhoneNumber' => $user->phone, 'Message' => $message]);
            return;
        }
        Log::info('SMS verification code', ['user_id' => $user->id, 'phone' => $user->phone, 'code' => $code]);
    }

    public function verify(User $user, string $code): bool
    {
        $record = SmsVerificationCode::where('user_id', $user->id)
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->latest()
            ->first();
        if (!$record || !Hash::check($code, $record->code_hash)) {
            return false;
        }
        $record->update(['used_at' => now()]);
        $user->forceFill(['phone_verified_at' => now()])->save();
        return true;
    }
}
