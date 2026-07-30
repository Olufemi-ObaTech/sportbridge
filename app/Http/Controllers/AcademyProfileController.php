<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateAcademyProfileRequest;
use App\Services\ImageService;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Mews\Purifier\Facades\Purifier;

class AcademyProfileController extends Controller
{
    public function __construct(protected ImageService $images) {}

    public function edit(Request $request): View
    {
        return view('academy.profile.edit', ['academy' => $request->user()->academyProfile]);
    }

    public function update(UpdateAcademyProfileRequest $request): RedirectResponse
    {
        $academy = $request->user()->academyProfile;
        $data = $request->validated();
        $data['about'] = isset($data['about']) ? Purifier::clean($data['about']) : $academy->about;
        $data['leagues'] = array_values(array_filter(array_map('trim', explode("\n", $data['leagues'] ?? ''))));
        $data['languages'] = $data['languages'] ?? [];

        if ($request->hasFile('logo')) {
            $this->images->delete($academy->logo_url);
            $data['logo_url'] = $this->images->storePublicImage($request->file('logo'), 'academies/logos', 600);
        }

        if ($request->hasFile('cover_image')) {
            $this->images->delete($academy->cover_image_url);
            $data['cover_image_url'] = $this->images->storePublicImage($request->file('cover_image'), 'academies/covers', 1600);
        }

        unset($data['logo'], $data['cover_image']);

        $academy->update($data);

        return back()->with('status', __('Profile updated successfully.'));
    }
}
