<?php

namespace App\Http\Controllers;

use App\Http\Requests\ApplyJobRequest;
use App\Http\Requests\UpdateJobApplicationStatusRequest;
use App\Models\JobApplication;
use App\Models\JobPost;
use App\Services\JobApplicationService;
use Illuminate\Http\RedirectResponse;

class JobApplicationController extends Controller
{
    public function __construct(protected JobApplicationService $applications) {}

    public function store(ApplyJobRequest $request, JobPost $jobPost): RedirectResponse
    {
        $existing = $jobPost->applications()->where('coach_profile_id', $request->user()->coachProfile->id)->exists();

        if ($existing) {
            return back()->withErrors(['cover_letter' => __('You have already applied to this job.')]);
        }

        $this->applications->apply(
            $jobPost,
            $request->user()->coachProfile,
            $request->string('cover_letter'),
            $request->file('cv')
        );

        return back()->with('status', __('Application submitted successfully.'));
    }

    public function updateStatus(UpdateJobApplicationStatusRequest $request, JobApplication $jobApplication): RedirectResponse
    {
        $this->applications->updateStatus($jobApplication, $request->string('status'));

        return back()->with('status', __('Application status updated.'));
    }
}
