<?php

namespace App\Policies;

use App\Models\Conversation;
use App\Models\User;

class ConversationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isActive();
    }

    public function view(User $user, Conversation $conversation): bool
    {
        return $this->isParticipant($user, $conversation) || $user->isSuperAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isActive();
    }

    public function reply(User $user, Conversation $conversation): bool
    {
        return $this->isParticipant($user, $conversation);
    }

    protected function isParticipant(User $user, Conversation $conversation): bool
    {
        return $user->id === $conversation->initiator_id || $user->id === $conversation->recipient_id;
    }
}
