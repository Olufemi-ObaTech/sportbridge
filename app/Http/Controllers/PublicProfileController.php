<?php

namespace App\Http\Controllers;

use App\Models\AcademyProfile;
use App\Models\Player;
use App\Models\User;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;

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

        return view('public.academy', ['academy' => $academy, 'pinnedPost' => $pinnedPost]);
    }

    public function agent(string $username): View
    {
        $user = User::where('username', $username)->where('role', User::ROLE_AGENT)->active()->firstOrFail();
        $agent = $user->agentProfile()
            ->withAvg('ratings', 'score')
            ->withCount('ratings')
            ->firstOrFail();

        return view('public.agent', ['agent' => $agent, 'user' => $user]);
    }

    public function coach(string $username): View
    {
        $user = User::where('username', $username)->where('role', User::ROLE_COACH)->active()->firstOrFail();
        $coach = $user->coachProfile;

        return view('public.coach', ['coach' => $coach, 'user' => $user]);
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
        ]);
    }
}
