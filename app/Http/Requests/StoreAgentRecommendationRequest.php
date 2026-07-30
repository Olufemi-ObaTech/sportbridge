<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAgentRecommendationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->isActive();
    }

    public function rules(): array
    {
        return [
            // Exactly one of the two: required_without covers "at least one",
            // prohibits covers "not both" so a request can't set both at once.
            'player_id' => ['required_without:recommended_to_name', 'nullable', 'exists:players,id', 'prohibits:recommended_to_name'],
            'recommended_to_name' => ['required_without:player_id', 'nullable', 'string', 'max:255'],
            'proposed_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
            'note' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
