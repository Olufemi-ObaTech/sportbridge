<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * FIBA MAP (Management & Administration Platform, launched 2019) is
 * basketball's real-world equivalent of FIFA Connect/TMS - the centralized
 * platform national federations use for club registration, player/coach
 * licensing, and international transfers. Mirrors fifa_connect_id /
 * has_fifa_tms_account exactly: self-reported only, no external link.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('academy_profiles', function (Blueprint $table) {
            $table->string('fiba_map_id')->nullable()->after('has_fifa_tms_account');
            $table->boolean('has_fiba_map_account')->nullable()->after('fiba_map_id');
        });
    }

    public function down(): void
    {
        Schema::table('academy_profiles', function (Blueprint $table) {
            $table->dropColumn(['fiba_map_id', 'has_fiba_map_account']);
        });
    }
};
