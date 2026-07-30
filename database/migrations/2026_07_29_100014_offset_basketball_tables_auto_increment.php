<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Football and basketball tables are physically separate databases, each with
 * its own auto-increment sequence starting at 1 - so without this, basketball
 * row #1 would always numerically collide with the pre-existing football
 * row #1 (and #2, #3...). Model::resolveRouteBinding() overrides (see
 * Player::resolveRouteBinding() and its siblings) resolve an ambiguous
 * {player}/{team}/{job_post}/etc. route id by trying the football table
 * first, so a colliding id would make the basketball row permanently
 * unreachable - silently shadowed by an unrelated football row, or worse,
 * mis-authorized as belonging to the wrong academy/agent/coach.
 *
 * Offsetting every basketball table's auto-increment far above any realistic
 * football row count (this app has dozens of rows per table, not millions)
 * guarantees the two id spaces never overlap, so the "try football, then
 * basketball" fallback is always unambiguous.
 */
return new class extends Migration
{
    protected $connection = 'mysql_basketball';

    protected const OFFSET = 1_000_000;

    protected const TABLES = [
        'teams',
        'players',
        'coach_profiles',
        'agent_profiles',
        'job_posts',
        'job_applications',
        'watchlists',
        'access_requests',
        'media_assets',
    ];

    public function up(): void
    {
        // MySQL-only syntax: in tests this connection is swapped to sqlite
        // (see phpunit.xml), which has no equivalent concept worth replicating -
        // each test run's in-memory databases are already independent of each
        // other, so the production cross-database id-collision this guards
        // against doesn't apply there.
        if (DB::connection($this->connection)->getDriverName() !== 'mysql') {
            return;
        }

        foreach (self::TABLES as $table) {
            DB::connection($this->connection)->statement("ALTER TABLE `{$table}` AUTO_INCREMENT = ".self::OFFSET);
        }
    }

    public function down(): void
    {
        if (DB::connection($this->connection)->getDriverName() !== 'mysql') {
            return;
        }

        foreach (self::TABLES as $table) {
            DB::connection($this->connection)->statement("ALTER TABLE `{$table}` AUTO_INCREMENT = 1");
        }
    }
};
