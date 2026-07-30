<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFeedPostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->can('update', $this->route('feed_post'));
    }

    public function rules(): array
    {
        return [
            'content' => ['required', 'string', 'max:3000'],
            'visibility' => ['nullable', 'in:public,connections'],
        ];
    }
}
