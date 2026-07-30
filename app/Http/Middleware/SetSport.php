<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * SportBridge is a 2-in-1 platform (football + basketball). This resolves
 * the visitor's current sport context for the request, mirroring SetLocale's
 * session-backed pattern so the rest of the app can read session('sport')
 * as a reliable default for filtering players/jobs/feed and registration forms.
 */
class SetSport
{
    public const SUPPORTED = ['football', 'basketball'];

    public const DEFAULT = 'football';

    public function handle(Request $request, Closure $next): Response
    {
        $sport = $request->session()->get('sport', self::DEFAULT);

        if (! in_array($sport, self::SUPPORTED, true)) {
            $sport = self::DEFAULT;
            $request->session()->put('sport', $sport);
        }

        return $next($request);
    }
}
