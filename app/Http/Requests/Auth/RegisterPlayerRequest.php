<?php

namespace App\Http\Requests\Auth;

use App\Models\Player;
use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterPlayerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // The registration page itself is sport-specific (a route parameter,
        // e.g. /register/player/basketball) - not a user-editable form field.
        $sport = $this->route('sport', Player::SPORT_FOOTBALL);
        $positions = Player::positionsFor($sport);
        $isMinor = $this->isMinorRegistrant();
        $isBasketball = $sport === Player::SPORT_BASKETBALL;

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'dob' => ['required', 'date', 'before:-13 years'],
            'nationality' => ['required', 'string', 'max:100'],
            'position' => ['required', 'in:'.implode(',', $positions)],
            'secondary_position' => ['nullable', 'in:'.implode(',', $positions)],
            'foot' => [$isBasketball ? 'nullable' : 'required', 'in:left,right,both'],
            'dominant_hand' => [$isBasketball ? 'required' : 'nullable', 'in:left,right,ambidextrous'],
            'current_club' => ['nullable', 'string', 'max:255'],
            'linkedin' => ['nullable', 'string', 'max:255'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'guardian_name' => [$isMinor ? 'required' : 'nullable', 'string', 'max:255'],
            'consent_confirmed' => [$isMinor ? 'accepted' : 'nullable'],
        ];
    }

    public function isMinorRegistrant(): bool
    {
        if (! $this->filled('dob')) {
            return false;
        }

        try {
            return Carbon::parse($this->input('dob'))->age < 18;
        } catch (\Throwable) {
            return false;
        }
    }

    public function messages(): array
    {
        return [
            'guardian_name.required' => __('Players under 18 must provide their parent/guardian or club/academy contact name.'),
            'consent_confirmed.accepted' => __('Players under 18 need confirmed club/academy or guardian consent to register.'),
        ];
    }
}
