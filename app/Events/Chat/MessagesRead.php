<?php

namespace App\Events\Chat;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessagesRead implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public string $conversationHash, public int $readerId, public int $notifyUserId)
    {
    }

    public function broadcastOn()
    {
        return new PrivateChannel('user.' . $this->notifyUserId);
    }

    public function broadcastAs()
    {
        return 'MessagesRead';
    }

    public function broadcastWith()
    {
        return ['conversation_hash' => $this->conversationHash, 'reader_id' => $this->readerId, 'read_at' => now()->toISOString()];
    }
}
