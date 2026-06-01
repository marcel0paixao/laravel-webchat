<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index()
    {
        $notifications = AppNotification::with('actor')
            ->where('user_id', Auth::id())
            ->latest()
            ->limit(30)
            ->get();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => AppNotification::where('user_id', Auth::id())->whereNull('read_at')->count(),
        ]);
    }

    public function read(AppNotification $notification)
    {
        abort_unless((int) $notification->user_id === (int) Auth::id(), 404);
        if ($notification->read_at === null) {
            $notification->update(['read_at' => now()]);
        }

        return response()->json(['notification' => $notification->fresh('actor')]);
    }

    public function clear()
    {
        AppNotification::where('user_id', Auth::id())->delete();
        return response()->noContent();
    }
}
