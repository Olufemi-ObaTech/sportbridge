<?php

namespace App\Http\Controllers;

use App\Models\Player;
use App\Services\WatchlistService;
use Illuminate\Contracts\View\View;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WatchlistController extends Controller
{
    public function __construct(protected WatchlistService $watchlists) {}

    public function index(Request $request): View
    {
        $agent = $request->user()->agentProfile;

        $players = $agent->watchedPlayers()->with('academy', 'team')->paginate(12);

        return view('agent.watchlist.index', ['players' => $players]);
    }

    public function toggle(Request $request, Player $player): JsonResponse
    {
        abort_unless($request->user()->role === 'agent' && $request->user()->isActive(), 403);

        $agent = $request->user()->agentProfile;

        // Player/watchlists are split across two physical databases with independent
        // id sequences - the agent's own sport must match the player's, or a mismatched
        // pair would write a cross-database id into the wrong watchlists table.
        abort_unless($agent->sport === $player->sport, 403);

        $result = $this->watchlists->toggle($agent, $player);

        return response()->json($result);
    }
}
