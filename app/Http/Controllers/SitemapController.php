<?php

namespace App\Http\Controllers;

use App\Models\AcademyProfile;
use App\Models\Basketball\BasketballJobPost;
use App\Models\Basketball\BasketballPlayer;
use App\Models\JobPost;
use App\Models\Player;
use App\Models\User;
use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Support\Facades\Cache;

/**
 * Every URL here is public and crawlable without auth - dashboards, inbox,
 * and other private areas are deliberately excluded (also disallowed in
 * robots.txt). Cached briefly since this queries across three databases
 * and search engines re-crawl on their own schedule, not every request.
 */
class SitemapController extends Controller
{
    public function index(ResponseFactory $response)
    {
        $xml = Cache::remember('sitemap.xml', now()->addHour(), function () {
            $urls = collect([
                ['loc' => route('home'), 'priority' => '1.0'],
                ['loc' => route('players.index'), 'priority' => '0.9'],
                ['loc' => route('jobs.index'), 'priority' => '0.9'],
                ['loc' => route('feed.index'), 'priority' => '0.7'],
                ['loc' => route('register'), 'priority' => '0.6'],
                ['loc' => route('login'), 'priority' => '0.3'],
            ]);

            // The 8 role-specific registration landing pages are the actual
            // valuable SEO targets ("register as a football agent" etc.) -
            // not just the generic chooser page above.
            foreach (['academy', 'agent', 'coach', 'player'] as $role) {
                foreach (['football', 'basketball'] as $sport) {
                    $urls->push(['loc' => route("register.{$role}", $sport), 'priority' => '0.7']);
                }
            }

            foreach (AcademyProfile::query()->whereHas('user', fn ($q) => $q->active())->limit(1000)->get() as $academy) {
                $urls->push(['loc' => route('academy.show', $academy), 'priority' => '0.8']);
            }

            foreach (User::role(User::ROLE_AGENT)->active()->limit(1000)->get() as $agent) {
                $urls->push(['loc' => route('agent.show', $agent->username), 'priority' => '0.6']);
            }

            foreach (User::role(User::ROLE_COACH)->active()->limit(1000)->get() as $coach) {
                $urls->push(['loc' => route('coach.show', $coach->username), 'priority' => '0.6']);
            }

            foreach (Player::visible()->limit(1000)->get() as $player) {
                $urls->push(['loc' => route('player.show', $player), 'priority' => '0.7']);
            }
            foreach (BasketballPlayer::visible()->limit(1000)->get() as $player) {
                $urls->push(['loc' => route('player.show', $player), 'priority' => '0.7']);
            }

            foreach (JobPost::open()->limit(500)->get() as $job) {
                $urls->push(['loc' => route('jobs.show', $job), 'priority' => '0.5']);
            }
            foreach (BasketballJobPost::open()->limit(500)->get() as $job) {
                $urls->push(['loc' => route('jobs.show', $job), 'priority' => '0.5']);
            }

            return view('sitemap', ['urls' => $urls])->render();
        });

        return $response->make($xml, 200, ['Content-Type' => 'application/xml']);
    }
}
