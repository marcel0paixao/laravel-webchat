<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Events\UserNotificationSent;
use App\Models\{AppNotification, Friendship, User, UserBlock};
use Illuminate\Support\Facades\Auth;
class FriendshipController extends Controller
{
    public function store(int $id)
    {
        abort_if((int)$id === (int)Auth::id() || !User::whereKey($id)->exists(), 404);
        abort_if(UserBlock::between(Auth::id(), $id), 403, 'You cannot send a friend request to this user.');
        $existing = Friendship::between(Auth::id(), $id)->first();
        if ($existing) { return response()->json(['friendship' => $existing->fresh()], 200); }
        $friendship = Friendship::create(['requester_id' => Auth::id(), 'addressee_id' => $id, 'status' => Friendship::PENDING]);
        $this->notify($id, Auth::id(), 'friend_request_created', Auth::user()->name . ' sent you a friend request.', [
            'friendship_id' => $friendship->id,
            'profile_username' => Auth::user()->username,
        ]);
        return response()->json(['friendship' => $friendship], 201);
    }
    public function accept(int $id)
    {
        abort_if(UserBlock::between(Auth::id(), $id), 403, 'You cannot accept a friend request from this user.');
        $friendship = Friendship::where('requester_id', $id)
            ->where('addressee_id', Auth::id())
            ->where('status', Friendship::PENDING)
            ->firstOrFail();
        $friendship->update(['status' => Friendship::ACCEPTED, 'accepted_at' => now()]);
        $this->notify($id, Auth::id(), 'friend_request_accepted', Auth::user()->name . ' accepted your friend request.', [
            'friendship_id' => $friendship->id,
            'profile_username' => Auth::user()->username,
        ]);
        return response()->json(['friendship' => $friendship->fresh()]);
    }
    public function reject(int $id)
    {
        Friendship::where('requester_id', $id)
            ->where('addressee_id', Auth::id())
            ->where('status', Friendship::PENDING)
            ->delete();
        return response()->noContent();
    }
    public function destroy(int $id)
    {
        Friendship::between(Auth::id(), $id)->delete();
        return response()->noContent();
    }
    private function notify(int $userId, int $actorId, string $type, string $body, array $data): void
    {
        $notification = AppNotification::create([
            'user_id' => $userId,
            'actor_id' => $actorId,
            'type' => $type,
            'title' => $type === 'friend_request_created' ? 'Friend request' : 'Friend request accepted',
            'body' => $body,
            'data' => $data,
        ]);
        event(new UserNotificationSent($notification));
    }
}
