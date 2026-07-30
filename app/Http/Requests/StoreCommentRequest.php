<?php

namespace App\Http\Requests;

use App\Models\FeedPost;
use Illuminate\Foundation\Http\FormRequest;

class StoreCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $post = $this->route('feed_post');

        return $post instanceof FeedPost && (bool) $this->user()?->can('comment', $post);
    }

    public function rules(): array
    {
        return [
            'body' => ['required', 'string', 'max:1000'],
        ];
    }
}
