<?php

namespace App\Http\Controllers\Admin;

use App\Events\UserNotificationSent;
use App\Http\Controllers\Controller;
use App\Models\{AppNotification, Conversation, Message, UserReport};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index()
    {
        $reports = UserReport::with(['reporter', 'reported', 'conversation'])
            ->latest()
            ->paginate(20)
            ->through(fn(UserReport $report) => $this->serialize($report));

        return Inertia::render('Admin/Reports/Index', ['reports' => $reports]);
    }

    public function show(UserReport $report)
    {
        $report->load(['reporter', 'reported', 'conversation']);
        $conversation = $this->conversationForReport($report);
        $messages = $conversation
            ? Message::with(['sender', 'attachments'])
                ->where('conversation_id', $conversation->id)
                ->latest()
                ->limit(80)
                ->get()
                ->reverse()
                ->values()
            : collect();

        return Inertia::render('Admin/Reports/Show', [
            'report' => $this->serialize($report),
            'conversation' => $conversation,
            'messages' => $messages,
        ]);
    }

    public function banUser(Request $request, UserReport $report)
    {
        abort_unless($report->reported, 404);
        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:255'],
            'details' => ['nullable', 'string', 'max:2000'],
        ]);
        $reason = $validated['reason'] ?? $report->reason ?? 'Moderation decision';
        $report->reported->forceFill([
            'banned_at' => now(),
            'ban_reason' => $reason,
            'ban_details' => $validated['details'] ?? $report->details,
        ])->save();
        $this->resolve($report, 'user_banned');
        $this->notify($report->reported_id, 'account_banned', 'Your account was banned: ' . $reason, ['report_id' => $report->id]);

        return back();
    }

    public function unbanUser(UserReport $report)
    {
        abort_unless($report->reported, 404);
        $report->reported->forceFill([
            'banned_at' => null,
            'ban_reason' => null,
            'ban_details' => null,
        ])->save();
        $this->resolve($report, 'user_unbanned');
        $this->notify($report->reported_id, 'account_unbanned', 'Your account was unbanned by moderation.', ['report_id' => $report->id]);

        return back();
    }

    public function banGroup(Request $request, UserReport $report)
    {
        $conversation = $this->conversationForReport($report);
        abort_unless($conversation && $conversation->type === 'group', 404);
        $validated = $request->validate(['reason' => ['nullable', 'string', 'max:255']]);
        $conversation->forceFill([
            'banned_at' => now(),
            'ban_reason' => $validated['reason'] ?? $report->reason ?? 'Moderation decision',
        ])->save();
        $this->resolve($report, 'group_banned');
        $conversation->participants()->whereNull('left_at')->pluck('user_id')
            ->each(fn($userId) => $this->notify((int) $userId, 'group_banned', $conversation->name . ' was banned by moderation.', ['conversation_hash' => $conversation->hash, 'report_id' => $report->id]));

        return back();
    }

    public function unbanGroup(UserReport $report)
    {
        $conversation = $this->conversationForReport($report);
        abort_unless($conversation && $conversation->type === 'group', 404);
        $conversation->forceFill(['banned_at' => null, 'ban_reason' => null])->save();
        $this->resolve($report, 'group_unbanned');
        $conversation->participants()->whereNull('left_at')->pluck('user_id')
            ->each(fn($userId) => $this->notify((int) $userId, 'group_unbanned', $conversation->name . ' was unbanned by moderation.', ['conversation_hash' => $conversation->hash, 'report_id' => $report->id]));

        return back();
    }

    public function dismiss(UserReport $report)
    {
        $this->resolve($report, 'dismissed');
        return back();
    }

    private function resolve(UserReport $report, string $resolution): void
    {
        $report->forceFill([
            'status' => 'resolved',
            'resolution' => $resolution,
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now(),
        ])->save();
    }

    private function conversationForReport(UserReport $report): ?Conversation
    {
        if ($report->conversation) {
            return $report->conversation;
        }
        $directHash = Conversation::directHash($report->reporter_id, $report->reported_id);
        return Conversation::where('direct_hash', $directHash)->first();
    }

    private function notify(int $userId, string $type, string $body, array $data): void
    {
        $notification = AppNotification::create([
            'user_id' => $userId,
            'actor_id' => Auth::id(),
            'type' => $type,
            'title' => 'Moderation update',
            'body' => $body,
            'data' => $data,
        ]);
        event(new UserNotificationSent($notification));
    }

    private function serialize(UserReport $report): array
    {
        return [
            'id' => $report->id,
            'target_type' => $report->target_type,
            'reason' => $report->reason,
            'details' => $report->details,
            'status' => $report->status ?? 'open',
            'resolution' => $report->resolution,
            'reviewed_at' => $report->reviewed_at,
            'reporter' => $report->reporter,
            'reported' => $report->reported,
            'conversation' => $report->conversation,
            'created_at' => $report->created_at,
        ];
    }
}
