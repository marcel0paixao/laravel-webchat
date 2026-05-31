<?php

namespace App\Events\Chat;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserTyping implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public int $from, public int $to, public string $name, public ?string $conversationHash = null) {}

    public function broadcastOn()
    {
        return new PrivateChannel('user.' . $this->to);
    }

    public function broadcastAs()
    {
        return 'UserTyping';
    }

    public function broadcastWith()
    {
        return ['from' => $this->from, 'to' => $this->to, 'name' => $this->name, 'conversation_hash' => $this->conversationHash];
    }
}
