<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ModerationService;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(protected ModerationService $moderation) {}

    public function index(Request $request): View
    {
        $search = $request->string('q');

        // agentProfile/coachProfile branch on $this->sport per-instance, which eager
        // loading can't resolve correctly (see ModerationController::pending()) -
        // only academyProfile is safe to eager load; the rest resolve lazily per-row.
        $users = User::query()
            ->withTrashed()
            ->with(['academyProfile'])
            ->when($search->isNotEmpty(), function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhereHas('academyProfile', fn ($p) => $p->where('club_name', 'like', "%{$search}%")->orWhere('license_number', 'like', "%{$search}%"));
                });
            })
            ->when($request->filled('role'), fn ($q) => $q->where('role', $request->string('role')))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return view('admin.users.index', ['users' => $users, 'search' => (string) $search]);
    }

    public function restore(Request $request, int $user): RedirectResponse
    {
        $target = User::withTrashed()->findOrFail($user);
        $this->moderation->restore($request->user(), $target);

        return back()->with('status', __('Account restored.'));
    }
}
