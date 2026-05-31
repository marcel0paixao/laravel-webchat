<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('posts')) {
            Schema::create('posts', function (Blueprint $table) { $table->id(); $table->foreignId('user_id')->constrained()->cascadeOnDelete(); $table->text('body')->nullable(); $table->string('visibility', 24)->default('public')->index(); $table->timestamp('published_at')->nullable()->index(); $table->timestamps(); $table->softDeletes(); });
        }
        if (!Schema::hasTable('post_media')) {
            Schema::create('post_media', function (Blueprint $table) { $table->id(); $table->foreignId('post_id')->constrained()->cascadeOnDelete(); $table->string('disk')->default('minio'); $table->string('path', 2048); $table->string('mime_type')->nullable(); $table->unsignedBigInteger('size')->default(0); $table->string('media_type', 24)->default('image'); $table->timestamp('expires_at')->nullable()->index(); $table->timestamps(); });
        }
    }
    public function down() {}
};
