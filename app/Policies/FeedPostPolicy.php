<?php

namespace App\Policies;

use App\Models\FeedPost;
use App\Models\User;

class FeedPostPolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, FeedPost $feedPost): bool
    {
        return $feedPost->visibility === 'public' || $user !== null;
    }

    public function create(User $user): bool
    {
        return $user->isActive();
    }

    public function update(User $user, FeedPost $feedPost): bool
    {
        return $user->id === $feedPost->author_id;
    }

    public function delete(User $user, FeedPost $feedPost): bool
    {
        return $user->id === $feedPost->author_id || $user->isSuperAdmin();
    }

    public function pin(User $user, FeedPost $feedPost): bool
    {
        return $user->id === $feedPost->author_id;
    }

    public function comment(User $user, FeedPost $feedPost): bool
    {
        return $user->isActive();
    }
}
