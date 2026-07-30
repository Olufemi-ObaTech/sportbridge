<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateCoachProfileRequest;
use App\Services\ImageService;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Mews\Purifier\Facades\Purifier;

class CoachProfileController extends Controller
{
    public function __construct(protected ImageService $images) {}

    public function edit(Request $request): View
    {
        return view('coach.profile.edit', ['coach' => $request->user()->coachProfile]);
    }

    public function update(UpdateCoachProfileRequest $request): RedirectResponse
    {
        $coach = $request->user()->coachProfile;
        $data = $request->validated();
        $data['about'] = isset($data['about']) ? Purifier::clean($data['about']) : $coach->about;
        $data['open_to_work'] = $request->boolean('open_to_work');
        $data['certificates'] = array_values(array_filter(array_map('trim', explode("\n", $data['certificates'] ?? ''))));

        if ($request->hasFile('cover_image')) {
            $this->images->delete($coach->cover_image_url);
            $data['cover_image_url'] = $this->images->storePublicImage($request->file('cover_image'), 'coaches/covers', 1600);
        }

        if ($request->hasFile('photo')) {
            $this->images->delete($coach->photo_url);
            $data['photo_url'] = $this->images->storePublicImage($request->file('photo'), 'coaches/photos', 800);
        }

        if ($request->hasFile('cv')) {
            $this->images->delete($coach->cv_url, 'local');
            $data['cv_url'] = $this->images->storePrivateDocument($request->file('cv'), 'coach-cvs');
        }

        unset($data['cover_image'], $data['photo'], $data['cv']);

        $coach->update($data);

        return back()->with('status', __('Profile updated successfully.'));
    }
}
