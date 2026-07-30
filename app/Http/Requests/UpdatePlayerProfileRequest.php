<?php

namespace App\Http\Requests;

use App\Models\Player;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePlayerProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->can('update', $this->user()->playerProfile);
    }

    public function rules(): array
    {
        // Sport is set at registration and not editable here; positions/hand
        // options are scoped to whichever sport the player already has.
        $sport = $this->user()?->playerProfile?->sport ?? Player::SPORT_FOOTBALL;
        $positions = Player::positionsFor($sport);
        $isBasketball = $sport === Player::SPORT_BASKETBALL;

        return [
            'full_name' => ['required', 'string', 'max:255'],
            'dob' => ['required', 'date', 'before:today'],
            'nationality' => ['required', 'string', 'max:100'],
            'position' => ['required', 'in:'.implode(',', $positions)],
            'secondary_position' => ['nullable', 'in:'.implode(',', $positions)],
            'foot' => [$isBasketball ? 'nullable' : 'required', 'in:left,right,both'],
            'dominant_hand' => [$isBasketball ? 'required' : 'nullable', 'in:left,right,ambidextrous'],
            'height_cm' => ['nullable', 'integer', 'min:100', 'max:230'],
            'weight_kg' => ['nullable', 'integer', 'min:30', 'max:150'],
            'jersey_number' => ['nullable', 'integer', 'min:1', 'max:99'],
            'bio' => ['nullable', 'string', 'max:5000'],
            'current_club' => ['nullable', 'string', 'max:255'],
            'previous_clubs' => ['nullable', 'string', 'max:2000'],
            'achievements' => ['nullable', 'string', 'max:5000'],
            'linkedin' => ['nullable', 'string', 'max:255'],
            'primary_photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'cv' => ['nullable', 'file', 'mimes:pdf,docx', 'max:5120'],
            'is_public' => ['nullable', 'boolean'],
        ];
    }
}
