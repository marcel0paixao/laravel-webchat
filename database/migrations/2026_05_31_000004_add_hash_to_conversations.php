<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up()
    {
        if (Schema::hasTable('conversations') && ! Schema::hasColumn('conversations', 'hash')) {
            Schema::table('conversations', function (Blueprint $table) {
                $table->string('hash', 40)->nullable()->unique()->after('id');
            });
        }

        if (Schema::hasTable('conversations')) {
            DB::table('conversations')->whereNull('hash')->orderBy('id')->each(function ($conversation) {
                DB::table('conversations')
                    ->where('id', $conversation->id)
                    ->update(['hash' => Str::lower(Str::random(24))]);
            });
        }
    }
};
