<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAgentRatingRequest;
use App\Models\AgentProfile;
use App\Models\AgentRating;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;

class AgentRatingController extends Controller
{
    public function store(StoreAgentRatingRequest $request, AgentProfile $agent): RedirectResponse
    {
        abort_if($request->user()->agentProfile?->id === $agent->id, 403, __('You cannot rate your own agent profile.'));

        $attributes = ['user_id' => $request->user()->id, 'agent_profile_id' => $agent->id];
        $values = array_merge($request->validated(), ['sport' => $agent->sport]);

        try {
            AgentRating::updateOrCreate($attributes, $values);
        } catch (QueryException) {
            // Two near-simultaneous submits from the same user can both miss the
            // initial SELECT and race the unique(user_id, agent_profile_id)
            // constraint - fall back to a plain update for the loser instead of a 500.
            AgentRating::where($attributes)->update($values);
        }

        return back()->with('status', __('Your rating has been saved.'));
    }
}
