<?php

namespace App\Http\Requests;

use App\Models\AgentProfile;
use Illuminate\Foundation\Http\FormRequest;

class StoreAgentRatingRequest extends FormRequest
{
    public function authorize(): bool
    {
        if (! $this->user()?->isActive()) {
            return false;
        }

        /** @var AgentProfile|null $agent */
        $agent = $this->route('agent');

        // Ratings are meant to reflect a real client relationship - see
        // AgentProfile::hasProvidedServiceTo(). An existing rating can always
        // be updated even if the underlying conversation/access since ended.
        return $agent
            && ($agent->ratings()->where('user_id', $this->user()->id)->exists()
                || $agent->hasProvidedServiceTo($this->user()));
    }

    public function rules(): array
    {
        return [
            'score' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
