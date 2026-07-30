<?php

namespace App\Http\Requests;

use App\Models\CoachProfile;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCoachProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->can('update', $this->user()->coachProfile);
    }

    public function rules(): array
    {
        $sport = $this->user()?->coachProfile?->sport ?? CoachProfile::SPORT_FOOTBALL;
        $badges = CoachProfile::badgesFor($sport);
        $roles = CoachProfile::rolesFor($sport);

        return [
            'full_name' => ['required', 'string', 'max:255'],
            'badges' => ['required', 'array', 'min:1'],
            'badges.*' => ['string', 'in:'.implode(',', $badges)],
            'certificates' => ['nullable', 'string', 'max:2000'],
            'preferred_role' => ['required', 'in:'.implode(',', array_keys($roles))],
            'experience_years' => ['required', 'integer', 'min:0', 'max:60'],
            'current_club' => ['nullable', 'string', 'max:255'],
            'nationality' => ['required', 'string', 'max:100'],
            'open_to_work' => ['nullable', 'boolean'],
            'about' => ['nullable', 'string', 'max:20000'],
            'linkedin' => ['nullable', 'string', 'max:255'],
            'cover_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:4096'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:5120'],
            'cv' => ['nullable', 'file', 'mimes:pdf,docx', 'max:5120'],
        ];
    }
}
