<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateAgentProfileRequest;
use App\Services\ImageService;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Mews\Purifier\Facades\Purifier;

class AgentProfileController extends Controller
{
    public function __construct(protected ImageService $images) {}

    public function edit(Request $request): View
    {
        $agent = $request->user()->agentProfile()
            ->withAvg('ratings', 'score')
            ->withCount('ratings')
            ->firstOrFail();

        return view('agent.profile.edit', ['agent' => $agent]);
    }

    public function update(UpdateAgentProfileRequest $request): RedirectResponse
    {
        $agent = $request->user()->agentProfile;
        $data = $request->validated();
        $data['about'] = isset($data['about']) ? Purifier::clean($data['about']) : $agent->about;

        if ($request->hasFile('cover_image')) {
            $this->images->delete($agent->cover_image_url);
            $data['cover_image_url'] = $this->images->storePublicImage($request->file('cover_image'), 'agents/covers', 1600);
        }

        if ($request->hasFile('photo')) {
            $this->images->delete($agent->photo_url);
            $data['photo_url'] = $this->images->storePublicImage($request->file('photo'), 'agents/photos', 800);
        }

        // Re-declaring a different verifying body invalidates the existing badge.
        if (($data['verification_body'] ?? null) !== $agent->verification_body) {
            $data['verified_badge'] = false;
        }

        unset($data['cover_image'], $data['photo']);

        $agent->update($data);

        return back()->with('status', __('Profile updated successfully.'));
    }
}
