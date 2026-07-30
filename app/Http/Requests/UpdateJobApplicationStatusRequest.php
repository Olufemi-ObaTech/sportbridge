<?php

namespace App\Http\Requests;

use App\Models\JobApplication;
use Illuminate\Foundation\Http\FormRequest;

class UpdateJobApplicationStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var JobApplication|null $application */
        $application = $this->route('job_application');

        return $application instanceof JobApplication
            && (bool) $this->user()?->can('manageApplications', $application->jobPost);
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'in:pending,shortlisted,rejected,hired'],
        ];
    }
}
