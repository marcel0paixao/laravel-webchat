<?php
namespace App\Http\Controllers\Api;

use App\Events\Chat\SendMessage;
use App\Events\UserNotificationSent;
use App\Http\Controllers\Controller;
use App\Models\{AppNotification, Conversation, ConversationParticipant, Friendship, Message, User, UserBlock, UserReport};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Event;

class ConversationController extends Controller
{
    public function index()
    {
        $conversations = Conversation::query()
            ->whereHas('participants', fn($q) => $q->where('user_id', Auth::id()))
            ->with('users')
            ->get()
            ->map(fn(Conversation $conversation) => $this->serialize($conversation))
            ->sortByDesc(fn($conversation) => $conversation['last_message']['created_at'] ?? '')
            ->values();

        return response()->json(['conversations' => $conversations]);
    }

    public function show(string $hash)
    {
        $conversation = $this->conversationForUser($hash, true)->load('users');
        return response()->json(['conversation' => $this->serialize($conversation)]);
    }

    public function direct(User $user)
    {
        abort_if((int) $user->id === (int) Auth::id(), 422);
        abort_unless(Friendship::areFriends(Auth::id(), $user->id), 403);

        $conversation = MessageController::directConversationFor(Auth::id(), $user->id);
        return response()->json(['conversation' => $this->serialize($conversation->load('users'))]);
    }

