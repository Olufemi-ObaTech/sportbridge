<?php

namespace App\Http\Requests;

use App\Models\Player;
use App\Models\Team;
use Illuminate\Foundation\Http\FormRequest;

class ImportPlayersRequest extends FormRequest
{
    public function authorize(): bool
    {
        $team = $this->route('team');

        return $team instanceof Team
            && $this->user()?->can('create', Player::class)
            && $this->user()->academyProfile?->id === $team->academy_id;
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'mimes:csv,xlsx,xls', 'max:5120'],
        ];
    }
}
