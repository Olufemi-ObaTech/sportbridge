<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTeamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->can('update', $this->route('team'));
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'season' => ['required', 'string', 'max:20'],
            'age_group' => ['required', 'in:U-13,U-15,U-17,U-20,Senior,Women'],
            'coach_name' => ['nullable', 'string', 'max:255'],
        ];
    }
}
