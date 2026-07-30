<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Model;

/**
 * Read-only reporting snapshot in the "mysql_admin" physical database - see
 * App\Console\Commands\SyncAdminUserRecords. Not related to (and never
 * written to by) the live application's User/Player/AgentProfile models.
 */
class FootballUserRecord extends Model
{
    protected $connection = 'mysql_admin';

    protected $table = 'football_user_records';

    public $timestamps = false;

    protected $fillable = [
        'source_user_id',
        'name',
        'email',
        'role',
        'status',
        'club_or_agency_name',
        'source_created_at',
        'synced_at',
    ];

    protected function casts(): array
    {
        return [
            'source_created_at' => 'datetime',
            'synced_at' => 'datetime',
        ];
    }
}
