<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountIsActive
{
    /**
     * Pending users can log in and see their read-only holding page (the
     * generic /dashboard route), but must not reach any role-specific
     * dashboard area (creating teams, posting jobs, messaging, etc.).
     * Suspended/denied users never get here - CheckUserStatus logs them out first.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && ! $request->user()->isActive()) {
            return redirect()->route('dashboard');
        }

        return $next($request);
    }
}
