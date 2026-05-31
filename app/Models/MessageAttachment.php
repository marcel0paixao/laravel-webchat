<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
class MessageAttachment extends Model
{
    use HasFactory;
    protected $fillable = ['message_id','disk','path','original_name','mime_type','size','media_type','width','height','duration_seconds','expires_at'];
    protected $casts = ['expires_at'=>'datetime'];
    protected $appends = ['url'];
    public function getUrlAttribute(): string { return Storage::disk($this->disk)->url($this->path); }
}
