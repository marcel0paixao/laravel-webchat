<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Conversation, ConversationParticipant, Friendship, Message, User, UserBlock};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ConversationController extends Controller
{
    public function index()
    {
        $conversations = Conversation::query()
            ->whereHas('participants', fn($q) => $q->where('user_id', Auth::id())->whereNull('left_at'))
            ->with('users')
            ->get()
            ->map(fn(Conversation $conversation) => $this->serialize($conversation))
            ->sortByDesc(fn($conversation) => $conversation['last_message']['created_at'] ?? '')
            ->values();

        return response()->json(['conversations' => $conversations]);
    }

    public function show(string $hash)
    {
        $conversation = $this->conversationForUser($hash)->load('users');
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

    public function promoteMember(string $hash, User $user)
    {
        $conversation = $this->groupForUser($hash);
        abort_unless($this->currentRole($conversation) !== 'member', 403);
        $participant = ConversationParticipant::where('conversation_id', $conversation->id)->where('user_id', $user->id)->whereNull('left_at')->firstOrFail();
        abort_if($participant->role === 'owner', 422);
        $participant->update(['role' => 'admin']);

        return response()->json(['conversation' => $this->serialize($conversation->fresh()->load('users'))]);
    }

    public function removeMember(string $hash, User $user)
    {
        $conversation = $this->groupForUser($hash);
        abort_unless($this->currentRole($conversation) !== 'member', 403);
        $participant = ConversationParticipant::where('conversation_id', $conversation->id)->where('user_id', $user->id)->whereNull('left_at')->firstOrFail();
        abort_if($participant->role === 'owner', 422);
        $participant->update(['left_at' => now()]);

        return response()->json(['conversation' => $this->serialize($conversation->fresh()->load('users'))]);
    }

    public function leaveGroup(string $hash)
    {
        $conversation = $this->groupForUser($hash);
        $participant = ConversationParticipant::where('conversation_id', $conversation->id)->where('user_id', Auth::id())->whereNull('left_at')->firstOrFail();
        $wasOwner = $participant->role === 'owner';
        $participant->update(['left_at' => now()]);

        if ($wasOwner) {
            $replacement = ConversationParticipant::where('conversation_id', $conversation->id)->whereNull('left_at')->inRandomOrder()->first();
            if ($replacement) {
                $replacement->update(['role' => 'owner']);
            }
        }

        return response()->noContent();
    }

    private function conversationForUser(string $hash): Conversation
    {
        return Conversation::where('hash', $hash)
            ->whereHas('participants', fn($q) => $q->where('user_id', Auth::id())->whereNull('left_at'))
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
            'last_message' => $last,
            'created_at' => $conversation->created_at,
            'updated_at' => $conversation->updated_at,
        ];
    }
}
