<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
class PostMedia extends Model { use HasFactory; protected $fillable = ['post_id','disk','path','mime_type','size','media_type','expires_at']; protected $casts = ['expires_at'=>'datetime']; }
