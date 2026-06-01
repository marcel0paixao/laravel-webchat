<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
class UserBlock extends Model
{
    use HasFactory;
    protected $fillable = ['blocker_id','blocked_id'];

    public static function blocks(int $blockerId, int $blockedId): bool
    {
        return static::where('blocker_id', $blockerId)->where('blocked_id', $blockedId)->exists();
    }

    public static function between(int $a, int $b): bool
    {
        return static::blocks($a, $b) || static::blocks($b, $a);
    }
}
