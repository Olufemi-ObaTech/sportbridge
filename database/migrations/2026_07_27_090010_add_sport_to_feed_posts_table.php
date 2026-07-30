<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Nullable - a post can be general (not sport-specific) or tagged to
     * football/basketball so the feed can be filtered by the site's
     * current sport context.
     */
    public function up(): void
    {
        Schema::table('feed_posts', function (Blueprint $table) {
            $table->enum('sport', ['football', 'basketball'])->nullable()->index()->after('author_id');
        });
    }

    public function down(): void
    {
        Schema::table('feed_posts', function (Blueprint $table) {
            $table->dropColumn('sport');
        });
    }
};
