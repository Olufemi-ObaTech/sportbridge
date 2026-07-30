<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * agent_ratings.agent_profile_id and agent_recommendations.agent_profile_id
 * /player_id can now point at either the main (football) or basketball
 * database - a bare ID is ambiguous once both databases have independent
 * auto-increment sequences, so a sport column disambiguates which
 * connection/model to resolve against.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('agent_ratings', function (Blueprint $table) {
            $table->enum('sport', ['football', 'basketball'])->default('football')->index()->after('agent_profile_id');
        });

        Schema::table('agent_recommendations', function (Blueprint $table) {
            $table->enum('sport', ['football', 'basketball'])->default('football')->index()->after('agent_profile_id');
        });
    }

    public function down(): void
    {
        Schema::table('agent_ratings', function (Blueprint $table) {
            $table->dropColumn('sport');
        });

        Schema::table('agent_recommendations', function (Blueprint $table) {
            $table->dropColumn('sport');
        });
    }
};
