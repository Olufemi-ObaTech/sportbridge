<?php

namespace App\Console\Commands;

use App\Models\Admin\BasketballUserRecord;
use App\Models\Admin\FootballUserRecord;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Rebuilds the Super Admin's read-only reporting snapshot in the separate
 * "mysql_admin" physical database (see config/database.php) from the live
 * data across the main and basketball databases.
 *
 * This is an on-demand snapshot, not real-time replication: an atomic write
 * across three physical MySQL databases isn't possible, so rather than a
 * "live mirror" that can silently drift out of sync on a partial failure,
 * this truncates and rebuilds both tables in one pass - always internally
 * consistent as of the moment it ran, with `synced_at` making that moment
 * explicit to anyone reading the export.
 */
class SyncAdminUserRecords extends Command
{
    protected $signature = 'admin:sync-user-records';

    protected $description = 'Rebuild the Super Admin\'s football/basketball user record snapshot database';

    public function handle(): int
    {
        $now = now();
        $football = [];
        $basketball = [];

        User::with(['academyProfile'])
            ->whereNotIn('role', [User::ROLE_SUPER_ADMIN])
            ->chunkById(200, function ($users) use (&$football, &$basketball, $now) {
                foreach ($users as $user) {
                    $row = [
                        'source_user_id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'status' => $user->status,
                        'source_created_at' => $user->created_at,
                        'synced_at' => $now,
                    ];

                    if ($user->role === User::ROLE_ACADEMY) {
                        $sports = $user->academyProfile?->sports ?? [];
                        $row['club_or_agency_name'] = $user->academyProfile?->club_name;

                        if (empty($sports) || in_array('football', $sports, true)) {
                            $football[] = $row;
                        }
                        if (in_array('basketball', $sports, true)) {
                            $basketball[] = $row;
                        }

                        continue;
                    }

                    $row['club_or_agency_name'] = match ($user->role) {
                        User::ROLE_AGENT => $user->agentProfile?->agency_name,
                        default => null,
                    };

                    if ($user->sport === 'basketball') {
                        $basketball[] = $row;
                    } else {
                        $football[] = $row;
                    }
                }
            });

        DB::connection('mysql_admin')->transaction(function () use ($football, $basketball) {
            FootballUserRecord::query()->delete();
            BasketballUserRecord::query()->delete();

            foreach (array_chunk($football, 500) as $chunk) {
                FootballUserRecord::insert($chunk);
            }
            foreach (array_chunk($basketball, 500) as $chunk) {
                BasketballUserRecord::insert($chunk);
            }
        });

        $this->info('Synced '.count($football).' football and '.count($basketball).' basketball user records to the admin database.');

        return self::SUCCESS;
    }
}
