<?php

namespace App\Http\Requests;

use App\Models\TryOut;
use Illuminate\Foundation\Http\FormRequest;

class StoreTryOutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->can('create', TryOut::class);
    }

    public function rules(): array
    {
        return [
            'sport' => ['required', 'in:football,basketball'],
            'gender' => ['required', 'in:male,female,mixed'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:3000'],
            'location' => ['nullable', 'string', 'max:255'],
            'scheduled_date' => ['nullable', 'date', 'after_or_equal:today'],
            'age_group' => ['nullable', 'string', 'max:100'],
        ];
    }
}
