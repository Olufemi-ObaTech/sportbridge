<?php

namespace App\Http\Requests\Auth;

use App\Models\CoachProfile;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterCoachRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // The registration page itself is sport-specific (a route parameter,
        // e.g. /register/coach/basketball) - not a user-editable form field.
        $sport = $this->route('sport', CoachProfile::SPORT_FOOTBALL);
        $badges = CoachProfile::badgesFor($sport);
        $roles = CoachProfile::rolesFor($sport);

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'badges' => ['required', 'array', 'min:1'],
            'badges.*' => ['string', 'in:'.implode(',', $badges)],
            'certificates' => ['nullable', 'string', 'max:2000'],
            'preferred_role' => ['required', 'in:'.implode(',', array_keys($roles))],
            'experience_years' => ['required', 'integer', 'min:0', 'max:60'],
            'current_club' => ['nullable', 'string', 'max:255'],
            'nationality' => ['required', 'string', 'max:100'],
            'linkedin' => ['nullable', 'string', 'max:255'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:5120'],
            'cv' => ['required', 'file', 'mimes:pdf,docx', 'max:5120'],
        ];
    }
}
