<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdatePlayerProfileRequest;
use App\Models\Player;
use App\Services\ImageService;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PlayerProfileController extends Controller
{
    public function __construct(protected ImageService $images) {}

    public function edit(Request $request): View
    {
        return view('player.profile.edit', ['player' => $request->user()->playerProfile]);
    }

    public function update(UpdatePlayerProfileRequest $request): RedirectResponse
    {
        $player = $request->user()->playerProfile;
        $data = $request->validated();
        $data['is_public'] = $request->boolean('is_public');
        $data['previous_clubs'] = array_values(array_filter(array_map('trim', explode("\n", $data['previous_clubs'] ?? ''))));

        if ($request->hasFile('primary_photo')) {
            $this->images->delete($player->primary_photo_url);
            $data['primary_photo_url'] = $this->images->storePublicImage($request->file('primary_photo'), 'players/photos', 1000);
        }

        if ($request->hasFile('cv')) {
            $this->images->delete($player->cv_url, 'local');
            $data['cv_url'] = $this->images->storePrivateDocument($request->file('cv'), 'player-cvs');
        }

        unset($data['primary_photo'], $data['cv']);

        $player->update(Player::sanitizeFootHand($data, $player->sport));

        return back()->with('status', __('Profile updated successfully.'));
    }
}
