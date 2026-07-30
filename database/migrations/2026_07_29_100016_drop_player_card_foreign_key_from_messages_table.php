<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `messages.player_card_id` was a real FK to the (then only) `players` table.
 * Now that basketball players live in a separate physical database
 * (mysql_basketball), player_card_id can legitimately point at a row that
 * only exists there - which the old FK constraint has no way to know about,
 * and would reject with an integrity-constraint violation. `player_sport`
 * (added alongside this column previously) says which connection/model to
 * resolve against instead - see Message::playerCard(). This becomes a soft,
 * app-enforced reference, the same pattern already used for every other
 * cross-database id in this app (agent_profiles.user_id, job_posts.academy_id, etc).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropForeign(['player_card_id']);
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->foreign('player_card_id')->references('id')->on('players')->nullOnDelete();
        });
    }
};
