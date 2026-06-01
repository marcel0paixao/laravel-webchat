<?php

namespace App\Http\Controllers\Api;

use App\Events\Chat\MessagesRead;
use App\Events\Chat\SendMessage;
use App\Http\Controllers\Controller;
use App\Models\{Conversation, ConversationParticipant, Friendship, Message, MessageStatus, User, UserBlock};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, Event, Storage};

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'conversation_hash' => ['nullable', 'string', 'exists:conversations,hash'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'before_id' => ['nullable', 'integer', 'exists:messages,id'],
        ]);
        $currentUserId = Auth::id();

        if (!empty($validated['conversation_hash'])) {
            $conversation = $this->conversationForUser($validated['conversation_hash'], true);
        } else {
            $otherUserId = (int) $validated['user_id'];
            if (!Friendship::areFriends($currentUserId, $otherUserId)) {
                return response()->json(['message' => 'You can only chat with friends.'], 403);
            }
            $conversation = self::directConversationFor($currentUserId, $otherUserId);
        }

        $messages = Message::query()
            ->with('attachments', 'statuses', 'sender')
            ->where('conversation_id', $conversation->id)
            ->when(!empty($validated['before_id']), fn($q) => $q->where('id', '<', $validated['before_id']))
            ->latest()
            ->limit(30)
            ->get()
            ->reverse()
            ->values();

        if (empty($validated['before_id'])) {
            $this->markIncomingAsRead($conversation, $currentUserId);
            $this->broadcastReadReceipt($conversation);
            $messages->each(fn(Message $message) => $message->load('statuses'));
        }

        return response()->json(['messages' => $messages, 'has_more' => $messages->count() === 30]);
    }

    public function read(Request $request)
    {
        $validated = $request->validate(['conversation_hash' => ['required', 'string', 'exists:conversations,hash']]);
        $conversation = $this->conversationForUser($validated['conversation_hash'], true);
        $this->markIncomingAsRead($conversation, Auth::id());
        $this->broadcastReadReceipt($conversation);

        return response()->noContent();
    }

    public function store(Request $request)
    {
        $request->merge(['message' => trim((string) $request->input('message'))]);
        $validated = $request->validate([
            'message' => ['nullable', 'string', 'max:65535'],
            'conversation_hash' => ['nullable', 'string', 'exists:conversations,hash'],
            'to' => ['nullable', 'integer', 'exists:users,id', 'not_in:' . Auth::id()],
            'attachments' => ['nullable', 'array', 'max:4'],
            'attachments.*' => ['file', 'max:51200', 'mimetypes:image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,audio/mpeg,audio/mp4,audio/wav,audio/webm,application/pdf'],
        ]);

        $attachments = array_filter((array) $request->file('attachments', []));
        if (($validated['message'] ?? '') === '' && count($attachments) === 0) {
            return response()->json(['message' => 'Message or attachment is required.'], 422);
        }

        if (!empty($validated['conversation_hash'])) {
            $conversation = $this->conversationForUser($validated['conversation_hash']);
            $to = $conversation->type === 'direct'
                ? (int) $conversation->participants()->where('user_id', '!=', Auth::id())->value('user_id')
                : null;
            if ($to && !Friendship::areFriends(Auth::id(), $to)) {
                return response()->json(['message' => 'You can only chat with friends.'], 403);
            }
        } else {
            $to = (int) $validated['to'];
            if (!Friendship::areFriends(Auth::id(), $to)) {
                return response()->json(['message' => 'You can only chat with friends.'], 403);
            }
            $conversation = self::directConversationFor(Auth::id(), $to);
        }
        if ($to && $this->isBlocked(Auth::id(), $to)) {
            return response()->json(['message' => 'This conversation is blocked.'], 403);
        }

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'from' => Auth::id(),
            'to' => $to ?: Auth::id(),
            'message' => $validated['message'] ?: '',
            'type' => count($attachments) > 0 ? (($validated['message'] ?? '') !== '' ? 'mixed' : 'attachment') : 'text',
        ]);

        foreach ($attachments as $attachment) {
            $this->storeAttachment($message, $attachment);
        }

        $conversation->participants()->where('user_id', '!=', Auth::id())->whereNull('left_at')->get()->each(function ($participant) use ($message) {
            MessageStatus::firstOrCreate(['message_id' => $message->id, 'user_id' => $participant->user_id], ['delivered_at' => now()]);
        });
        $message->load('attachments', 'statuses', 'sender', 'conversation');
        $conversation->participants()->where('user_id', '!=', Auth::id())->whereNull('left_at')->get()->each(function ($participant) use ($message) {
            Event::dispatch(new SendMessage($message, $participant->user_id));
        });

        return response()->json(['message' => $message], 201);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $currentUserId = Auth::id();
        Message::where(fn($query) => $query
            ->where(fn($query) => $query->where('from', $user->id)->where('to', $currentUserId))
            ->orWhere(fn($query) => $query->where('from', $currentUserId)->where('to', $user->id)))
            ->delete();
        return response()->noContent();
    }

    public static function last_messages()
    {
        $last = [];
        $currentUserId = Auth::id();
        $messages = Message::with('attachments')->where(fn($query) => $query->where('from', $currentUserId)->orWhere('to', $currentUserId))->latest()->get();
        foreach ($messages as $message) {
            $id = (int) $message->from === (int) $currentUserId ? $message->to : $message->from;
            $last[$id] ??= $message;
        }
        return $last;
    }

    public static function directConversationFor(int $currentUserId, int $otherUserId): Conversation
    {
        $conversation = Conversation::firstOrCreate(['direct_hash' => Conversation::directHash($currentUserId, $otherUserId)], ['type' => 'direct', 'created_by' => $currentUserId]);
        foreach ([$currentUserId, $otherUserId] as $userId) {
            ConversationParticipant::firstOrCreate(['conversation_id' => $conversation->id, 'user_id' => $userId], ['role' => $userId === $conversation->created_by ? 'owner' : 'member', 'joined_at' => now()]);
        }
        return $conversation;
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

    private function storeAttachment(Message $message, $attachment): void
    {
        $mime = $attachment->getMimeType();
        $media = explode('/', (string) $mime)[0] ?? 'file';
        if (!in_array($media, ['image', 'video', 'audio'], true)) { $media = 'file'; }
        $dimensions = $media === 'image' ? @getimagesize($attachment->getRealPath()) : null;
        $disk = config('filesystems.chat_disk', env('CHAT_FILESYSTEM_DISK', 'minio'));
        $path = $attachment->store('chat/' . $message->conversation_id, $disk);
        $message->attachments()->create([
            'disk' => $disk,
            'path' => $path,
            'original_name' => $attachment->getClientOriginalName(),
            'mime_type' => $mime,
            'size' => $attachment->getSize() ?? 0,
            'media_type' => $media,
            'width' => is_array($dimensions) ? $dimensions[0] : null,
            'height' => is_array($dimensions) ? $dimensions[1] : null,
            'expires_at' => now()->addWeek(),
        ]);
    }

    private function markIncomingAsRead(Conversation $conversation, int $currentUserId): void
    {
        ConversationParticipant::where('conversation_id', $conversation->id)
            ->where('user_id', $currentUserId)
            ->update(['last_read_at' => now()]);

        $incomingIds = Message::where('conversation_id', $conversation->id)
            ->where('from', '!=', $currentUserId)
            ->pluck('id');

        if ($incomingIds->isEmpty()) {
            return;
        }

        $now = now();
        MessageStatus::whereIn('message_id', $incomingIds)
            ->where('user_id', $currentUserId)
            ->update(['delivered_at' => $now, 'read_at' => $now]);

        $existing = MessageStatus::whereIn('message_id', $incomingIds)
            ->where('user_id', $currentUserId)
            ->pluck('message_id');

        foreach ($incomingIds->diff($existing) as $messageId) {
            MessageStatus::create([
                'message_id' => $messageId,
                'user_id' => $currentUserId,
                'delivered_at' => $now,
                'read_at' => $now,
            ]);
        }
    }

    private function isBlocked(int $a, int $b): bool
    {
        return UserBlock::where(fn($q) => $q->where('blocker_id', $a)->where('blocked_id', $b))
            ->orWhere(fn($q) => $q->where('blocker_id', $b)->where('blocked_id', $a))->exists();
    }

    private function broadcastReadReceipt(Conversation $conversation): void
    {
        $conversation->participants()->where('user_id', '!=', Auth::id())->whereNull('left_at')->pluck('user_id')
            ->each(fn($userId) => Event::dispatch(new MessagesRead($conversation->hash, Auth::id(), (int) $userId)));
    }
}
