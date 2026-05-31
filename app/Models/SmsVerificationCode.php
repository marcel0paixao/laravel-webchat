<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
class SmsVerificationCode extends Model
{
    use HasFactory;
    protected $fillable = ['user_id','phone','code_hash','expires_at','used_at'];
    protected $casts = ['expires_at'=>'datetime','used_at'=>'datetime'];
}
