<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A message's attached player_card_id can now point at a row in either the
 * main (football) or basketball database - since each database has its own
 * independent auto-increment IDs, a bare `player_card_id` is ambiguous
 * without knowing which one it refers to. This companion column disambiguates.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->enum('player_sport', ['football', 'basketball'])->nullable()->after('player_card_id');
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn('player_sport');
        });
    }
};
