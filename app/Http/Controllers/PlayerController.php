<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\MergesCrossDatabaseResults;
use App\Http\Requests\StorePlayerRequest;
use App\Http\Requests\UpdatePlayerRequest;
use App\Models\Basketball\BasketballPlayer;
use App\Models\Player;
use App\Models\Team;
use App\Services\ImageService;
use App\Services\SavedSearchMatcher;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PlayerController extends Controller
{
    use MergesCrossDatabaseResults;

    public function __construct(protected ImageService $images, protected SavedSearchMatcher $savedSearchMatcher) {}

    public function index(Request $request): View
    {
        $academy = $request->user()->academyProfile;

        $filter = fn ($query) => $query->with('team')
            ->when($request->filled('team_id'), fn ($q) => $q->where('team_id', $request->integer('team_id')))
            ->when($request->filled('position'), fn ($q) => $q->byPosition($request->string('position')))
            ->when($request->filled('q'), fn ($q) => $q->where('full_name', 'like', '%'.$request->string('q').'%'));

        // A multi-sport academy's roster spans two physical databases - fetch
        // each side (per-academy roster sizes are small) and paginate the merge.
        $players = $filter($academy->players())->get()
            ->concat($filter($academy->basketballPlayers())->get());

        return view('academy.players.index', [
            'players' => $this->paginateMerged($players, $request, 15),
            'teams' => $academy->teams()->get()->concat($academy->basketballTeams()->get()),
        ]);
    }

    public function create(Team $team): View
    {
        $this->authorize('create', Player::class);

        return view('academy.players.create', ['team' => $team]);
    }

    public function store(StorePlayerRequest $request, Team $team): RedirectResponse
    {
        $data = $request->validated();
        $data['team_id'] = $team->id;
        $data['academy_id'] = $team->academy_id;
        $data['sport'] = $team->sport;
        $data['slug'] = Player::uniqueSlug($data['full_name']);
        $data['is_public'] = $request->boolean('is_public', true);
        $data['previous_clubs'] = array_values(array_filter(array_map('trim', explode("\n", $data['previous_clubs'] ?? ''))));

        if ($request->hasFile('primary_photo')) {
            $data['primary_photo_url'] = $this->images->storePublicImage($request->file('primary_photo'), 'players/photos', 800);
        }
        unset($data['primary_photo']);

        $playerModel = $team->sport === Player::SPORT_BASKETBALL ? BasketballPlayer::class : Player::class;
        $player = $playerModel::create(Player::sanitizeFootHand($data, $data['sport']));

        $this->savedSearchMatcher->matchAndNotify($player);

        return redirect()->route('academy.players.show', $player)->with('status', __('Player added successfully.'));
    }

    public function show(Player $player): View
    {
        $this->authorize('view', $player);

        $player->load(['team', 'mediaAssets' => fn ($q) => $q->orderBy('sort_order')]);

        return view('academy.players.show', ['player' => $player]);
    }

    public function edit(Player $player): View
    {
        $this->authorize('update', $player);

        return view('academy.players.edit', ['player' => $player, 'team' => $player->team]);
    }

    public function update(UpdatePlayerRequest $request, Player $player): RedirectResponse
    {
        $data = $request->validated();
        $data['is_public'] = $request->boolean('is_public', true);
        $data['previous_clubs'] = array_values(array_filter(array_map('trim', explode("\n", $data['previous_clubs'] ?? ''))));

        if ($request->hasFile('primary_photo')) {
            $this->images->delete($player->primary_photo_url);
            $data['primary_photo_url'] = $this->images->storePublicImage($request->file('primary_photo'), 'players/photos', 800);
        }
        unset($data['primary_photo']);

        $player->update(Player::sanitizeFootHand($data, $player->sport));

        return redirect()->route('academy.players.show', $player)->with('status', __('Player updated successfully.'));
    }

    public function destroy(Player $player): RedirectResponse
    {
        $this->authorize('delete', $player);

        $this->images->delete($player->primary_photo_url);
        $player->delete();

        return redirect()->route('academy.players.index')->with('status', __('Player removed.'));
    }
}
