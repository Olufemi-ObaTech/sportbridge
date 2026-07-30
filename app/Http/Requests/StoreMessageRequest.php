<?php

namespace App\Http\Requests;

use App\Models\Conversation;
use Illuminate\Foundation\Http\FormRequest;

class StoreMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Conversation|null $conversation */
        $conversation = $this->route('conversation');

        return $conversation instanceof Conversation && (bool) $this->user()?->can('reply', $conversation);
    }

    public function rules(): array
    {
        return [
            'content' => ['required', 'string', 'max:5000'],
            'attachment' => ['nullable', 'file', 'max:5120'],
        ];
    }
}
