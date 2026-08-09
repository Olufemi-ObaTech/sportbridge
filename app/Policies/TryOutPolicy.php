<?php

namespace App\Policies;

use App\Models\TryOut;
use App\Models\User;

class TryOutPolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, TryOut $tryOut): bool
    {
        return true;
    }

    /**
     * Any active, signed-in user can post a try-out opportunity - academies,
     * agents, coaches, and players alike.
     */
    public function create(User $user): bool
    {
        return $user->isActive();
    }

    public function update(User $user, TryOut $tryOut): bool
    {
        return $this->owns($user, $tryOut) || $user->isSuperAdmin();
    }

    public function close(User $user, TryOut $tryOut): bool
    {
        return $this->owns($user, $tryOut) || $user->isSuperAdmin();
    }

    public function delete(User $user, TryOut $tryOut): bool
    {
        return $this->owns($user, $tryOut) || $user->isSuperAdmin();
    }

    /**
     * Only players express interest in a try-out, and only for their own
     * sport - a football tryout is meaningless for a basketball player's
     * profile and vice versa.
     */
    public function expressInterest(User $user, TryOut $tryOut): bool
    {
        return $user->role === User::ROLE_PLAYER
            && $user->isActive()
            && $user->sport === $tryOut->sport
            && $tryOut->isOpen();
    }

    /**
     * Only the poster (or a Super Admin) sees who has expressed interest -
     * an applicant list is not public.
     */
    public function viewInterests(User $user, TryOut $tryOut): bool
    {
        return $this->owns($user, $tryOut) || $user->isSuperAdmin();
    }

    protected function owns(User $user, TryOut $tryOut): bool
    {
        return $user->isActive() && $user->id === $tryOut->posted_by_user_id;
    }
}
