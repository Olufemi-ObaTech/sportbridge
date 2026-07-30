<?php

namespace App\Providers;

use App\Models\AcademyProfile;
use App\Models\AgentProfile;
use App\Models\AgentRecommendation;
use App\Models\CoachProfile;
use App\Models\Conversation;
use App\Models\FeedPost;
use App\Models\JobPost;
use App\Models\Player;
use App\Models\Team;
use App\Policies\AgentRecommendationPolicy;
use App\Policies\ConversationPolicy;
use App\Policies\FeedPostPolicy;
use App\Policies\JobPostPolicy;
use App\Policies\PlayerPolicy;
use App\Policies\ProfilePolicy;
use App\Policies\TeamPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Player::class => PlayerPolicy::class,
        Team::class => TeamPolicy::class,
        JobPost::class => JobPostPolicy::class,
        FeedPost::class => FeedPostPolicy::class,
        Conversation::class => ConversationPolicy::class,
        AcademyProfile::class => ProfilePolicy::class,
        AgentProfile::class => ProfilePolicy::class,
        CoachProfile::class => ProfilePolicy::class,
        AgentRecommendation::class => AgentRecommendationPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();

        Gate::define('access-admin', fn ($user) => $user->isSuperAdmin());
    }
}
