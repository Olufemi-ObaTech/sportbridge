<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Model;

/**
 * Basketball's counterpart to FootballUserRecord - see that class's docblock.
 */
class BasketballUserRecord extends Model
{
    protected $connection = 'mysql_admin';

    protected $table = 'basketball_user_records';

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
