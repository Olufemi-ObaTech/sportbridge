<?php

namespace App\Http\Requests;

use App\Models\AccessRequest;
use Illuminate\Foundation\Http\FormRequest;

class RespondAccessRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var AccessRequest|null $accessRequest */
        $accessRequest = $this->route('access_request');

        return $accessRequest instanceof AccessRequest
            && $this->user()?->role === 'academy'
            && $this->user()->academyProfile?->id === $accessRequest->academy_id;
    }

    public function rules(): array
    {
        return [
            'decision' => ['required', 'in:grant,deny'],
        ];
    }
}
