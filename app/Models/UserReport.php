<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'reporter_id', 'reported_id', 'conversation_id', 'target_type', 'reason', 'details',
        'status', 'resolution', 'reviewed_by', 'reviewed_at',
    ];

    protected $casts = ['reviewed_at' => 'datetime'];

    public function reporter() { return $this->belongsTo(User::class, 'reporter_id'); }
    public function reported() { return $this->belongsTo(User::class, 'reported_id'); }
    public function conversation() { return $this->belongsTo(Conversation::class); }
    public function reviewer() { return $this->belongsTo(User::class, 'reviewed_by'); }
}
