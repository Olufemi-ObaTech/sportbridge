<?php

namespace App\Http\Requests;

use App\Models\AgentRecommendation;
use Illuminate\Foundation\Http\FormRequest;

class UpdateAgentRecommendationStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->can('updateStatus', $this->route('agent_recommendation'));
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'in:'.AgentRecommendation::STATUS_ACKNOWLEDGED.','.AgentRecommendation::STATUS_DECLINED],
        ];
    }
}
