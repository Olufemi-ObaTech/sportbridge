<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAcademyProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->can('update', $this->user()->academyProfile);
    }

    public function rules(): array
    {
        return [
            'club_name' => ['required', 'string', 'max:255'],
            'country' => ['required', 'string', 'max:100'],
            'state' => ['nullable', 'string', 'max:100'],
            'address' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'year_founded' => ['nullable', 'integer', 'min:1850', 'max:'.date('Y')],
            'about' => ['nullable', 'string', 'max:20000'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
            'cover_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:4096'],
            'leagues' => ['nullable', 'string', 'max:2000'],
            'languages' => ['nullable', 'array'],
            'languages.*' => ['string', 'max:50'],
            'sports' => ['nullable', 'array'],
            'sports.*' => ['string', 'in:football,basketball'],
            // Self-reported only - not independently verified by SportBridge, no external link.
            'fifa_connect_id' => ['nullable', 'string', 'max:50'],
            'has_fifa_tms_account' => ['nullable', 'boolean'],
            'fiba_map_id' => ['nullable', 'string', 'max:50'],
            'has_fiba_map_account' => ['nullable', 'boolean'],
            'linkedin' => ['nullable', 'string', 'max:255'],
        ];
    }
}
