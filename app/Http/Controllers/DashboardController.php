<?php

namespace App\Http\Controllers;

use App\Models\FeedPost;
use App\Models\Message;
use App\Models\User;
use App\Services\ProfileCompletenessService;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class DashboardController extends Controller
{
    public function __construct(protected ProfileCompletenessService $completeness) {}

    public function index(Request $request): View|RedirectResponse
    {
        $user = $request->user();

        if ($user->isSuperAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        if ($user->isPending()) {
            return view('dashboard.pending', ['profile' => $user->profile()]);
        }

        return match ($user->role) {
            User::ROLE_ACADEMY => $this->academyDashboard($user),
            User::ROLE_AGENT => $this->agentDashboard($user),
            User::ROLE_COACH => $this->coachDashboard($user),
            User::ROLE_PLAYER => $this->playerDashboard($user),
            default => abort(403),
        };
    }

    /**
     * A multi-sport academy's teams/players/jobs/access-requests span two
     * physical databases - every stat and "recent" list here adds in the
     * basketball side (`basketballTeams()` etc. on AcademyProfile) rather
     * than only ever reflecting the football half of the roster.
     */
    protected function academyDashboard(User $user): View
    {
        $academy = $user->academyProfile()->with(['teams', 'players'])->firstOrFail();

        $stats = [
            'teams' => $academy->teams()->count() + $academy->basketballTeams()->count(),
            'players' => $academy->players()->count() + $academy->basketballPlayers()->count(),
            'open_jobs' => $academy->jobPosts()->open()->count() + $academy->basketballJobPosts()->open()->count(),
            'pending_access_requests' => $academy->accessRequests()->where('status', 'pending')->count()
                + $academy->basketballAccessRequests()->where('status', 'pending')->count(),
        ];

        $recentJobPosts = $academy->jobPosts()->latest()->take(5)->get()
            ->concat($academy->basketballJobPosts()->latest()->take(5)->get())
            ->sortByDesc('created_at')->take(5)->values();

        $recentPlayers = $academy->players()->latest()->take(5)->get()
            ->concat($academy->basketballPlayers()->latest()->take(5)->get())
            ->sortByDesc('created_at')->take(5)->values();

        return view('academy.dashboard', [
            'academy' => $academy,
            'stats' => $stats,
            'completeness' => $this->completeness->forAcademy($academy),
            'unreadMessages' => $this->unreadMessageCount($user),
            'recentJobPosts' => $recentJobPosts,
            'recentPlayers' => $recentPlayers,
            'myMediaPosts' => $this->myMediaPosts($user),
        ]);
    }

    protected function agentDashboard(User $user): View
    {
        $agent = $user->agentProfile()->with('watchlists')->firstOrFail();
        $agent->setRelation('documents', $agent->documents()->latest()->get());

        $stats = [
            'watchlist' => $agent->watchlists()->count(),
            'pending_access_requests' => $agent->accessRequests()->where('status', 'pending')->count(),
            'granted_access' => $agent->accessRequests()->where('status', 'granted')->count(),
        ];

        return view('agent.dashboard', [
            'agent' => $agent,
            'stats' => $stats,
            'completeness' => $this->completeness->forAgent($agent),
            'unreadMessages' => $this->unreadMessageCount($user),
            'watchedPlayers' => $agent->watchedPlayers()->with('academy')->latest('watchlists.created_at')->take(5)->get(),
            'myMediaPosts' => $this->myMediaPosts($user),
        ]);
    }

    protected function coachDashboard(User $user): View
    {
        $coach = $user->coachProfile()->with('jobApplications')->firstOrFail();

        $stats = [
            'applications' => $coach->jobApplications()->count(),
            'shortlisted' => $coach->jobApplications()->where('status', 'shortlisted')->count(),
            'hired' => $coach->jobApplications()->where('status', 'hired')->count(),
        ];

        return view('coach.dashboard', [
            'coach' => $coach,
            'stats' => $stats,
            'completeness' => $this->completeness->forCoach($coach),
            'unreadMessages' => $this->unreadMessageCount($user),
            'recentApplications' => $coach->jobApplications()->with('jobPost')->latest()->take(5)->get(),
            'myMediaPosts' => $this->myMediaPosts($user),
        ]);
    }

    protected function playerDashboard(User $user): View
    {
        $player = $user->playerProfile()->with('mediaAssets')->firstOrFail();

        $stats = [
            'profile_views' => $player->views_count,
            'media_items' => $player->mediaAssets()->count(),
            'watchlisted_by' => $player->watchlistedBy()->count(),
        ];

        return view('player.dashboard', [
            'player' => $player,
            'stats' => $stats,
            'completeness' => $this->completeness->forPlayer($player),
            'unreadMessages' => $this->unreadMessageCount($user),
            'myMediaPosts' => $this->myMediaPosts($user),
        ]);
    }

    /**
     * Every role can already upload photos/video via the Community Feed
     * (FeedPostPolicy::create has no role check) - this builds a gallery of
     * a user's own uploads from those posts rather than a separate media
     * table, so "my videos & photos" works identically for all four roles.
     */
    protected function myMediaPosts(User $user): Collection
    {
        return FeedPost::where('author_id', $user->id)->hasMedia()->latest()->take(12)->get();
    }

    protected function unreadMessageCount(User $user): int
    {
        return Message::whereHas('conversation', function ($query) use ($user) {
            $query->where('initiator_id', $user->id)->orWhere('recipient_id', $user->id);
        })
            ->where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->count();
    }
}
