<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\{Conversation, User, UserReport};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
class UserReportController extends Controller
{
    public function store(Request $request, int $id)
    {
        abort_if((int)Auth::id() === $id || !User::whereKey($id)->exists(), 404);
        $validated = $request->validate(['reason' => ['required','string','max:120'], 'details' => ['nullable','string','max:2000']]);
        $conversation = Conversation::where('direct_hash', Conversation::directHash(Auth::id(), $id))->first();
        UserReport::create([
            'reporter_id' => Auth::id(),
            'reported_id' => $id,
            'conversation_id' => $conversation?->id,
            'target_type' => 'user',
            'reason' => $validated['reason'],
            'details' => $validated['details'] ?? null,
            'status' => 'open',
        ]);
        return response()->json(['message' => 'Report received.'], 201);
    }
}
