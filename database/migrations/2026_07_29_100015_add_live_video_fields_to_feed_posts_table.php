<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('feed_posts', function (Blueprint $table) {
            $table->boolean('is_live')->default(false)->after('training_at');
            $table->string('live_link', 500)->nullable()->after('is_live');
            $table->dateTime('live_at')->nullable()->after('live_link');
        });
    }

    public function down(): void
    {
        Schema::table('feed_posts', function (Blueprint $table) {
            $table->dropColumn(['is_live', 'live_link', 'live_at']);
        });
    }
};
