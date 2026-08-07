<?php

namespace App\Http\Requests;

use App\Models\JobPost;
use Illuminate\Foundation\Http\FormRequest;

class UpdateJobRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->can('update', $this->route('job_post'));
    }

    public function rules(): array
    {
        // Sport is not editable here - a job post's sport is fixed at creation
        // because it determines which physical database the row lives in
        // (JobPost vs BasketballJobPost); changing it would leave the row in
        // the wrong table for its new sport.
        $roles = JobPost::rolesFor($this->route('job_post')?->sport);

        return [
            'title' => ['required', 'string', 'max:255'],
            'role_type' => ['required', 'in:'.implode(',', array_keys($roles))],
            'description' => ['required', 'string', 'max:10000'],
            'requirements' => ['nullable', 'string', 'max:5000'],
            'location' => ['required', 'string', 'max:255'],
            'salary_min' => ['nullable', 'integer', 'min:0'],
            'salary_max' => ['nullable', 'integer', 'min:0', 'gte:salary_min'],
            'currency' => ['nullable', 'string', 'size:3'],
            'contract_type' => ['required', 'in:full_time,part_time,contract,volunteer'],
            'application_deadline' => ['required', 'date'],
            'status' => ['required', 'in:open,filled,closed'],
        ];
    }
}
