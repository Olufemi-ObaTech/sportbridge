<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * An academy/club can run a men's team, a women's team, or both - unlike
     * the person-level `gender` column on players/coaches/agents, this
     * describes the team(s) the academy fields, so "mixed" is a valid value.
     */
    public function up(): void
    {
        Schema::table('academy_profiles', function (Blueprint $table) {
            $table->string('team_gender')->nullable()->after('club_name');
        });
    }

    public function down(): void
    {
        Schema::table('academy_profiles', function (Blueprint $table) {
            $table->dropColumn('team_gender');
        });
    }
};
