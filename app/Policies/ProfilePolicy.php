<?php

namespace App\Policies;

use App\Models\AcademyProfile;
use App\Models\AgentProfile;
use App\Models\CoachProfile;
use App\Models\User;

/**
 * Shared policy for AcademyProfile, AgentProfile, and CoachProfile - each is a
 * one-to-one extension of a User, so "owning" it just means being that user.
 */
class ProfilePolicy
{
    public function view(?User $user, AcademyProfile|AgentProfile|CoachProfile $profile): bool
    {
        return true;
    }

    public function update(User $user, AcademyProfile|AgentProfile|CoachProfile $profile): bool
    {
        return $user->id === $profile->user_id || $user->isSuperAdmin();
    }
}
