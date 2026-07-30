<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\MergesCrossDatabaseResults;
use App\Http\Requests\StoreJobRequest;
use App\Http\Requests\UpdateJobRequest;
use App\Models\Basketball\BasketballJobPost;
use App\Models\JobPost;
use App\Models\Player;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class JobController extends Controller
{
    use MergesCrossDatabaseResults;

    public function index(Request $request): View
    {
        $sportParam = $request->query('sport');
        $sport = match (true) {
            $sportParam === 'all' => null,
            in_array($sportParam, ['football', 'basketball'], true) => $sportParam,
            default => session('sport', 'football'),
        };

        $filter = fn ($query) => $query->with('academy')
            ->open()
            ->when($request->filled('role_type'), fn ($q) => $q->where('role_type', $request->string('role_type')))
            ->when($request->filled('contract_type'), fn ($q) => $q->where('contract_type', $request->string('contract_type')))
            ->when($request->filled('location'), fn ($q) => $q->where('location', 'like', '%'.$request->string('location').'%'));

        // Football and basketball job posts live in two physically separate
        // databases - a single sport queries its own table directly, but "all"
        // has no single SQL query available, so both are fetched and merged.
        $jobs = match ($sport) {
            'basketball' => $filter(BasketballJobPost::query())->latest()->paginate(12)->withQueryString(),
            'football' => $filter(JobPost::query())->latest()->paginate(12)->withQueryString(),
            default => $this->paginateMerged(
                $filter(JobPost::query())->get()->concat($filter(BasketballJobPost::query())->get()),
                $request
            ),
        };

        return view('jobs.index', ['jobs' => $jobs]);
    }

    public function show(JobPost $jobPost): View
    {
        $jobPost->load('academy');

        return view('jobs.show', ['jobPost' => $jobPost]);
    }

    public function academyIndex(Request $request): View
    {
        $academy = $request->user()->academyProfile;

        $jobs = $academy->jobPosts()->withCount('applications')->get()
            ->concat($academy->basketballJobPosts()->withCount('applications')->get());

        return view('academy.jobs.index', ['jobs' => $this->paginateMerged($jobs, $request, 15)]);
    }

    /**
     * "My job posts" for agents/coaches who post opportunities without an academy profile.
     */
    public function mineIndex(Request $request): View
    {
        $user = $request->user();

        $jobs = JobPost::withCount('applications')->where('posted_by_user_id', $user->id)->get()
            ->concat(BasketballJobPost::withCount('applications')->where('posted_by_user_id', $user->id)->get());

        return view('academy.jobs.index', [
            'jobs' => $this->paginateMerged($jobs, $request, 15),
            'createRoute' => 'jobs.mine.create',
            'editRoute' => 'jobs.mine.edit',
            'closeRoute' => 'jobs.mine.close',
            'applicantsRoute' => 'jobs.mine.applicants',
        ]);
    }

    public function create(): View
    {
        $this->authorize('create', JobPost::class);

        return view('academy.jobs.create');
    }

    public function mineCreate(): View
    {
        $this->authorize('create', JobPost::class);

        return view('academy.jobs.create', ['storeRoute' => 'jobs.mine.store']);
    }

    public function store(StoreJobRequest $request): RedirectResponse
    {
        $user = $request->user();

        $data = array_merge($request->validated(), [
            'academy_id' => $user->academyProfile?->id,
            'posted_by_user_id' => $user->id,
        ]);

        $jobPostModel = $data['sport'] === Player::SPORT_BASKETBALL ? BasketballJobPost::class : JobPost::class;
        $jobPost = $jobPostModel::create($data);

        return redirect()->route('jobs.show', $jobPost)->with('status', __('Job posted successfully.'));
    }

    public function edit(JobPost $jobPost): View
    {
        $this->authorize('update', $jobPost);

        return view('academy.jobs.edit', ['jobPost' => $jobPost]);
    }

    public function mineEdit(JobPost $jobPost): View
    {
        $this->authorize('update', $jobPost);

        return view('academy.jobs.edit', ['jobPost' => $jobPost, 'updateRoute' => 'jobs.mine.update']);
    }

    public function update(UpdateJobRequest $request, JobPost $jobPost): RedirectResponse
    {
        $jobPost->update($request->validated());

        return redirect()->route('jobs.show', $jobPost)->with('status', __('Job updated successfully.'));
    }

    public function close(JobPost $jobPost): RedirectResponse
    {
        $this->authorize('update', $jobPost);

        $jobPost->update(['status' => 'closed']);

        return back()->with('status', __('Job closed.'));
    }

    public function applicants(JobPost $jobPost): View
    {
        $this->authorize('manageApplications', $jobPost);

        $applications = $jobPost->applications()->with('coachProfile')->latest()->paginate(20);

        return view('academy.jobs.applicants', ['jobPost' => $jobPost, 'applications' => $applications]);
    }

    public function mineApplicants(JobPost $jobPost): View
    {
        $this->authorize('manageApplications', $jobPost);

        $applications = $jobPost->applications()->with('coachProfile')->latest()->paginate(20);

        return view('academy.jobs.applicants', [
            'jobPost' => $jobPost,
            'applications' => $applications,
            'statusRoute' => 'jobs.mine.applications.status',
        ]);
    }
}
