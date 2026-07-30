<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('academy_profiles', function (Blueprint $table) {
            // Self-reported only - not independently verified by SportBridge, no external link.
            $table->string('fifa_connect_id')->nullable()->after('license_number');
            $table->boolean('has_fifa_tms_account')->nullable()->after('fifa_connect_id');

            // A club can run programs in more than one sport (unlike Player/Coach/Agent,
            // which are single-sport), so this mirrors the existing leagues/languages
            // json-array pattern rather than a single enum.
            $table->json('sports')->nullable()->after('languages');

            $table->string('linkedin')->nullable()->after('sports');
        });
    }

    public function down(): void
    {
        Schema::table('academy_profiles', function (Blueprint $table) {
            $table->dropColumn(['fifa_connect_id', 'has_fifa_tms_account', 'sports', 'linkedin']);
        });
    }
};
