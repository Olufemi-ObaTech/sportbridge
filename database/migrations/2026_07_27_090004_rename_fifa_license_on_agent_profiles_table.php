<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * "fifa_license" is football-specific naming (FIFA governs football
     * agents); basketball agents hold different credentials, so the
     * column is generalized to "license_number". MySQL's `CHANGE` syntax
     * isn't portable (the test suite runs on SQLite), so MySQL uses raw
     * SQL and every other driver uses the doctrine/dbal-backed renameColumn().
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE agent_profiles CHANGE fifa_license license_number VARCHAR(255) NOT NULL');
        } else {
            Schema::table('agent_profiles', function (Blueprint $table) {
                $table->renameColumn('fifa_license', 'license_number');
            });
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE agent_profiles CHANGE license_number fifa_license VARCHAR(255) NOT NULL');
        } else {
            Schema::table('agent_profiles', function (Blueprint $table) {
                $table->renameColumn('license_number', 'fifa_license');
            });
        }
    }
};
