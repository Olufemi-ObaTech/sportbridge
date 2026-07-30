<?php

namespace App\Models;

use App\Models\Basketball\BasketballPlayer;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    use HasFactory;

    /**
     * Always the MAIN database - see AcademyProfile's note. Overrides
     * getConnectionName() rather than hardcoding $connection = 'mysql' so it
     * still resolves to the app's actual default connection (sqlite in tests).
     */
    public function getConnectionName()
    {
        return config('database.default');
    }

    protected $fillable = [
        'conversation_id',
        'sender_id',
        'content',
        'player_card_id',
        'player_sport',
        'attachment_url',
        'is_read',
    ];

    protected function casts(): array
    {
        return [
            'is_read' => 'boolean',
        ];
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * player_card_id is ambiguous on its own (football and basketball
     * players have independent auto-increment IDs across two databases) -
     * the `player_sport` column says which model/connection to resolve against.
     */
    public function playerCard(): BelongsTo
    {
        return $this->player_sport === 'basketball'
            ? $this->belongsTo(BasketballPlayer::class, 'player_card_id')
            : $this->belongsTo(Player::class, 'player_card_id');
    }
}