    public function storeGroup(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'user_ids' => ['required', 'array', 'min:2', 'max:20'],
            'user_ids.*' => ['integer', 'exists:users,id'],
        ]);

        $memberIds = collect($validated['user_ids'])->map(fn($id) => (int) $id)->unique()->reject(fn($id) => $id === (int) Auth::id())->values();
        foreach ($memberIds as $memberId) {
            abort_unless(Friendship::areFriends(Auth::id(), $memberId), 403);
        }

        $conversation = Conversation::create(['type' => 'group', 'name' => $validated['name'], 'created_by' => Auth::id()]);
        ConversationParticipant::create(['conversation_id' => $conversation->id, 'user_id' => Auth::id(), 'role' => 'owner', 'joined_at' => now()]);
        foreach ($memberIds as $memberId) {
            ConversationParticipant::firstOrCreate(
                ['conversation_id' => $conversation->id, 'user_id' => $memberId],
                ['role' => 'member', 'joined_at' => now()]
            );
        }
        $message = $this->systemMessage($conversation, Auth::user()->name . ' created the group.');
        $this->broadcastConversationMessage($conversation, $message, collect([$conversation->created_by])->merge($memberIds)->values());
        foreach ($memberIds as $memberId) {
            $this->notify($memberId, 'group_added', Auth::user()->name . ' added you to ' . $conversation->name . '.', ['conversation_hash' => $conversation->hash]);
        }

        return response()->json(['conversation' => $this->serialize($conversation->load('users'))], 201);
    }

    public function updateGroup(Request $request, string $hash)
    {
        $conversation = $this->groupForUser($hash);
        abort_unless($this->currentRole($conversation) !== 'member', 403);
        $validated = $request->validate(['name' => ['required', 'string', 'max:80']]);
        $conversation->update(['name' => $validated['name']]);

        return response()->json(['conversation' => $this->serialize($conversation->fresh()->load('users'))]);
    }

    public function addMembers(Request $request, string $hash)
    {
        $conversation = $this->groupForUser($hash);
        abort_unless($this->currentRole($conversation) !== 'member', 403);
        $validated = $request->validate([
            'user_ids' => ['required', 'array', 'min:1', 'max:20'],
            'user_ids.*' => ['integer', 'exists:users,id'],
        ]);

        $activeIds = ConversationParticipant::where('conversation_id', $conversation->id)->whereNull('left_at')->pluck('user_id');
        $memberIds = collect($validated['user_ids'])
            ->map(fn($id) => (int) $id)
            ->unique()
            ->reject(fn($id) => $id === (int) Auth::id() || $activeIds->contains($id))
            ->values();
        abort_if($memberIds->isEmpty(), 422, 'Choose at least one user who is not already in this group.');

        foreach ($memberIds as $memberId) {
            abort_unless(Friendship::areFriends(Auth::id(), $memberId), 403);
        }

        $addedUsers = User::whereIn('id', $memberIds)->get();
        foreach ($memberIds as $memberId) {
            ConversationParticipant::updateOrCreate(
                ['conversation_id' => $conversation->id, 'user_id' => $memberId],
                ['role' => 'member', 'joined_at' => now(), 'left_at' => null]
            );
        }

        $names = $addedUsers->pluck('name')->join(', ', ' and ');
        $recipients = ConversationParticipant::where('conversation_id', $conversation->id)->whereNull('left_at')->pluck('user_id');
        $message = $this->systemMessage($conversation, Auth::user()->name . ' added ' . $names . ' to the group.');
        $this->broadcastConversationMessage($conversation, $message, $recipients);
        foreach ($memberIds as $memberId) {
            $this->notify($memberId, 'group_added', Auth::user()->name . ' added you to ' . $conversation->name . '.', ['conversation_hash' => $conversation->hash]);
        }

        return response()->json(['conversation' => $this->serialize($conversation->fresh()->load('users'))]);
    }

    public function promoteMember(string $hash, User $user)
    {
        $conversation = $this->groupForUser($hash);
        abort_unless($this->currentRole($conversation) !== 'member', 403);
        $participant = ConversationParticipant::where('conversation_id', $conversation->id)->where('user_id', $user->id)->whereNull('left_at')->firstOrFail();
        abort_if($participant->role === 'owner', 422);
        $participant->update(['role' => 'admin']);
        $recipients = ConversationParticipant::where('conversation_id', $conversation->id)->whereNull('left_at')->pluck('user_id');
        $message = $this->systemMessage($conversation, $user->name . ' is now an admin.');
        $this->broadcastConversationMessage($conversation, $message, $recipients);

        return response()->json(['conversation' => $this->serialize($conversation->fresh()->load('users'))]);
    }

    public function demoteMember(string $hash, User $user)
    {
        $conversation = $this->groupForUser($hash);
        abort_unless($this->currentRole($conversation) === 'owner', 403);
        $participant = ConversationParticipant::where('conversation_id', $conversation->id)->where('user_id', $user->id)->whereNull('left_at')->firstOrFail();
        abort_unless($participant->role === 'admin', 422);
        $participant->update(['role' => 'member']);
        $recipients = ConversationParticipant::where('conversation_id', $conversation->id)->whereNull('left_at')->pluck('user_id');
        $message = $this->systemMessage($conversation, $user->name . ' is no longer an admin.');
        $this->broadcastConversationMessage($conversation, $message, $recipients);

        return response()->json(['conversation' => $this->serialize($conversation->fresh()->load('users'))]);
    }

    public function removeMember(string $hash, User $user)
    {
        $conversation = $this->groupForUser($hash);
        abort_unless($this->currentRole($conversation) !== 'member', 403);
        $participant = ConversationParticipant::where('conversation_id', $conversation->id)->where('user_id', $user->id)->whereNull('left_at')->firstOrFail();
        abort_if($participant->role === 'owner', 422);
        $recipients = ConversationParticipant::where('conversation_id', $conversation->id)->whereNull('left_at')->pluck('user_id');
        $participant->update(['left_at' => now()]);
        $message = $this->systemMessage($conversation, $user->name . ' was removed from the group.');
        $this->broadcastConversationMessage($conversation, $message, $recipients);

        return response()->json(['conversation' => $this->serialize($conversation->fresh()->load('users'))]);
    }

    public function leaveGroup(string $hash)
    {
        $conversation = $this->groupForUser($hash);
        $participant = ConversationParticipant::where('conversation_id', $conversation->id)->where('user_id', Auth::id())->whereNull('left_at')->firstOrFail();
        $recipients = ConversationParticipant::where('conversation_id', $conversation->id)->whereNull('left_at')->pluck('user_id');
        $wasOwner = $participant->role === 'owner';
        $participant->update(['left_at' => now()]);
        $message = $this->systemMessage($conversation, Auth::user()->name . ' left the group.');
        $this->broadcastConversationMessage($conversation, $message, $recipients);

        if ($wasOwner) {
            $replacement = ConversationParticipant::where('conversation_id', $conversation->id)->whereNull('left_at')->inRandomOrder()->first();
            if ($replacement) {
                $replacement->update(['role' => 'owner']);
                $ownerName = User::find($replacement->user_id)?->name ?? 'A member';
                $ownerMessage = $this->systemMessage($conversation, $ownerName . ' is now the group owner.');
                $this->broadcastConversationMessage($conversation, $ownerMessage, $recipients);
            }
        }

        return response()->json(['conversation' => $this->serialize($conversation->fresh()->load('users'))]);
    }

    public function reportGroup(Request $request, string $hash)
    {
        $conversation = $this->conversationForUser($hash, true);
        abort_unless($conversation->type === 'group', 404);
        $validated = $request->validate(['reason' => ['required', 'string', 'max:120'], 'details' => ['nullable', 'string', 'max:2000']]);
        UserReport::create([
            'reporter_id' => Auth::id(),
            'reported_id' => $conversation->created_by ?: Auth::id(),
            'conversation_id' => $conversation->id,
            'target_type' => 'group',
            'reason' => $validated['reason'],
            'details' => $validated['details'] ?? null,
            'status' => 'open',
        ]);
        return response()->json(['message' => 'Report received.'], 201);
    }

    private function conversationForUser(string $hash, bool $allowFormerGroupMember = false): Conversation
    {
        return Conversation::where('hash', $hash)
            ->whereHas('participants', function ($q) use ($allowFormerGroupMember) {
                $q->where('user_id', Auth::id());
                if (!$allowFormerGroupMember) {
                    $q->whereNull('left_at');
                }
            })
            ->firstOrFail();
    }

    private function groupForUser(string $hash): Conversation
    {
        return Conversation::where('hash', $hash)
            ->where('type', 'group')
            ->whereHas('participants', fn($q) => $q->where('user_id', Auth::id())->whereNull('left_at'))
            ->firstOrFail();
    }

    private function currentRole(Conversation $conversation): string
    {
        return (string) ConversationParticipant::where('conversation_id', $conversation->id)->where('user_id', Auth::id())->whereNull('left_at')->value('role');
    }

    private function currentLeftAt(Conversation $conversation)
    {
        return ConversationParticipant::where('conversation_id', $conversation->id)->where('user_id', Auth::id())->value('left_at');
    }

    private function systemMessage(Conversation $conversation, string $text): Message
    {
        return Message::create([
            'conversation_id' => $conversation->id,
            'from' => Auth::id(),
            'to' => Auth::id(),
            'message' => $text,
            'type' => 'system',
        ])->load('attachments', 'statuses', 'sender', 'conversation');
    }

    private function broadcastConversationMessage(Conversation $conversation, Message $message, $recipientIds): void
    {
        collect($recipientIds)->unique()->each(fn($userId) => Event::dispatch(new SendMessage($message, (int) $userId)));
    }

    private function notify(int $userId, string $type, string $body, array $data): void
    {
        $notification = AppNotification::create([
            'user_id' => $userId,
            'actor_id' => Auth::id(),
            'type' => $type,
            'title' => 'Group update',
            'body' => $body,
            'data' => $data,
        ]);
        event(new UserNotificationSent($notification));
    }

    public function serialize(Conversation $conversation): array
    {
        $users = $conversation->users()->wherePivotNull('left_at')->get();
        $others = $users->where('id', '!=', Auth::id())->values();
        $last = Message::with('attachments', 'statuses', 'sender', 'conversation')
            ->where('conversation_id', $conversation->id)
            ->latest()
            ->first();
        $title = $conversation->type === 'group' ? ($conversation->name ?? 'Group') : ($others->first()?->name ?? 'Conversation');
        $partner = $conversation->type === 'direct' ? $others->first() : null;
        if ($partner) {
            $partner->is_blocked_by_me = UserBlock::blocks(Auth::id(), $partner->id);
            $partner->is_blocked_by_them = UserBlock::blocks($partner->id, Auth::id());
            $partner->friendship_status = ($partner->is_blocked_by_me || $partner->is_blocked_by_them)
                ? null
                : Friendship::between(Auth::id(), $partner->id)->value('status');
        }

        return [
            'id' => $conversation->id,
            'hash' => $conversation->hash,
            'type' => $conversation->type,
            'name' => $title,
            'avatar_path' => $conversation->avatar_path,
            'participants' => $users->values(),
            'partner' => $partner,
            'current_user_role' => $conversation->type === 'group' ? $this->currentRole($conversation) : null,
            'current_user_left_at' => $conversation->type === 'group' ? $this->currentLeftAt($conversation) : null,
            'banned_at' => $conversation->banned_at,
            'ban_reason' => $conversation->ban_reason,
            'last_message' => $last,
            'created_at' => $conversation->created_at,
            'updated_at' => $conversation->updated_at,
        ];
    }
}
