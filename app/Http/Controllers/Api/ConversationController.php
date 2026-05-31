<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Conversation, ConversationParticipant, Friendship, Message, User};
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

    private function conversationForUser(string $hash): Conversation
    {
        return Conversation::where('hash', $hash)
            ->whereHas('participants', fn($q) => $q->where('user_id', Auth::id())->whereNull('left_at'))
            ->firstOrFail();
    }

    public function serialize(Conversation $conversation): array
    {
        $users = $conversation->users;
        $others = $users->where('id', '!=', Auth::id())->values();
        $last = Message::with('attachments', 'statuses', 'sender', 'conversation')
            ->where('conversation_id', $conversation->id)
            ->latest()
            ->first();
        $title = $conversation->type === 'group' ? ($conversation->name ?? 'Group') : ($others->first()?->name ?? 'Conversation');

        return [
            'id' => $conversation->id,
            'hash' => $conversation->hash,
            'type' => $conversation->type,
            'name' => $title,
            'avatar_path' => $conversation->avatar_path,
            'participants' => $users->values(),
            'partner' => $conversation->type === 'direct' ? $others->first() : null,
            'last_message' => $last,
            'created_at' => $conversation->created_at,
            'updated_at' => $conversation->updated_at,
        ];
    }
}
