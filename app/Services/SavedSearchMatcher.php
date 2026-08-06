<?php

namespace App\Services;

use App\Models\Basketball\BasketballPlayer;
use App\Models\Player;
use App\Models\SavedSearch;
use App\Notifications\SavedSearchMatchNotification;

class SavedSearchMatcher
{
    /**
     * Runs synchronously right after a player is created - no queue worker
     * exists in this deployment (see the ShouldQueue removal on every
     * Notification class), so this has to happen inline. Saved searches are
     * a small table at this project's scale, so a full scan per new player
     * is acceptable; this would need batching/indexing to survive real growth.
     */
    public function matchAndNotify(Player $player): void
    {
        if (! $player->is_public) {
            return;
        }

        $sport = $player instanceof BasketballPlayer ? 'basketball' : 'football';

        SavedSearch::where(fn ($q) => $q->whereNull('sport')->orWhere('sport', $sport))
            ->with('user')
            ->chunk(200, function ($searches) use ($player) {
                foreach ($searches as $search) {
                    if ($search->user && self::matches($player, $search->criteria)) {
                        $search->user->notify(new SavedSearchMatchNotification($player, $search));
                    }
                }
            });
    }

    public static function matches(Player $player, array $criteria): bool
    {
        if (! empty($criteria['position'])
            && $player->position !== $criteria['position']
            && $player->secondary_position !== $criteria['position']) {
            return false;
        }

        if (! empty($criteria['foot']) && $player->foot !== $criteria['foot']) {
            return false;
        }

        if (! empty($criteria['nationality']) && strcasecmp((string) $player->nationality, (string) $criteria['nationality']) !== 0) {
            return false;
        }

        if (! empty($criteria['min_height']) && (int) $player->height_cm < (int) $criteria['min_height']) {
            return false;
        }

        if (! empty($criteria['max_height']) && (int) $player->height_cm > (int) $criteria['max_height']) {
            return false;
        }

        if (! empty($criteria['age_min']) && $player->age < (int) $criteria['age_min']) {
            return false;
        }

        if (! empty($criteria['age_max']) && $player->age > (int) $criteria['age_max']) {
            return false;
        }

        if (! empty($criteria['q']) && ! str_contains(strtolower($player->full_name), strtolower((string) $criteria['q']))) {
            return false;
        }

        return true;
    }
}
