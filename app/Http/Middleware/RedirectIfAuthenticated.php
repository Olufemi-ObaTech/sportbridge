<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfAuthenticated
{
    /**
     * Send an already-authenticated user straight to their role's dashboard
     * instead of letting them view guest-only pages like /login or /register.
     */
    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                return redirect($this->redirectPath(Auth::guard($guard)->user()));
            }
        }

        return $next($request);
    }

    protected function redirectPath(User $user): string
    {
        return match ($user->role) {
            User::ROLE_SUPER_ADMIN => route('admin.dashboard'),
            User::ROLE_ACADEMY => route('academy.dashboard'),
            User::ROLE_AGENT => route('agent.dashboard'),
            User::ROLE_COACH => route('coach.dashboard'),
            default => route('dashboard'),
        };
    }
}
