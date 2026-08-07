<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAgentRecommendationRequest;
use App\Http\Requests\UpdateAgentRecommendationStatusRequest;
use App\Models\AgentProfile;
use App\Models\AgentRecommendation;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AgentRecommendationController extends Controller
{
    public function store(StoreAgentRecommendationRequest $request, AgentProfile $agent): RedirectResponse
    {
        AgentRecommendation::create(array_merge($request->validated(), [
            'recommender_user_id' => $request->user()->id,
            'agent_profile_id' => $agent->id,
            'sport' => $agent->sport,
            'status' => AgentRecommendation::STATUS_PENDING,
        ]));

        return back()->with('status', __('Your recommendation has been recorded. This is an informational record only - :app does not process payments or guarantee any commission arrangement between the parties.', ['app' => config('app.name')]));
    }

    /**
     * agentProfile()/player() branch on $this->sport per-instance (needed since
     * agent_profiles/players are split across two physical databases), which
     * eager loading can't resolve correctly - left to resolve lazily per-row.
     */
    public function index(Request $request): View
    {
        $user = $request->user();

        $sent = AgentRecommendation::where('recommender_user_id', $user->id)->latest()->get();

        $received = $user->playerProfile
            ? AgentRecommendation::where('player_id', $user->playerProfile->id)->latest()->get()
            : collect();

        return view('recommendations.index', ['sent' => $sent, 'received' => $received]);
    }

    public function updateStatus(UpdateAgentRecommendationStatusRequest $request, AgentRecommendation $agentRecommendation): RedirectResponse
    {
        $agentRecommendation->update(['status' => $request->validated('status')]);

        return back()->with('status', __('Recommendation updated.'));
    }
}
