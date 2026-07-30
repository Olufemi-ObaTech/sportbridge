<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAgentProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->can('update', $this->user()->agentProfile);
    }

    public function rules(): array
    {
        return [
            'agency_name' => ['required', 'string', 'max:255'],
            'nationality' => ['required', 'string', 'max:100'],
            'experience_years' => ['required', 'integer', 'min:0', 'max:60'],
            'regions' => ['required', 'array', 'min:1'],
            'regions.*' => ['string', 'max:100'],
            'about' => ['nullable', 'string', 'max:20000'],
            'cover_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:4096'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:5120'],
            'verification_body' => ['nullable', 'string', 'max:255'],
            'linkedin' => ['nullable', 'string', 'max:255'],
        ];
    }
}
