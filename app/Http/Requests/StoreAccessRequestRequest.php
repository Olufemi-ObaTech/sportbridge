<?php

namespace App\Http\Requests;

use App\Models\Player;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class StoreAccessRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        $player = $this->route('player');

        return $player instanceof Player
            && $this->user()?->role === User::ROLE_AGENT
            && $this->user()->isActive()
            // Player/access_requests are split across two physical databases with
            // independent id sequences - the agent's own sport must match the
            // player's, or a mismatched pair would write a cross-database id
            // into the wrong access_requests table.
            && $this->user()->agentProfile?->sport === $player->sport;
    }

    public function rules(): array
    {
        return [
            'message' => ['required', 'string', 'max:2000'],
        ];
    }
}
