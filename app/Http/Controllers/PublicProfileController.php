<?php

namespace App\Http\Controllers;

use App\Models\AcademyProfile;
use App\Models\FeedPost;
use App\Models\Player;
use App\Models\User;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class PublicProfileController extends Controller
{
    public function academy(AcademyProfile $academy): View
    {
        abort_unless($academy->user?->isActive(), 404);

        $academy->load(['teams', 'players' => fn ($q) => $q->visible()->latest()->limit(12)]);

        // A multi-sport academy's basketball teams/roster live in a separate
        // physical database - merge them into the same relations the view
        // already reads, rather than requiring separate view variables.
        $academy->setRelation('teams', $academy->teams->concat($academy->basketballTeams()->get()));
        $academy->setRelation(
            'players',
            $academy->players->concat($academy->basketballPlayers()->visible()->latest()->limit(12)->get())
        );

        $pinnedPost = $academy->user->feedPosts()->pinned()->latest()->first();
        $mediaPosts = $this->mediaPostsFor($academy->user->id);

        return view('public.academy', ['academy' => $academy, 'pinnedPost' => $pinnedPost, 'mediaPosts' => $mediaPosts]);
    }

    public function agent(string $username): View
    {
        $user = User::where('username', $username)->where('role', User::ROLE_AGENT)->active()->firstOrFail();

        // withAvg/withCount compile a correlated subquery against agent_ratings
        // on the *parent's own* connection - for a basketball agent that's
        // mysql_basketball, where agent_ratings doesn't exist (it's always in
        // the main database). AgentProfile's ratingsAvgScore/ratingsCount
        // accessors already fall back to computing this via ratings(), which
        // correctly forces the main connection - so just skip the eager load.
        $agent = $user->agentProfile()->firstOrFail();

        return view('public.agent', ['agent' => $agent, 'user' => $user, 'mediaPosts' => $this->mediaPostsFor($user->id)]);
    }

    public function coach(string $username): View
    {
        $user = User::where('username', $username)->where('role', User::ROLE_COACH)->active()->firstOrFail();
        $coach = $user->coachProfile;

        return view('public.coach', ['coach' => $coach, 'user' => $user, 'mediaPosts' => $this->mediaPostsFor($user->id)]);
    }

    public function player(Request $request, Player $player): View
    {
        $this->authorize('view', $player);

        $player->increment('views_count');
        $player->load(['team', 'academy', 'user', 'mediaAssets' => fn ($q) => $q->orderBy('sort_order')]);

        $canViewPrivateDetails = $request->user() && $request->user()->can('viewPrivateDetails', $player);

        return view('public.player', [
            'player' => $player,
            'canViewPrivateDetails' => $canViewPrivateDetails,
            'mediaPosts' => $player->user_id ? $this->mediaPostsFor($player->user_id) : collect(),
        ]);
    }

    /**
     * Every role can already upload photos/video via the Community Feed -
     * this surfaces a user's own uploads as a public gallery on their
     * profile, built from those posts rather than a separate media table.
     */
    protected function mediaPostsFor(int $userId): Collection
    {
        return FeedPost::where('author_id', $userId)->publicVisibility()->hasMedia()->latest()->take(12)->get();
    }
}
