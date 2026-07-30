<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\MergesCrossDatabaseResults;
use App\Models\Basketball\BasketballPlayer;
use App\Models\Player;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    use MergesCrossDatabaseResults;

    public function players(Request $request): JsonResponse
    {
        $sportParam = $request->query('sport');
        $sport = match (true) {
            $sportParam === 'all' => null,
            in_array($sportParam, ['football', 'basketball'], true) => $sportParam,
            default => session('sport', 'football'),
        };

        // `foot` only exists on the football players table - applying it to a
        // BasketballPlayer query would throw "Unknown column", so it's gated here.
        $filter = fn ($query, bool $isBasketball) => $query
            ->with(['academy:id,club_name,slug,logo_url', 'team:id,name'])
            ->visible()
            ->when($request->filled('position'), fn ($q) => $q->byPosition($request->string('position')))
            ->when(! $isBasketball && $request->filled('foot'), fn ($q) => $q->where('foot', $request->string('foot')))
            ->when($request->filled('nationality'), fn ($q) => $q->where('nationality', $request->string('nationality')))
            ->when($request->filled('min_height'), fn ($q) => $q->where('height_cm', '>=', $request->integer('min_height')))
            ->when($request->filled('age_min') || $request->filled('age_max'), fn ($q) => $q->ageBetween(
                $request->filled('age_min') ? $request->integer('age_min') : null,
                $request->filled('age_max') ? $request->integer('age_max') : null,
            ))
            ->when($request->filled('q'), fn ($q) => $q->where('full_name', 'like', '%'.$request->string('q').'%'));

        // Football and basketball players live in two physically separate
        // databases - a single sport queries its own table directly, but "all"
        // has no single SQL query available, so both are fetched and merged.
        $players = match ($sport) {
            'basketball' => $filter(BasketballPlayer::query(), true)->latest()->paginate(12)->withQueryString(),
            'football' => $filter(Player::query(), false)->latest()->paginate(12)->withQueryString(),
            default => $this->paginateMerged(
                $filter(Player::query(), false)->get()->concat($filter(BasketballPlayer::query(), true)->get()),
                $request
            ),
        };

        return response()->json([
            'data' => $players->map(fn (Player $player) => [
                'id' => $player->id,
                'slug' => $player->slug,
                'full_name' => $player->full_name,
                'age' => $player->age,
                'sport' => $player->sport,
                'position' => $player->position,
                'nationality' => $player->nationality,
                'foot' => $player->foot,
                'dominant_hand' => $player->dominant_hand,
                'height_cm' => $player->height_cm,
                'primary_photo_url' => $player->primary_photo_url ? asset('storage/'.$player->primary_photo_url) : null,
                'club_name' => $player->academy?->club_name ?? __('Free Agent'),
                'club_slug' => $player->academy?->slug,
                'url' => route('player.show', $player),
            ]),
            'current_page' => $players->currentPage(),
            'last_page' => $players->lastPage(),
            'has_more' => $players->hasMorePages(),
        ]);
    }
}
