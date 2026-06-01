<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\{Friendship, User, UserBlock};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
class UserController extends Controller
{
    public function all()
    {
        $last = MessageController::last_messages();
        $blocked = $this->blockedIds();
        $friendIds = Friendship::where('status', Friendship::ACCEPTED)
            ->where(fn($q)=>$q->where('requester_id', Auth::id())->orWhere('addressee_id', Auth::id()))
            ->get()
            ->map(fn($f)=>(int)$f->requester_id === (int)Auth::id() ? $f->addressee_id : $f->requester_id)
            ->diff($blocked)
            ->values();
        $users = User::whereIn('id', $friendIds)->where('is_admin', false)->orderBy('name')->get();
        foreach ($users as $user) { $user->last_message = $last[$user->id] ?? null; $user->friendship_status = 'accepted'; }
        return response()->json(['users' => $users->sortByDesc(fn($u)=>$u->last_message ? $u->last_message->created_at->timestamp : 0)->values()]);
    }

    public function search(Request $request)
    {
        $validated = $request->validate(['handle' => ['nullable', 'string', 'max:32']]);
        $term = ltrim((string)($validated['handle'] ?? ''), '@');
        if ($term === '') {
            return response()->json(['users' => []]);
        }
        $users = User::where('id', '!=', Auth::id())
            ->where('is_admin', false)
            ->where('username', 'like', $term . '%')
            ->whereNotIn('id', $this->blockedIds())
            ->limit(20)
            ->get()
            ->map(fn(User $user)=>$this->withRelationship($user));
        return response()->json(['users' => $users]);
    }

    public function profile(string $username)
    {
        $user = User::where('username', ltrim($username, '@'))->firstOrFail();
        abort_if((int)$user->id === (int)Auth::id() || (bool)$user->is_admin, 404);
        return response()->json(['user' => $this->withRelationship($user)]);
    }

    private function withRelationship(User $user): User
    {
        $user->is_blocked_by_me = UserBlock::blocks(Auth::id(), $user->id);
        $user->is_blocked_by_them = UserBlock::blocks($user->id, Auth::id());
        $friendship = Friendship::between(Auth::id(), $user->id)->first();
        $user->friendship_status = ($user->is_blocked_by_me || $user->is_blocked_by_them) ? null : $friendship?->status;
        $user->friendship_direction = ($user->is_blocked_by_me || $user->is_blocked_by_them || !$friendship)
            ? null
            : ((int)$friendship->requester_id === (int)Auth::id() ? 'outgoing' : 'incoming');
        return $user;
    }

    private function blockedIds()
    {
        return UserBlock::where('blocker_id', Auth::id())->orWhere('blocked_id', Auth::id())->get()
            ->flatMap(fn($b)=>[$b->blocker_id, $b->blocked_id])->reject(fn($id)=>(int)$id === (int)Auth::id())->unique()->values();
    }
}
