<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\{Friendship, User, UserBlock};
use Illuminate\Support\Facades\Auth;
class UserBlockController extends Controller
{
    public function index()
    {
        $users = UserBlock::with('blocked')
            ->where('blocker_id', Auth::id())
            ->latest()
            ->get()
            ->map(fn($block) => $block->blocked)
            ->filter()
            ->values();

        return response()->json(['users' => $users]);
    }

    public function store(int $id)
    {
        abort_if((bool) Auth::user()?->is_admin, 403);
        abort_if((int)Auth::id() === $id || !User::whereKey($id)->exists(), 404);
        Friendship::between(Auth::id(), $id)->delete();
        UserBlock::firstOrCreate(['blocker_id' => Auth::id(), 'blocked_id' => $id]);
        return response()->json([
            'message' => 'User blocked.',
            'is_blocked_by_me' => true,
            'friendship_status' => null,
            'friendship_direction' => null,
        ], 201);
    }
    public function destroy(int $id)
    {
        UserBlock::where('blocker_id', Auth::id())->where('blocked_id', $id)->delete();
        return response()->json([
            'message' => 'User unblocked.',
            'is_blocked_by_me' => false,
            'friendship_status' => null,
            'friendship_direction' => null,
        ]);
    }
}
