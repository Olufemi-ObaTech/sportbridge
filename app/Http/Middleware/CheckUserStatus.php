<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckUserStatus
{
    /**
     * Suspended or denied users are logged out on their next request.
     * Pending users pass through - they are restricted to the read-only
     * holding page by DashboardController and individual Policies instead.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && in_array($user->status, [User::STATUS_SUSPENDED, User::STATUS_DENIED], true)) {
            $message = $user->status === User::STATUS_SUSPENDED
                ? __('Your account has been suspended. Please contact support for more information.')
                : __('Your registration was not approved. Please contact support for more information.');

            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->with('status', $message);
        }

        return $next($request);
    }
}
