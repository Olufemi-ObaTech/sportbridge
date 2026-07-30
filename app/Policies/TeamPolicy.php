<?php

namespace App\Policies;

use App\Models\Team;
use App\Models\User;

class TeamPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === User::ROLE_ACADEMY && $user->isActive();
    }

    public function view(User $user, Team $team): bool
    {
        return $this->owns($user, $team) || $user->isSuperAdmin();
    }

    public function create(User $user): bool
    {
        return $user->role === User::ROLE_ACADEMY && $user->isActive();
    }

    public function update(User $user, Team $team): bool
    {
        return $this->owns($user, $team);
    }

    public function delete(User $user, Team $team): bool
    {
        return $this->owns($user, $team) || $user->isSuperAdmin();
    }

    protected function owns(User $user, Team $team): bool
    {
        return $user->role === User::ROLE_ACADEMY
            && $user->isActive()
            && $user->academyProfile
            && $user->academyProfile->id === $team->academy_id;
    }
}
