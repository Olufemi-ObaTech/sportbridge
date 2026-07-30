<?php

namespace App\Http\Requests;

use App\Models\FeedPost;
use Illuminate\Foundation\Http\FormRequest;

class StoreFeedPostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->can('create', FeedPost::class);
    }

    public function rules(): array
    {
        return [
            'content' => ['required', 'string', 'max:3000'],
            'sport' => ['nullable', 'in:football,basketball'],
            'visibility' => ['nullable', 'in:public,connections'],
            'media' => ['nullable', 'array', 'max:4'],
            'media.*' => ['file', 'mimetypes:image/jpeg,image/png,image/webp,video/mp4,video/quicktime', 'max:51200'],
            'is_training' => ['nullable', 'boolean'],
            'training_link' => ['nullable', 'required_if:is_training,1', 'url', 'max:500'],
            'training_at' => ['nullable', 'date'],
            'is_live' => ['nullable', 'boolean'],
            'live_link' => ['nullable', 'required_if:is_live,1', 'url', 'max:500'],
            'live_at' => ['nullable', 'date'],
        ];
    }
}
