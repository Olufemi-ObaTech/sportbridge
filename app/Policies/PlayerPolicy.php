<?php

namespace App\Policies;

use App\Models\Player;
use App\Models\User;

class PlayerPolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Player $player): bool
    {
        if ($user?->isSuperAdmin()) {
            return true;
        }

        if ($player->is_public && $player->isOwnerActive()) {
            return true;
        }

        return $user && $this->owns($user, $player);
    }

    /**
     * Whether the user (an agent) has been granted access to the player's
     * private media and contact details via an approved access request.
     */
    public function viewPrivateDetails(?User $user, Player $player): bool
    {
        if (! $user) {
            return false;
        }

        if ($user->isSuperAdmin() || $this->owns($user, $player)) {
            return true;
        }

        if ($user->role !== User::ROLE_AGENT || ! $user->agentProfile) {
            return false;
        }

        return $player->accessRequests()
            ->where('agent_id', $user->agentProfile->id)
            ->where('status', 'granted')
            ->exists();
    }

    public function create(User $user): bool
    {
        return $user->role === User::ROLE_ACADEMY && $user->isActive();
    }

    public function update(User $user, Player $player): bool
    {
        return $this->owns($user, $player);
    }

    public function delete(User $user, Player $player): bool
    {
        return $this->owns($user, $player) || $user->isSuperAdmin();
    }

    protected function owns(User $user, Player $player): bool
    {
        if ($user->role === User::ROLE_PLAYER) {
            return $user->isActive() && $user->id === $player->user_id;
        }

        return $user->role === User::ROLE_ACADEMY
            && $user->isActive()
            && $user->academyProfile
            && $user->academyProfile->id === $player->academy_id;
    }
}
