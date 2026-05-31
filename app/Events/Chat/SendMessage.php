<?php

namespace App\Events\Chat;

use App\Models\Message;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SendMessage implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $userNotification;

    public function __construct(Message $message, int $userNotification)
    {
        $this->message = $message;
        $this->userNotification = $userNotification;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('user.' . $this->userNotification);
    }

    public function broadcastAs()
    {
        return 'SendMessage';
    }

    public function broadcastWith()
    {
        return ['message' => $this->message->loadMissing('attachments', 'statuses', 'sender', 'conversation')->toArray()];
    }
}
