<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'mysql_basketball';

    public function up(): void
    {
        Schema::connection($this->connection)->table('coach_profiles', function (Blueprint $table) {
            $table->text('achievements')->nullable()->after('about');
        });
    }

    public function down(): void
    {
        Schema::connection($this->connection)->table('coach_profiles', function (Blueprint $table) {
            $table->dropColumn('achievements');
        });
    }
};
