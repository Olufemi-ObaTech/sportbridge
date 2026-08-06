<?php

use App\Http\Controllers\AcademyProfileController;
use App\Http\Controllers\AccessRequestController;
use App\Http\Controllers\Admin\AnalyticsController;
use App\Http\Controllers\Admin\DataRecordsController;
use App\Http\Controllers\Admin\LogController;
use App\Http\Controllers\Admin\ModerationController;
use App\Http\Controllers\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\AgentDocumentController;
use App\Http\Controllers\AgentProfileController;
use App\Http\Controllers\AgentRatingController;
use App\Http\Controllers\AgentRecommendationController;
use App\Http\Controllers\CoachProfileController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\FeedController;
use App\Http\Controllers\JobApplicationController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\PlayerImportController;
use App\Http\Controllers\PlayerProfileController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicProfileController;
use App\Http\Controllers\PushSubscriptionController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SavedSearchController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\SportController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\TrialController;
use App\Http\Controllers\WatchlistController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public routes (no auth required)
|--------------------------------------------------------------------------
*/

Route::view('/', 'welcome')->name('home');

Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');

// Dynamic (not a static public/robots.txt file) so the Sitemap: line always
// matches the real APP_URL instead of going stale if the domain changes.
Route::get('/robots.txt', function () {
    // Registration/login pages stay crawlable on purpose - they're exactly
    // the landing pages worth ranking for ("register as a football agent"
    // etc.). Only genuinely private or purely functional (no content of
    // their own) paths are blocked.
    $disallow = ['/dashboard', '/inbox', '/admin', '/password', '/verify-email'];

    $lines = array_merge(
        ['User-agent: *'],
        array_map(fn ($path) => "Disallow: {$path}", $disallow),
        ['', 'Sitemap: '.route('sitemap')]
    );

    return response(implode("\n", $lines), 200, ['Content-Type' => 'text/plain']);
})->name('robots');

Route::get('/locale/{locale}', [LocaleController::class, 'update'])
    ->middleware('throttle:60,1')
    ->name('locale.update');

Route::get('/sport/{sport}', [SportController::class, 'update'])
    ->middleware('throttle:60,1')
    ->name('sport.update');

Route::get('/players', function () {
    return view('players.index');
})->name('players.index');

Route::get('/jobs', [JobController::class, 'index'])->name('jobs.index');
Route::get('/jobs/{jobPost}', [JobController::class, 'show'])->name('jobs.show');

Route::get('/feed', [FeedController::class, 'index'])->name('feed.index');

