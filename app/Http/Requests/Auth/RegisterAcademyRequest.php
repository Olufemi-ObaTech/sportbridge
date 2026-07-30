<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterAcademyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // The registration page itself is sport-specific (a route parameter,
        // e.g. /register/academy/basketball) - the academy is signed up for
        // that one sport initially. Adding the other sport later (a multi-sport
        // club) is done from the profile edit page's multi-select, not here.
        $isBasketball = $this->route('sport', 'football') === 'basketball';

        return [
            'club_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'license_number' => ['required', 'string', 'max:100'],
            // Self-reported only - not independently verified by SportBridge, no external link.
            // Each field is `prohibited` on the other sport's page so a tampered
            // request can't smuggle FIFA data onto a basketball academy or vice versa.
            'fifa_connect_id' => [$isBasketball ? 'prohibited' : 'nullable', 'string', 'max:50'],
            'has_fifa_tms_account' => [$isBasketball ? 'prohibited' : 'nullable', 'boolean'],
            'fiba_map_id' => [$isBasketball ? 'nullable' : 'prohibited', 'string', 'max:50'],
            'has_fiba_map_account' => [$isBasketball ? 'nullable' : 'prohibited', 'boolean'],
            'country' => ['required', 'string', 'max:100'],
            'state' => ['nullable', 'string', 'max:100'],
            'address' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'year_founded' => ['nullable', 'integer', 'min:1850', 'max:'.date('Y')],
            'linkedin' => ['nullable', 'string', 'max:255'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
            'license_document' => ['required', 'file', 'mimes:pdf,jpg,jpeg', 'max:5120'],
        ];
    }
}
