<?php

namespace App\Http\Controllers;

use App\Models\Player;
use App\Models\Trial;
use App\Notifications\TrialProposedNotification;
use App\Notifications\TrialRespondedNotification;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TrialController extends Controller
{
    public function index(Request $request): View
    {
        $user = $request->user();

        $organized = $user->organizedTrials()->with('organizer')->orderByDesc('scheduled_at')->get();

        $footballPlayerIds = collect();
        $basketballPlayerIds = collect();

        if ($user->playerProfile) {
            $footballPlayerIds->push($user->playerProfile->id);
        }

        if ($academy = $user->academyProfile) {
            $footballPlayerIds = $footballPlayerIds->merge($academy->players()->pluck('id'));
            $basketballPlayerIds = $basketballPlayerIds->merge($academy->basketballPlayers()->pluck('id'));
        }

        $received = Trial::where(function ($query) use ($footballPlayerIds, $basketballPlayerIds) {
            $query->where(fn ($q) => $q->where('sport', 'football')->whereIn('player_id', $footballPlayerIds))
                ->orWhere(fn ($q) => $q->where('sport', 'basketball')->whereIn('player_id', $basketballPlayerIds));
        })->with('organizer')->orderByDesc('scheduled_at')->get();

        return view('trials.index', [
            'organized' => $organized,
            'received' => $received,
        ]);
    }

    public function store(Request $request, Player $player): RedirectResponse
    {
        $data = $request->validate([
            'scheduled_at' => ['required', 'date', 'after:now'],
            'location' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $trial = Trial::create([
            'organizer_user_id' => $request->user()->id,
            'player_id' => $player->id,
            'sport' => $player->sport,
            'scheduled_at' => $data['scheduled_at'],
            'location' => $data['location'] ?? null,
            'notes' => $data['notes'] ?? null,
            'status' => Trial::STATUS_PENDING,
        ]);

        $respondent = $trial->respondentUser();

        if ($respondent && $respondent->id !== $request->user()->id) {
            $respondent->notify(new TrialProposedNotification($trial));
        }

        return back()->with('status', __('Trial proposal sent.'));
    }

    public function respond(Request $request, Trial $trial): RedirectResponse
    {
        abort_unless($trial->respondentUser()?->id === $request->user()->id, 403);
        abort_unless($trial->isPending(), 409);

        $data = $request->validate([
            'decision' => ['required', 'in:accepted,declined'],
        ]);

        $trial->update([
            'status' => $data['decision'],
            'responded_at' => now(),
        ]);

        $trial->organizer->notify(new TrialRespondedNotification($trial));

        return back()->with('status', __('Response recorded.'));
    }

    public function cancel(Request $request, Trial $trial): RedirectResponse
    {
        abort_unless($trial->organizer_user_id === $request->user()->id, 403);
        abort_unless($trial->isPending(), 409);

        $trial->update(['status' => Trial::STATUS_CANCELLED]);

        return back()->with('status', __('Trial proposal cancelled.'));
    }
}
