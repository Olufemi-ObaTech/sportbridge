<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;

/**
 * `migrate:fresh` only drops tables on the default "mysql" connection, so it
 * silently leaves the "mysql_basketball" connection's tables in place and
 * every basketball migration then fails with "table already exists" on the
 * next run. This command drops both databases' tables before migrating.
 */
class FreshAllDatabases extends Command
{
    protected $signature = 'db:fresh-all {--seed : Seed the database after running migrations}';

    protected $description = 'Drop all tables on both the main and basketball connections, then re-run migrations';

    public function handle(): int
    {
        foreach (['mysql', 'mysql_basketball', 'mysql_admin'] as $connection) {
            $this->components->task(
                "Dropping tables on [{$connection}]",
                fn () => Schema::connection($connection)->dropAllTables()
            );
        }

        $exitCode = Artisan::call('migrate', ['--force' => true], $this->output);

        if ($exitCode === 0 && $this->option('seed')) {
            $exitCode = Artisan::call('db:seed', ['--force' => true], $this->output);
        }

        return $exitCode;
    }
}
