<?php

namespace App\Imports;

use App\Models\AcademyProfile;
use App\Models\Basketball\BasketballPlayer;
use App\Models\Player;
use App\Models\Team;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class PlayersImport implements SkipsOnFailure, ToModel, WithHeadingRow, WithValidation
{
    use Importable, SkipsFailures;

    public int $imported = 0;

    public function __construct(protected Team $team, protected AcademyProfile $academy) {}

    public function model(array $row): ?Player
    {
        $this->imported++;

        $fullName = trim((string) $row['full_name']);
        $sport = $this->team->sport ?? Player::SPORT_FOOTBALL;
        $isBasketball = $sport === Player::SPORT_BASKETBALL;
        $playerModel = $isBasketball ? BasketballPlayer::class : Player::class;

        return new $playerModel([
            'team_id' => $this->team->id,
            'academy_id' => $this->academy->id,
            'sport' => $sport,
            'full_name' => $fullName,
            'slug' => Player::uniqueSlug($fullName),
            'dob' => $row['dob'],
            'nationality' => $row['nationality'],
            'position' => strtoupper($row['position']),
            'secondary_position' => filled($row['secondary_position'] ?? null) ? strtoupper($row['secondary_position']) : null,
            'foot' => ! $isBasketball && filled($row['foot'] ?? null) ? strtolower($row['foot']) : null,
            'dominant_hand' => $isBasketball && filled($row['dominant_hand'] ?? null) ? strtolower($row['dominant_hand']) : null,
            'height_cm' => $row['height_cm'] ?? null,
            'weight_kg' => $row['weight_kg'] ?? null,
            'jersey_number' => $row['jersey_number'] ?? null,
            'bio' => $row['bio'] ?? null,
            'is_public' => true,
        ]);
    }

    public function rules(): array
    {
        $sport = $this->team->sport ?? Player::SPORT_FOOTBALL;
        $isBasketball = $sport === Player::SPORT_BASKETBALL;
        $positions = Player::positionsFor($sport);
        $positionsIn = implode(',', array_merge($positions, array_map('strtolower', $positions)));

        return [
            'full_name' => ['required', 'string', 'max:255'],
            'dob' => ['required', 'date', 'before:today'],
            'nationality' => ['required', 'string', 'max:255'],
            'position' => ['required', 'string', 'in:'.$positionsIn],
            'secondary_position' => ['nullable', 'string', 'in:'.$positionsIn],
            'foot' => [$isBasketball ? 'nullable' : 'required', 'string', 'in:left,right,both,Left,Right,Both'],
            'dominant_hand' => [$isBasketball ? 'required' : 'nullable', 'string', 'in:left,right,ambidextrous,Left,Right,Ambidextrous'],
            'height_cm' => ['nullable', 'integer', 'min:100', 'max:230'],
            'weight_kg' => ['nullable', 'integer', 'min:30', 'max:150'],
            'jersey_number' => ['nullable', 'integer', 'min:1', 'max:99'],
            'bio' => ['nullable', 'string'],
        ];
    }
}
