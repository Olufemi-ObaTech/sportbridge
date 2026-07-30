<?php

namespace App\Http\Requests;

use App\Models\JobPost;
use Illuminate\Foundation\Http\FormRequest;

class StoreJobRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->can('create', JobPost::class);
    }

    public function rules(): array
    {
        $roles = JobPost::rolesFor($this->input('sport'));

        return [
            'sport' => ['required', 'in:football,basketball'],
            'title' => ['required', 'string', 'max:255'],
            'role_type' => ['required', 'in:'.implode(',', array_keys($roles))],
            'description' => ['required', 'string', 'max:10000'],
            'requirements' => ['nullable', 'string', 'max:5000'],
            'location' => ['required', 'string', 'max:255'],
            'salary_min' => ['nullable', 'integer', 'min:0'],
            'salary_max' => ['nullable', 'integer', 'min:0', 'gte:salary_min'],
            'currency' => ['nullable', 'string', 'size:3'],
            'contract_type' => ['required', 'in:full_time,part_time,contract,volunteer'],
            'application_deadline' => ['required', 'date', 'after:today'],
        ];
    }
}
