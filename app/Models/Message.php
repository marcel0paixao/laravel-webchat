<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Message extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = ['conversation_id', 'from', 'to', 'message', 'type', 'metadata'];
    protected $hidden = ['deleted_at'];
    protected $casts = ['metadata' => 'array'];

    public function attachments()
    {
        return $this->hasMany(MessageAttachment::class);
    }

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    public function statuses()
    {
        return $this->hasMany(MessageStatus::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'from');
    }
}
