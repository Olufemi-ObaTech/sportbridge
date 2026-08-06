<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\MergesCrossDatabaseResults;
use App\Http\Controllers\Controller;
use App\Models\Basketball\BasketballJobPost;
use App\Models\JobPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JobController extends Controller
{
    use MergesCrossDatabaseResults;

    public function index(Request $request): JsonResponse
    {
        $sportParam = $request->query('sport');
        $sport = in_array($sportParam, ['football', 'basketball'], true) ? $sportParam : null;

        $filter = fn ($query) => $query->with('academy')
            ->open()
            ->when($request->filled('role_type'), fn ($q) => $q->where('role_type', $request->string('role_type')))
            ->when($request->filled('location'), fn ($q) => $q->where('location', 'like', '%'.$request->string('location').'%'));

        $jobs = match ($sport) {
            'basketball' => $filter(BasketballJobPost::query())->latest()->paginate(15)->withQueryString(),
            'football' => $filter(JobPost::query())->latest()->paginate(15)->withQueryString(),
            default => $this->paginateMerged(
                $filter(JobPost::query())->get()->concat($filter(BasketballJobPost::query())->get()),
                $request,
                15
            ),
        };

        return response()->json([
            'data' => $jobs->map(fn (JobPost $job) => $this->present($job)),
            'current_page' => $jobs->currentPage(),
            'last_page' => $jobs->lastPage(),
            'has_more' => $jobs->hasMorePages(),
        ]);
    }

    public function show(JobPost $job_post): JsonResponse
    {
        return response()->json(['data' => $this->present($job_post)]);
    }

    private function present(JobPost $job): array
    {
        return [
            'id' => $job->id,
            'sport' => $job->sport,
            'title' => $job->title,
            'role_type' => $job->role_type,
            'contract_type' => $job->contract_type,
            'location' => $job->location,
            'description' => $job->description,
            'club_name' => $job->academy?->club_name,
            'posted_at' => $job->created_at->toIso8601String(),
            'url' => route('jobs.show', $job),
        ];
    }
}
