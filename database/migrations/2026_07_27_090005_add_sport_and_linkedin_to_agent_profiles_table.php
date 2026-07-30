<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('agent_profiles', function (Blueprint $table) {
            $table->enum('sport', ['football', 'basketball'])->default('football')->index()->after('user_id');
            $table->string('linkedin')->nullable()->after('verification_body');
        });
    }

    public function down(): void
    {
        Schema::table('agent_profiles', function (Blueprint $table) {
            $table->dropColumn(['sport', 'linkedin']);
        });
    }
};
