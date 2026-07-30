<?php

namespace App\Http\Requests;

use App\Models\Player;
use Illuminate\Foundation\Http\FormRequest;

class StoreMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        $player = $this->route('player');

        return $player instanceof Player && (bool) $this->user()?->can('update', $player);
    }

    public function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'max:255'],
            'image' => ['required_without:video', 'nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'video' => ['required_without:image', 'nullable', 'file', 'mimetypes:video/mp4,video/quicktime', 'max:51200'],
        ];
    }
}
