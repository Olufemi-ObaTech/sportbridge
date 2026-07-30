<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\DenyUserRequest;
use App\Http\Requests\Admin\SuspendUserRequest;
use App\Models\AcademyProfile;
use App\Models\AgentProfile;
use App\Models\User;
use App\Services\ModerationService;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ModerationController extends Controller
{
    public function __construct(protected ModerationService $moderation) {}

    /**
     * agentProfile()/coachProfile() branch on $this->sport per-instance (see
     * User::agentProfile()) - Eloquent's eager loading resolves a relation
     * once against a blank model, so it would always evaluate the branch as
     * football regardless of each row's real sport. Only `academyProfile`
     * (not sport-branching) is safe to eager load here; the other two are
     * left to resolve lazily per-row when the view accesses them.
     */
    public function pending(Request $request): View
    {
        $pending = User::with(['academyProfile'])
            ->pending()
            ->when($request->filled('role'), fn ($q) => $q->where('role', $request->string('role')))
            ->when($request->filled('from'), fn ($q) => $q->whereDate('created_at', '>=', $request->date('from')))
            ->when($request->filled('to'), fn ($q) => $q->whereDate('created_at', '<=', $request->date('to')))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $stats = [
            'total_users' => User::count(),
            'by_role' => User::selectRaw('role, count(*) as count')->groupBy('role')->pluck('count', 'role'),
            'pending_count' => User::pending()->count(),
            'new_this_week' => User::where('created_at', '>=', now()->subWeek())->count(),
        ];

        return view('admin.dashboard', ['pending' => $pending, 'stats' => $stats]);
    }

    public function approve(Request $request, User $user): RedirectResponse
    {
        $this->moderation->approve($request->user(), $user);

        return back()->with('status', __('Account approved.'));
    }

    public function deny(DenyUserRequest $request, User $user): RedirectResponse
    {
        $this->moderation->deny($request->user(), $user, $request->string('reason'));

        return back()->with('status', __('Account denied.'));
    }

    public function suspend(SuspendUserRequest $request, User $user): RedirectResponse
    {
        if ($blocked = $this->blockSelfOrLastAdmin($request->user(), $user, __('suspend'))) {
            return $blocked;
        }

        $this->moderation->suspend($request->user(), $user, $request->input('reason'));

        return back()->with('status', __('Account suspended.'));
    }

    public function reinstate(Request $request, User $user): RedirectResponse
    {
        $this->moderation->reinstate($request->user(), $user);

        return back()->with('status', __('Account reinstated.'));
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($blocked = $this->blockSelfOrLastAdmin($request->user(), $user, __('remove'))) {
            return $blocked;
        }

        $this->moderation->softDelete($request->user(), $user);

        return back()->with('status', __('Account deleted.'));
    }

    /**
     * Guard against an admin locking everyone out: no self-suspend/removal,
     * and never suspend/remove the last remaining active super admin.
     */
    protected function blockSelfOrLastAdmin(User $actingAdmin, User $target, string $action): ?RedirectResponse
    {
        if ($actingAdmin->id === $target->id) {
            return back()->withErrors(['user' => __('You cannot :action your own account.', ['action' => $action])]);
        }

        if ($target->isSuperAdmin()) {
            $otherActiveAdmins = User::role(User::ROLE_SUPER_ADMIN)
                ->active()
                ->where('id', '!=', $target->id)
                ->exists();

            if (! $otherActiveAdmins) {
                return back()->withErrors(['user' => __('You cannot :action the last active super admin.', ['action' => $action])]);
            }
        }

        return null;
    }

    public function verify(Request $request, AcademyProfile $academy): RedirectResponse
    {
        $this->moderation->verify($request->user(), $academy);

        return back()->with('status', __('Academy verified.'));
    }

    public function verifyAgent(Request $request, AgentProfile $agent): RedirectResponse
    {
        $this->moderation->verify($request->user(), $agent);

        return back()->with('status', __('Agent verified.'));
    }
}
