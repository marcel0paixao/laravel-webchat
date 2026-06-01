<?php

namespace App\Events;

use App\Models\AppNotification;
use App\Models\UserBlock;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserNotificationSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $notification;

    public function __construct(AppNotification $notification)
    {
        $this->notification = $notification->loadMissing('actor');
    }

    public function broadcastWhen(): bool
    {
        $actorId = $this->notification->actor_id;
        if (!$actorId) {
            return true;
        }

        return ! UserBlock::between((int) $this->notification->user_id, (int) $actorId);
    }

    public function broadcastOn()
    {
        return new PrivateChannel('user.' . $this->notification->user_id);
    }

    public function broadcastAs()
    {
        return 'UserNotification';
    }

    public function broadcastWith()
    {
        return ['notification' => $this->notification->toArray()];
    }
}
