<?php

namespace App\Http\Requests;

use App\Models\Player;
use Illuminate\Foundation\Http\FormRequest;

class StoreYoutubeRequest extends FormRequest
{
    public function authorize(): bool
    {
        $player = $this->route('player');

        return $player instanceof Player && (bool) $this->user()?->can('update', $player);
    }

    public function rules(): array
    {
        return [
            'url' => ['required', 'string', 'max:500'],
            'title' => ['nullable', 'string', 'max:255'],
        ];
    }
}
