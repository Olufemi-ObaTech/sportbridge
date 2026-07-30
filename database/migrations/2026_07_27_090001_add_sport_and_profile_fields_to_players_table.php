<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * position/secondary_position move from a football-only DB enum to a
     * plain string so basketball's position set (PG/SG/SF/PF/C) can share
     * the column; validity is enforced per-sport at the FormRequest layer
     * instead of the database layer. MySQL's `MODIFY COLUMN` syntax isn't
     * portable (the test suite runs on SQLite), so MySQL uses raw SQL and
     * every other driver uses the doctrine/dbal-backed Schema::change().
     */
    public function up(): void
    {
        Schema::table('players', function (Blueprint $table) {
            $table->enum('sport', ['football', 'basketball'])->default('football')->index()->after('academy_id');
            $table->enum('dominant_hand', ['left', 'right', 'ambidextrous'])->nullable()->after('foot');
            $table->string('linkedin')->nullable()->after('achievements');
        });

        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE players MODIFY COLUMN position VARCHAR(20) NOT NULL');
            DB::statement('ALTER TABLE players MODIFY COLUMN secondary_position VARCHAR(20) NULL');
            DB::statement("ALTER TABLE players MODIFY COLUMN foot ENUM('left', 'right', 'both') NULL");
        } else {
            Schema::table('players', function (Blueprint $table) {
                $table->string('position', 20)->change();
                $table->string('secondary_position', 20)->nullable()->change();
                $table->enum('foot', ['left', 'right', 'both'])->nullable()->change();
            });
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE players MODIFY COLUMN foot ENUM('left', 'right', 'both') NOT NULL");
            DB::statement("ALTER TABLE players MODIFY COLUMN secondary_position ENUM('GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST') NULL");
            DB::statement("ALTER TABLE players MODIFY COLUMN position ENUM('GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST') NOT NULL");
        } else {
            Schema::table('players', function (Blueprint $table) {
                $table->enum('foot', ['left', 'right', 'both'])->change();
                $table->enum('secondary_position', ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'])->nullable()->change();
                $table->enum('position', ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'])->change();
            });
        }

        Schema::table('players', function (Blueprint $table) {
            $table->dropColumn(['sport', 'dominant_hand', 'linkedin']);
        });
    }
};
