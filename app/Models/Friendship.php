<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
class Friendship extends Model
{
    use HasFactory;
    public const PENDING = 'pending';
    public const ACCEPTED = 'accepted';
    protected $fillable = ['requester_id','addressee_id','status','accepted_at'];
    protected $casts = ['accepted_at'=>'datetime'];
    public static function between(int $a, int $b) { return static::where(fn($q)=>$q->where('requester_id',$a)->where('addressee_id',$b))->orWhere(fn($q)=>$q->where('requester_id',$b)->where('addressee_id',$a)); }
    public static function areFriends(int $a, int $b): bool { return static::between($a,$b)->where('status', self::ACCEPTED)->exists(); }
}
