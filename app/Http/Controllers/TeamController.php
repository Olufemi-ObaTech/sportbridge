<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTeamRequest;
use App\Http\Requests\UpdateTeamRequest;
use App\Models\Player;
use App\Models\Team;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TeamController extends Controller
{
    public function index(Request $request): View
    {
        $academy = $request->user()->academyProfile;

        // A multi-sport academy's teams span two physical databases - merge both
        // in PHP (small per-academy counts) rather than a single SQL query. This
        // list isn't paginated in the view, so just sort - no need to slice a page.
        $teams = $academy->teams()->withCount('players')->get()
            ->concat($academy->basketballTeams()->withCount('players')->get())
            ->sortByDesc('created_at')
            ->values();

        return view('academy.teams.index', ['teams' => $teams]);
    }

    public function create(): View
    {
        $this->authorize('create', Team::class);

        return view('academy.teams.create');
    }

    public function store(StoreTeamRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $academy = $request->user()->academyProfile;

        $team = $data['sport'] === Player::SPORT_BASKETBALL
            ? $academy->basketballTeams()->create($data)
            : $academy->teams()->create($data);

        return redirect()->route('academy.teams.show', $team)->with('status', __('Team created successfully.'));
    }

    public function show(Team $team): View
    {
        $this->authorize('view', $team);

        $team->load(['players' => fn ($q) => $q->latest()]);

        return view('academy.teams.show', ['team' => $team]);
    }

    public function edit(Team $team): View
    {
        $this->authorize('update', $team);

        return view('academy.teams.edit', ['team' => $team]);
    }

    public function update(UpdateTeamRequest $request, Team $team): RedirectResponse
    {
        $team->update($request->validated());

        return redirect()->route('academy.teams.show', $team)->with('status', __('Team updated successfully.'));
    }

    public function destroy(Team $team): RedirectResponse
    {
        $this->authorize('delete', $team);

        $team->delete();

        return redirect()->route('academy.teams.index')->with('status', __('Team removed.'));
    }
}
