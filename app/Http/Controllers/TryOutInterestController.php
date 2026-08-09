<?php

namespace App\Http\Controllers;

use App\Models\TryOut;
use App\Models\TryOutInterest;
use App\Notifications\TryOutInterestNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TryOutInterestController extends Controller
{
    public function store(Request $request, TryOut $tryOut): RedirectResponse
    {
        $this->authorize('expressInterest', $tryOut);

        $data = $request->validate([
            'message' => ['nullable', 'string', 'max:1000'],
        ]);

        $interest = TryOutInterest::firstOrCreate(
            ['try_out_id' => $tryOut->id, 'user_id' => $request->user()->id],
            ['message' => $data['message'] ?? null]
        );

        if ($interest->wasRecentlyCreated) {
            // The poster may have since deleted their own account (soft delete) -
            // belongsTo() then resolves to null under the default soft-delete scope.
            $tryOut->postedByUser?->notify(new TryOutInterestNotification($tryOut, $request->user()));
        }

        return back()->with('status', __("You've expressed interest in this try-out."));
    }

    public function destroy(Request $request, TryOut $tryOut): RedirectResponse
    {
        TryOutInterest::where('try_out_id', $tryOut->id)
            ->where('user_id', $request->user()->id)
            ->delete();

        return back()->with('status', __('Interest withdrawn.'));
    }
}
