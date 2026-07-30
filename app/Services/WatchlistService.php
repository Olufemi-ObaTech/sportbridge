<?php

namespace App\Services;

use App\Models\AgentProfile;
use App\Models\Basketball\BasketballWatchlist;
use App\Models\Player;
use App\Models\Watchlist;

class WatchlistService
{
    /**
     * $player may be a Player or a BasketballPlayer (extends Player) - the
     * caller resolves which, based on the acting agent's own sport, before
     * reaching here. Both must already be the same sport: watchlists live
     * intra-database (real FK to agent_profiles/players within one connection),
     * so we pick the matching Watchlist/BasketballWatchlist table from the
     * agent's sport rather than trusting $player's class alone.
     *
     * @return array{watching: bool}
     */
    public function toggle(AgentProfile $agent, Player $player): array
    {
        $watchlistModel = $agent->sport === AgentProfile::SPORT_BASKETBALL
            ? BasketballWatchlist::class
            : Watchlist::class;

        $watchlist = $watchlistModel::where('agent_id', $agent->id)->where('player_id', $player->id)->first();

        if ($watchlist) {
            $watchlist->delete();

            return ['watching' => false];
        }

        $watchlistModel::create(['agent_id' => $agent->id, 'player_id' => $player->id]);

        return ['watching' => true];
    }
}
