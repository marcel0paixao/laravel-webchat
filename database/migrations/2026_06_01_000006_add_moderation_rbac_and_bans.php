<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'is_admin')) {
                $table->boolean('is_admin')->default(false)->index()->after('bio');
            }
            if (!Schema::hasColumn('users', 'banned_at')) {
                $table->timestamp('banned_at')->nullable()->index()->after('is_admin');
            }
            if (!Schema::hasColumn('users', 'ban_reason')) {
                $table->string('ban_reason', 255)->nullable()->after('banned_at');
            }
            if (!Schema::hasColumn('users', 'ban_details')) {
                $table->text('ban_details')->nullable()->after('ban_reason');
            }
        });

        Schema::table('conversations', function (Blueprint $table) {
            if (!Schema::hasColumn('conversations', 'banned_at')) {
                $table->timestamp('banned_at')->nullable()->index()->after('avatar_path');
            }
            if (!Schema::hasColumn('conversations', 'ban_reason')) {
                $table->string('ban_reason', 255)->nullable()->after('banned_at');
            }
        });

        Schema::table('user_reports', function (Blueprint $table) {
            if (!Schema::hasColumn('user_reports', 'conversation_id')) {
                $table->foreignId('conversation_id')->nullable()->after('reported_id')->constrained()->nullOnDelete();
            }
            if (!Schema::hasColumn('user_reports', 'target_type')) {
                $table->string('target_type', 24)->default('user')->index()->after('conversation_id');
            }
            if (!Schema::hasColumn('user_reports', 'status')) {
                $table->string('status', 24)->default('open')->index()->after('details');
            }
            if (!Schema::hasColumn('user_reports', 'resolution')) {
                $table->string('resolution', 64)->nullable()->after('status');
            }
            if (!Schema::hasColumn('user_reports', 'reviewed_by')) {
                $table->foreignId('reviewed_by')->nullable()->after('resolution')->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('user_reports', 'reviewed_at')) {
                $table->timestamp('reviewed_at')->nullable()->after('reviewed_by');
            }
        });
    }

    public function down() {}
};
