<?php

namespace App\Http\Requests;

use App\Models\JobPost;
use Illuminate\Foundation\Http\FormRequest;

class ApplyJobRequest extends FormRequest
{
    public function authorize(): bool
    {
        $jobPost = $this->route('job_post');

        return $jobPost instanceof JobPost && (bool) $this->user()?->can('apply', $jobPost);
    }

    public function rules(): array
    {
        return [
            'cover_letter' => ['required', 'string', 'max:5000'],
            'cv' => ['nullable', 'file', 'mimes:pdf,docx', 'max:5120'],
        ];
    }
}
