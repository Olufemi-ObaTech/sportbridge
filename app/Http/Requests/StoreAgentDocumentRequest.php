<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAgentDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $agent = $this->user()?->agentProfile;

        // is() (not ==id) - football and basketball agent_profiles have
        // independent id sequences across two physical databases, so a raw
        // id comparison could match the wrong sport's row.
        return (bool) ($this->user()?->isActive() && $agent?->is($this->route('agent')));
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ];
    }
}
