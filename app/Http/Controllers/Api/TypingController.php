<?php
namespace App\Http\Controllers\Api;
use App\Events\Chat\UserTyping;
use App\Http\Controllers\Controller;
use App\Models\{Conversation, Friendship, UserBlock};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
class TypingController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'conversation_hash' => ['nullable', 'string', 'exists:conversations,hash'],
            'to' => ['nullable','integer','exists:users,id'],
        ]);
        if (!empty($validated['conversation_hash'])) {
            $conversation = Conversation::where('hash', $validated['conversation_hash'])
                ->whereHas('participants', fn($q) => $q->where('user_id', Auth::id())->whereNull('left_at'))
                ->firstOrFail();
            $conversation->participants()
                ->where('user_id', '!=', Auth::id())
                ->whereNull('left_at')
                ->pluck('user_id')
                ->each(function (int $id) {
                    if (UserBlock::between(Auth::id(), $id)) {
                        return;
                    }
                    event(new UserTyping(Auth::id(), $id, Auth::user()->name, $conversation->hash));
                });
            return response()->noContent();
        }
        $to = (int) $validated['to'];
        if (!Friendship::areFriends(Auth::id(), $to) || UserBlock::between(Auth::id(), $to)) {
            return response()->noContent();
        }
        event(new UserTyping(Auth::id(), $to, Auth::user()->name, null));
        return response()->noContent();
    }
}
