<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TryOutInterest extends Model
{
    use HasFactory;

    /**
     * Always the MAIN database - see AgentRating's note. Overrides
     * getConnectionName() rather than hardcoding $connection = 'mysql' so it
     * still resolves to the app's actual default connection (sqlite in tests).
     */
    public function getConnectionName()
    {
        return config('database.default');
    }

    protected $fillable = [
        'try_out_id',
        'user_id',
        'message',
    ];

    public function tryOut(): BelongsTo
    {
        return $this->belongsTo(TryOut::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
