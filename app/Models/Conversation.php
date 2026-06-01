<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
class Conversation extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = ['hash', 'type', 'direct_hash', 'name', 'avatar_path', 'banned_at', 'ban_reason', 'created_by'];
    protected $casts = ['banned_at' => 'datetime'];
    protected static function booted()
    {
        static::creating(function (Conversation $conversation) {
            $conversation->hash ??= Str::lower(Str::random(24));
        });
    }
    public static function directHash(int $a, int $b): string { $ids = [$a, $b]; sort($ids); return implode(':', $ids); }
    public function participants() { return $this->hasMany(ConversationParticipant::class); }
    public function messages() { return $this->hasMany(Message::class); }
    public function users() { return $this->belongsToMany(User::class, 'conversation_participants')->withPivot(['role', 'last_read_at', 'left_at']); }
}
