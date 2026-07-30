<?php

namespace App\Policies;

use App\Models\JobPost;
use App\Models\User;

class JobPostPolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, JobPost $jobPost): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, [User::ROLE_ACADEMY, User::ROLE_AGENT, User::ROLE_COACH], true) && $user->isActive();
    }

    public function update(User $user, JobPost $jobPost): bool
    {
        return $this->owns($user, $jobPost);
    }

    public function delete(User $user, JobPost $jobPost): bool
    {
        return $this->owns($user, $jobPost) || $user->isSuperAdmin();
    }

    public function apply(User $user, JobPost $jobPost): bool
    {
        return $user->role === User::ROLE_COACH
            && $user->isActive()
            && $jobPost->status === 'open'
            // A coach's own sport must match the job post's: job_posts/job_applications
            // are split across two physical databases with independent id sequences, so
            // a mismatched pair would otherwise write a cross-database id into the wrong table.
            && $user->coachProfile?->sport === $jobPost->sport;
    }

    public function manageApplications(User $user, JobPost $jobPost): bool
    {
        return $this->owns($user, $jobPost);
    }

    protected function owns(User $user, JobPost $jobPost): bool
    {
        if (! $user->isActive()) {
            return false;
        }

        if ($user->role === User::ROLE_ACADEMY && $user->academyProfile) {
            return $user->academyProfile->id === $jobPost->academy_id;
        }

        return $user->id === $jobPost->posted_by_user_id;
    }
}
