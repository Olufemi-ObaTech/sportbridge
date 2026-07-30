<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Same problem and fix as messages.player_card_id (see the migration
 * dropping that FK): agent_profile_id/player_id here can now legitimately
 * point at a row in the basketball database, which these football-only FK
 * constraints reject outright. Becomes a soft, app-enforced reference like
 * every other cross-database id in this app - see AgentRating/
 * AgentRecommendation's sport-aware agentProfile()/player() relations.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('agent_ratings', function (Blueprint $table) {
            $table->dropForeign(['agent_profile_id']);
        });

        Schema::table('agent_recommendations', function (Blueprint $table) {
            $table->dropForeign(['agent_profile_id']);
            $table->dropForeign(['player_id']);
        });
    }

    public function down(): void
    {
        Schema::table('agent_ratings', function (Blueprint $table) {
            $table->foreign('agent_profile_id')->references('id')->on('agent_profiles')->cascadeOnDelete();
        });

        Schema::table('agent_recommendations', function (Blueprint $table) {
            $table->foreign('agent_profile_id')->references('id')->on('agent_profiles')->cascadeOnDelete();
            $table->foreign('player_id')->references('id')->on('players')->nullOnDelete();
        });
    }
};
