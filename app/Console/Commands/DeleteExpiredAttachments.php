<?php
namespace App\Console\Commands;
use App\Models\{MessageAttachment, PostMedia};
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
class DeleteExpiredAttachments extends Command
{
    protected $signature = 'attachments:prune-expired';
    protected $description = 'Delete expired temporary chat and post media from object storage.';
    public function handle(): int
    {
        $count = 0;
        foreach (MessageAttachment::whereNotNull('expires_at')->where('expires_at', '<=', now())->cursor() as $attachment) {
            Storage::disk($attachment->disk)->delete($attachment->path);
            $attachment->delete();
            $count++;
        }
        foreach (PostMedia::whereNotNull('expires_at')->where('expires_at', '<=', now())->cursor() as $media) {
            Storage::disk($media->disk)->delete($media->path);
            $media->delete();
            $count++;
        }
        $this->info("Deleted {$count} expired files.");
        return self::SUCCESS;
    }
}