/*
|--------------------------------------------------------------------------
| Authenticated routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified', 'status'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Feed (posting/interacting requires an active account - enforced by Policies/Form Requests)
    Route::post('/feed', [FeedController::class, 'store'])->middleware('throttle:feed')->name('feed.store');
    Route::put('/feed/{feed_post}', [FeedController::class, 'update'])->name('feed.update');
    Route::delete('/feed/{feed_post}', [FeedController::class, 'destroy'])->name('feed.destroy');
    Route::post('/feed/{feed_post}/pin', [FeedController::class, 'pin'])->name('feed.pin');
    Route::post('/feed/{feed_post}/like', [LikeController::class, 'toggle'])->name('feed.like');
    Route::post('/feed/{feed_post}/comments', [CommentController::class, 'store'])->middleware('throttle:comment')->name('feed.comments.store');
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy'])->name('comments.destroy');

    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllRead'])->name('notifications.mark-all-read');

    Route::post('/webpush/subscribe', [PushSubscriptionController::class, 'store'])->name('webpush.subscribe');
    Route::post('/webpush/unsubscribe', [PushSubscriptionController::class, 'destroy'])->name('webpush.unsubscribe');

    Route::get('/saved-searches', [SavedSearchController::class, 'index'])->name('saved-searches.index');
    Route::post('/saved-searches', [SavedSearchController::class, 'store'])->name('saved-searches.store');
    Route::delete('/saved-searches/{saved_search}', [SavedSearchController::class, 'destroy'])->name('saved-searches.destroy');

    Route::get('/trials', [TrialController::class, 'index'])->name('trials.index');
    Route::post('/players/{player}/trials', [TrialController::class, 'store'])->name('trials.store');
    Route::post('/trials/{trial}/respond', [TrialController::class, 'respond'])->name('trials.respond');
    Route::post('/trials/{trial}/cancel', [TrialController::class, 'cancel'])->name('trials.cancel');

    // Job posts for agents/coaches who don't have an academy profile (mirrors academy.jobs.*)
    Route::get('/my-jobs', [JobController::class, 'mineIndex'])->name('jobs.mine.index');
    Route::get('/my-jobs/create', [JobController::class, 'mineCreate'])->name('jobs.mine.create');
    Route::post('/my-jobs', [JobController::class, 'store'])->name('jobs.mine.store');
    Route::get('/my-jobs/{job_post}/edit', [JobController::class, 'mineEdit'])->name('jobs.mine.edit');
    Route::put('/my-jobs/{job_post}', [JobController::class, 'update'])->name('jobs.mine.update');
    Route::post('/my-jobs/{job_post}/close', [JobController::class, 'close'])->name('jobs.mine.close');
    Route::get('/my-jobs/{job_post}/applicants', [JobController::class, 'mineApplicants'])->name('jobs.mine.applicants');
    Route::put('/my-jobs/applications/{job_application}/status', [JobApplicationController::class, 'updateStatus'])->name('jobs.mine.applications.status');

    // Inbox / messaging - any active user can message any other active user.
    Route::get('/inbox', [ConversationController::class, 'index'])->name('inbox.index');
    Route::post('/inbox/start/{user}', [ConversationController::class, 'start'])->name('inbox.start');
    Route::get('/inbox/{conversation}', [ConversationController::class, 'show'])->name('inbox.show');
    Route::post('/inbox/{conversation}/messages', [MessageController::class, 'store'])
        ->middleware('throttle:messaging')
        ->name('messages.store');
    Route::post('/inbox/{conversation}/read', [MessageController::class, 'markAsRead'])->name('messages.read');
    Route::get('/api/conversations/{conversation}/poll', [MessageController::class, 'poll'])
        ->middleware('throttle:api')
        ->name('api.conversations.poll');

    // Agent ratings/recommendations - any active user (not just the "agent" role
    // group) can rate or recommend an agent, so these live in the shared group.
    Route::post('/agents/{agent}/ratings', [AgentRatingController::class, 'store'])
        ->middleware('throttle:agent-rating')
        ->name('agents.ratings.store');
    Route::post('/agents/{agent}/recommendations', [AgentRecommendationController::class, 'store'])
        ->middleware('throttle:agent-rating')
        ->name('agents.recommendations.store');
    Route::get('/my-recommendations', [AgentRecommendationController::class, 'index'])->name('recommendations.index');
    Route::put('/recommendations/{agent_recommendation}/status', [AgentRecommendationController::class, 'updateStatus'])
        ->middleware('throttle:agent-rating')
        ->name('recommendations.status');

    // Agent supporting documents - an agent manages their own; only the
    // agent themselves or a Super Admin can ever download one (see
    // DocumentController::agentDocument and StoreAgentDocumentRequest).
    Route::post('/agents/{agent}/documents', [AgentDocumentController::class, 'store'])->name('agents.documents.store');
    Route::delete('/agents/{agent}/documents/{document}', [AgentDocumentController::class, 'destroy'])->name('agents.documents.destroy');

    // Reports/complaints - any active user can report any other non-admin
    // account; accumulating enough distinct reporters auto-pends the target
    // (see ReportService and config/moderation.php).
    Route::get('/users/{user}/report', [ReportController::class, 'create'])->name('reports.create');
    Route::post('/users/{user}/report', [ReportController::class, 'store'])
        ->middleware('throttle:report')
        ->name('reports.store');

    // Signed document downloads - "signed" verifies the link hasn't been tampered
    // with; DocumentController still re-checks ownership independently.
    Route::middleware('signed')->group(function () {
        Route::get('/documents/academy-license/{academy}', [DocumentController::class, 'academyLicense'])->name('documents.academy-license');
        Route::get('/documents/agent-id/{agent}', [DocumentController::class, 'agentId'])->name('documents.agent-id');
        Route::get('/documents/agent-document/{agent}/{document}', [DocumentController::class, 'agentDocument'])->name('documents.agent-document');
        Route::get('/documents/coach-cv/{coach}', [DocumentController::class, 'coachCv'])->name('documents.coach-cv');
        Route::get('/documents/player-cv/{player}', [DocumentController::class, 'playerCv'])->name('documents.player-cv');
        Route::get('/documents/application-cv/{jobApplication}', [DocumentController::class, 'jobApplicationCv'])->name('documents.application-cv');
    });

    /*
    |----------------------------------------------------------------------
    | Academy
    |----------------------------------------------------------------------
    */
    Route::prefix('academy')->middleware(['role:academy', 'active'])->name('academy.')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        Route::get('/profile/edit', [AcademyProfileController::class, 'edit'])->name('profile.edit');
        Route::put('/profile', [AcademyProfileController::class, 'update'])->name('profile.update');

        Route::get('/teams', [TeamController::class, 'index'])->name('teams.index');
        Route::get('/teams/create', [TeamController::class, 'create'])->name('teams.create');
        Route::post('/teams', [TeamController::class, 'store'])->name('teams.store');
        Route::get('/teams/{team}', [TeamController::class, 'show'])->name('teams.show');
        Route::get('/teams/{team}/edit', [TeamController::class, 'edit'])->name('teams.edit');
        Route::put('/teams/{team}', [TeamController::class, 'update'])->name('teams.update');
        Route::delete('/teams/{team}', [TeamController::class, 'destroy'])->name('teams.destroy');

        Route::get('/players', [PlayerController::class, 'index'])->name('players.index');
        Route::get('/teams/{team}/players/create', [PlayerController::class, 'create'])->name('players.create');
        Route::post('/teams/{team}/players', [PlayerController::class, 'store'])->name('players.store');
        Route::post('/teams/{team}/players/import', [PlayerImportController::class, 'store'])->name('players.import');
        Route::get('/players/{player}', [PlayerController::class, 'show'])->name('players.show');
        Route::get('/players/{player}/edit', [PlayerController::class, 'edit'])->name('players.edit');
        Route::put('/players/{player}', [PlayerController::class, 'update'])->name('players.update');
        Route::delete('/players/{player}', [PlayerController::class, 'destroy'])->name('players.destroy');

        Route::post('/players/{player}/media', [MediaController::class, 'upload'])->name('players.media.upload');
        Route::post('/players/{player}/media/youtube', [MediaController::class, 'storeYoutube'])->name('players.media.youtube');
        Route::post('/players/{player}/media/reorder', [MediaController::class, 'reorder'])->name('players.media.reorder');
        Route::post('/media/{mediaAsset}/feature', [MediaController::class, 'setFeatured'])->name('media.feature');
        Route::delete('/media/{mediaAsset}', [MediaController::class, 'destroy'])->name('media.destroy');

        Route::get('/jobs', [JobController::class, 'academyIndex'])->name('jobs.index');
        Route::get('/jobs/create', [JobController::class, 'create'])->name('jobs.create');
        Route::post('/jobs', [JobController::class, 'store'])->name('jobs.store');
        Route::get('/jobs/{job_post}/edit', [JobController::class, 'edit'])->name('jobs.edit');
        Route::put('/jobs/{job_post}', [JobController::class, 'update'])->name('jobs.update');
        Route::post('/jobs/{job_post}/close', [JobController::class, 'close'])->name('jobs.close');
        Route::get('/jobs/{job_post}/applicants', [JobController::class, 'applicants'])->name('jobs.applicants');
        Route::put('/applications/{job_application}/status', [JobApplicationController::class, 'updateStatus'])->name('applications.status');

        Route::get('/access-requests', [AccessRequestController::class, 'index'])->name('access-requests.index');
        Route::post('/access-requests/{access_request}/respond', [AccessRequestController::class, 'respond'])->name('access-requests.respond');
    });

    /*
    |----------------------------------------------------------------------
    | Agent
    |----------------------------------------------------------------------
    */
    Route::prefix('agent')->middleware(['role:agent', 'active'])->name('agent.')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        Route::get('/profile/edit', [AgentProfileController::class, 'edit'])->name('profile.edit');
        Route::put('/profile', [AgentProfileController::class, 'update'])->name('profile.update');

        Route::get('/watchlist', [WatchlistController::class, 'index'])->name('watchlist.index');
        Route::post('/watchlist/{player}/toggle', [WatchlistController::class, 'toggle'])->name('watchlist.toggle');

        Route::post('/players/{player}/access-request', [AccessRequestController::class, 'store'])->name('access-requests.store');
    });

    /*
    |----------------------------------------------------------------------
    | Coach
    |----------------------------------------------------------------------
    */
    Route::prefix('coach')->middleware(['role:coach', 'active'])->name('coach.')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        Route::get('/profile/edit', [CoachProfileController::class, 'edit'])->name('profile.edit');
        Route::put('/profile', [CoachProfileController::class, 'update'])->name('profile.update');

        Route::post('/jobs/{job_post}/apply', [JobApplicationController::class, 'store'])->name('jobs.apply');
    });

    /*
    |----------------------------------------------------------------------
    | Player (free agent)
    |----------------------------------------------------------------------
    */
    Route::prefix('player')->middleware(['role:player', 'active'])->name('player.')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        Route::get('/profile/edit', [PlayerProfileController::class, 'edit'])->name('profile.edit');
        Route::put('/profile', [PlayerProfileController::class, 'update'])->name('profile.update');

        Route::post('/players/{player}/media', [MediaController::class, 'upload'])->name('media.upload');
        Route::post('/players/{player}/media/youtube', [MediaController::class, 'storeYoutube'])->name('media.youtube');
        Route::post('/players/{player}/media/reorder', [MediaController::class, 'reorder'])->name('media.reorder');
        Route::post('/media/{mediaAsset}/feature', [MediaController::class, 'setFeatured'])->name('media.feature');
        Route::delete('/media/{mediaAsset}', [MediaController::class, 'destroy'])->name('media.destroy');
    });

    /*
    |----------------------------------------------------------------------
    | Super Admin
    |----------------------------------------------------------------------
    */
    Route::prefix('admin')->middleware('role:super_admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [ModerationController::class, 'pending'])->name('dashboard');

        Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics.index');

        Route::get('/moderation/pending', [ModerationController::class, 'pending'])->name('moderation.pending');
        Route::post('/moderation/{user}/approve', [ModerationController::class, 'approve'])->name('moderation.approve');
        Route::post('/moderation/{user}/deny', [ModerationController::class, 'deny'])->name('moderation.deny');
        Route::post('/moderation/{user}/suspend', [ModerationController::class, 'suspend'])->name('moderation.suspend');
        Route::post('/moderation/{user}/reinstate', [ModerationController::class, 'reinstate'])->name('moderation.reinstate');
        Route::delete('/moderation/{user}', [ModerationController::class, 'destroy'])->name('moderation.destroy');
        Route::post('/moderation/academies/{academy}/verify', [ModerationController::class, 'verify'])->name('moderation.verify');
        Route::post('/moderation/agents/{agent}/verify', [ModerationController::class, 'verifyAgent'])->name('moderation.verify-agent');

        Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
        Route::post('/users/{user}/restore', [AdminUserController::class, 'restore'])->name('users.restore');

        Route::get('/logs', [LogController::class, 'index'])->name('logs.index');
        Route::get('/logs/export', [LogController::class, 'export'])->name('logs.export');

        Route::get('/reports', [AdminReportController::class, 'index'])->name('reports.index');
        Route::post('/reports/{report}/dismiss', [AdminReportController::class, 'dismiss'])->name('reports.dismiss');
        Route::post('/reports/{report}/actioned', [AdminReportController::class, 'actioned'])->name('reports.actioned');

        Route::get('/data-records', [DataRecordsController::class, 'index'])->name('data-records.index');
        Route::post('/data-records/sync', [DataRecordsController::class, 'sync'])->name('data-records.sync');
        Route::get('/data-records/export/{sport}', [DataRecordsController::class, 'export'])->name('data-records.export');
    });
});

/*
|--------------------------------------------------------------------------
| Public wildcard profile routes
|--------------------------------------------------------------------------
| These use a single-segment slug/username wildcard, so they MUST be
| registered last - otherwise they would greedily match more specific
| paths under the same prefix (e.g. /academy/teams being read as
| /academy/{academy:slug} with slug "teams").
*/

Route::get('/academy/{academy:slug}', [PublicProfileController::class, 'academy'])->name('academy.show');
Route::get('/agent/{username}', [PublicProfileController::class, 'agent'])->name('agent.show');
Route::get('/coach/{username}', [PublicProfileController::class, 'coach'])->name('coach.show');
Route::get('/player/{player:slug}', [PublicProfileController::class, 'player'])->name('player.show');

require __DIR__.'/auth.php';
