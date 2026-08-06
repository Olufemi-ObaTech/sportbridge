<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Basketball\BasketballJobPost;
use App\Models\Basketball\BasketballPlayer;
use App\Models\JobPost;
use App\Models\Player;
use App\Models\User;
use Illuminate\Contracts\View\View;

class AnalyticsController extends Controller
{
    /**
     * Every count here reads live from the main `users` table (role/status
     * breakdowns) or a single-table count on each sport's own connection
     * (players/jobs) - no cross-database join is needed for simple counts,
     * unlike the merged-listing pages elsewhere in the app.
     */
    public function index(): View
    {
        $roleCounts = User::query()
            ->selectRaw('role, count(*) as total')
            ->groupBy('role')
            ->pluck('total', 'role');

        $statusCounts = User::query()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        // 12 small range-count queries rather than one grouped-by-week query:
        // MySQL (production) and SQLite (tests) use different date-truncation
        // functions, so doing the bucketing in PHP keeps this portable.
        $weeklyRegistrations = collect(range(11, 0))->map(function (int $weeksAgo) {
            $start = now()->subWeeks($weeksAgo)->startOfWeek();
            $end = (clone $start)->endOfWeek();

            return [
                'label' => $start->format('M j'),
                'count' => User::whereBetween('created_at', [$start, $end])->count(),
            ];
        })->values();

        return view('admin.analytics.index', [
            'totalUsers' => User::count(),
            'roleCounts' => $roleCounts,
            'statusCounts' => $statusCounts,
            'weeklyRegistrations' => $weeklyRegistrations,
            'footballPlayers' => Player::count(),
            'basketballPlayers' => BasketballPlayer::count(),
            'footballJobs' => JobPost::count(),
            'basketballJobs' => BasketballJobPost::count(),
        ]);
    }
}
