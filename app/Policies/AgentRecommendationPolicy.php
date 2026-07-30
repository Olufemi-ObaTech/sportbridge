<?php

namespace App\Policies;

use App\Models\AgentRecommendation;
use App\Models\User;

class AgentRecommendationPolicy
{
    /**
     * Only the referenced player (if a platform user) or a super admin may
     * acknowledge/decline a recommendation - the recommender doesn't get to
     * decide the outcome of their own referral.
     */
    public function updateStatus(User $user, AgentRecommendation $recommendation): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        $playerUserId = $recommendation->player?->user_id;

        return $playerUserId !== null && $playerUserId === $user->id;
    }
}
