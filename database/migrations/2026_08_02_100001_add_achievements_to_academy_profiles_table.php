<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('academy_profiles', function (Blueprint $table) {
            $table->text('achievements')->nullable()->after('about');
        });
    }

    public function down(): void
    {
        Schema::table('academy_profiles', function (Blueprint $table) {
            $table->dropColumn('achievements');
        });
    }
};
