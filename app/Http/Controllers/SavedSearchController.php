<?php

namespace App\Http\Controllers;

use App\Models\SavedSearch;
use Illuminate\Contracts\View\View;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class SavedSearchController extends Controller
{
    public function index(Request $request): View
    {
        return view('saved-searches.index', [
            'savedSearches' => $request->user()->savedSearches()->latest()->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'criteria' => ['required', 'array'],
            'criteria.*' => ['nullable', 'string', 'max:100'],
        ]);

        $criteria = array_filter($data['criteria'], fn ($value) => $value !== '' && $value !== null);
        $sport = in_array($criteria['sport'] ?? null, ['football', 'basketball'], true) ? $criteria['sport'] : null;
        unset($criteria['sport'], $criteria['sort'], $criteria['page']);

        $request->user()->savedSearches()->create([
            'sport' => $sport,
            'label' => $this->describeCriteria($criteria),
            'criteria' => $criteria,
        ]);

        return response()->json(['status' => 'saved']);
    }

    public function destroy(Request $request, SavedSearch $savedSearch): RedirectResponse
    {
        abort_unless($savedSearch->user_id === $request->user()->id, 403);

        $savedSearch->delete();

        return back();
    }

    /**
     * Auto-generated so users don't have to type a name for every saved
     * search - just a readable summary of whichever filters were set.
     */
    private function describeCriteria(array $criteria): string
    {
        $parts = [];

        if (! empty($criteria['q'])) {
            $parts[] = '"'.$criteria['q'].'"';
        }
        if (! empty($criteria['position'])) {
            $parts[] = $criteria['position'];
        }
        if (! empty($criteria['age_min']) || ! empty($criteria['age_max'])) {
            $parts[] = 'Age '.($criteria['age_min'] ?? '?').'-'.($criteria['age_max'] ?? '?');
        }
        if (! empty($criteria['nationality'])) {
            $parts[] = $criteria['nationality'];
        }
        if (! empty($criteria['club'])) {
            $parts[] = $criteria['club'];
        }

        return $parts === [] ? __('All players') : implode(' · ', $parts);
    }
}
