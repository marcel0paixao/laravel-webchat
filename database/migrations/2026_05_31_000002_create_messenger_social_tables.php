<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('conversations')) {
            Schema::create('conversations', function (Blueprint $table) {
                $table->id(); $table->string('type', 24)->default('direct')->index(); $table->string('direct_hash')->nullable()->unique(); $table->string('name')->nullable(); $table->string('avatar_path', 2048)->nullable(); $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete(); $table->timestamps(); $table->softDeletes();
            });
        }
        if (!Schema::hasTable('conversation_participants')) {
            Schema::create('conversation_participants', function (Blueprint $table) {
                $table->id(); $table->foreignId('conversation_id')->constrained()->cascadeOnDelete(); $table->foreignId('user_id')->constrained()->cascadeOnDelete(); $table->string('role', 24)->default('member'); $table->timestamp('joined_at')->nullable(); $table->timestamp('last_read_at')->nullable(); $table->timestamp('muted_until')->nullable(); $table->timestamp('left_at')->nullable(); $table->timestamps(); $table->unique(['conversation_id', 'user_id']);
            });
        }
        if (!Schema::hasTable('friendships')) {
            Schema::create('friendships', function (Blueprint $table) {
                $table->id(); $table->foreignId('requester_id')->constrained('users')->cascadeOnDelete(); $table->foreignId('addressee_id')->constrained('users')->cascadeOnDelete(); $table->string('status', 24)->default('pending')->index(); $table->timestamp('accepted_at')->nullable(); $table->timestamps(); $table->unique(['requester_id', 'addressee_id']);
            });
        }
        if (!Schema::hasTable('user_blocks')) {
            Schema::create('user_blocks', function (Blueprint $table) {
                $table->id(); $table->foreignId('blocker_id')->constrained('users')->cascadeOnDelete(); $table->foreignId('blocked_id')->constrained('users')->cascadeOnDelete(); $table->timestamps(); $table->unique(['blocker_id', 'blocked_id']);
            });
        }
        if (!Schema::hasTable('user_reports')) {
            Schema::create('user_reports', function (Blueprint $table) {
                $table->id(); $table->foreignId('reporter_id')->constrained('users')->cascadeOnDelete(); $table->foreignId('reported_id')->constrained('users')->cascadeOnDelete(); $table->string('reason')->default('profile_report'); $table->text('details')->nullable(); $table->timestamps();
            });
        }
        Schema::table('messages', function (Blueprint $table) {
            if (!Schema::hasColumn('messages', 'conversation_id')) { $table->foreignId('conversation_id')->nullable()->after('id')->constrained()->nullOnDelete(); }
            if (!Schema::hasColumn('messages', 'type')) { $table->string('type', 32)->default('text')->after('message'); }
            if (!Schema::hasColumn('messages', 'metadata')) { $table->json('metadata')->nullable()->after('type'); }
        });
        if (!Schema::hasTable('message_attachments')) {
            Schema::create('message_attachments', function (Blueprint $table) {
                $table->id(); $table->foreignId('message_id')->constrained()->cascadeOnDelete(); $table->string('disk')->default('minio'); $table->string('path', 2048); $table->string('original_name')->nullable(); $table->string('mime_type')->nullable(); $table->unsignedBigInteger('size')->default(0); $table->string('media_type', 24)->default('file'); $table->unsignedInteger('width')->nullable(); $table->unsignedInteger('height')->nullable(); $table->unsignedInteger('duration_seconds')->nullable(); $table->timestamp('expires_at')->nullable()->index(); $table->timestamps();
            });
        }
        if (!Schema::hasTable('message_statuses')) {
            Schema::create('message_statuses', function (Blueprint $table) {
                $table->id(); $table->foreignId('message_id')->constrained()->cascadeOnDelete(); $table->foreignId('user_id')->constrained()->cascadeOnDelete(); $table->timestamp('delivered_at')->nullable(); $table->timestamp('read_at')->nullable(); $table->timestamps(); $table->unique(['message_id', 'user_id']);
            });
        }
        if (!Schema::hasTable('sms_verification_codes')) {
            Schema::create('sms_verification_codes', function (Blueprint $table) {
                $table->id(); $table->foreignId('user_id')->constrained()->cascadeOnDelete(); $table->string('phone', 32); $table->string('code_hash'); $table->timestamp('expires_at'); $table->timestamp('used_at')->nullable(); $table->timestamps();
            });
        }
    }
    public function down() {}
};
