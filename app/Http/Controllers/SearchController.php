<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\MergesCrossDatabaseResults;
use App\Models\AcademyProfile;
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

        // Resolved up front rather than a whereHas('academy', ...) below:
        // BasketballPlayer's academy_id points at AcademyProfile in the main
        // database, and Eloquent can't join across two physical connections -
        // the fix (see BasketballPlayer::scopeVisible) is to resolve matching
        // IDs from the main connection first, then whereIn() on the local column.
        $clubAcademyIds = $request->filled('club')
            ? AcademyProfile::where('club_name', 'like', '%'.$request->string('club').'%')->pluck('id')
            : null;

        // `foot` only exists on the football players table - applying it to a
        // BasketballPlayer query would throw "Unknown column", so it's gated here.
        $filter = fn ($query, bool $isBasketball) => $query
            ->with(['academy:id,club_name,slug,logo_url', 'team:id,name'])
            ->visible()
            ->when($request->filled('position'), fn ($q) => $q->byPosition($request->string('position')))
            ->when(! $isBasketball && $request->filled('foot'), fn ($q) => $q->where('foot', $request->string('foot')))
            ->when($request->filled('nationality'), fn ($q) => $q->where('nationality', $request->string('nationality')))
            ->when($request->filled('min_height'), fn ($q) => $q->where('height_cm', '>=', $request->integer('min_height')))
            ->when($request->filled('max_height'), fn ($q) => $q->where('height_cm', '<=', $request->integer('max_height')))
            ->when($request->filled('age_min') || $request->filled('age_max'), fn ($q) => $q->ageBetween(
                $request->filled('age_min') ? $request->integer('age_min') : null,
                $request->filled('age_max') ? $request->integer('age_max') : null,
            ))
            ->when($request->filled('q'), fn ($q) => $q->where('full_name', 'like', '%'.$request->string('q').'%'))
            ->when($clubAcademyIds !== null, fn ($q) => $q->whereIn('academy_id', $clubAcademyIds));

        [$sortColumn, $sortDirection] = match ($request->string('sort')->value()) {
            'oldest' => ['created_at', 'asc'],
            'name_asc' => ['full_name', 'asc'],
            'name_desc' => ['full_name', 'desc'],
            // Age is derived from dob, so "youngest first" is the newest
            // date of birth (dob desc) and vice versa.
            'age_asc' => ['dob', 'desc'],
            'age_desc' => ['dob', 'asc'],
            default => ['created_at', 'desc'],
        };

        // Football and basketball players live in two physically separate
        // databases - a single sport queries its own table directly, but "all"
        // has no single SQL query available, so both are fetched and merged.
        $players = match ($sport) {
            'basketball' => $filter(BasketballPlayer::query(), true)->orderBy($sortColumn, $sortDirection)->paginate(12)->withQueryString(),
            'football' => $filter(Player::query(), false)->orderBy($sortColumn, $sortDirection)->paginate(12)->withQueryString(),
            default => $this->paginateMerged(
                $filter(Player::query(), false)->get()->concat($filter(BasketballPlayer::query(), true)->get()),
                $request,
                12,
                $sortColumn,
                $sortDirection
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
