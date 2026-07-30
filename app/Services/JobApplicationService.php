<?php

namespace App\Services;

use App\Models\Basketball\BasketballJobApplication;
use App\Models\CoachProfile;
use App\Models\JobApplication;
use App\Models\JobPost;
use App\Notifications\JobApplicationStatusNotification;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class JobApplicationService
{
    public function __construct(protected ImageService $images) {}

    /**
     * $jobPost is guaranteed the same sport as $coach by the caller (resolved
     * from the coach's own sport before reaching here), so job_post_id/
     * coach_profile_id always point into the matching physical database.
     */
    public function apply(JobPost $jobPost, CoachProfile $coach, string $coverLetter, ?UploadedFile $cv = null): JobApplication
    {
        $applicationModel = $coach->sport === CoachProfile::SPORT_BASKETBALL
            ? BasketballJobApplication::class
            : JobApplication::class;

        return DB::transaction(function () use ($jobPost, $coach, $coverLetter, $cv, $applicationModel) {
            $application = $applicationModel::create([
                'job_post_id' => $jobPost->id,
                'coach_profile_id' => $coach->id,
                'cover_letter' => $coverLetter,
                'cv_url' => $cv ? $this->images->storePrivateDocument($cv, 'job-application-cvs') : null,
                'status' => 'pending',
                'applied_at' => now(),
            ]);

            $jobPost->increment('applications_count');

            return $application;
        });
    }

    public function updateStatus(JobApplication $application, string $status): JobApplication
    {
        $application->update(['status' => $status]);

        if ($status === 'hired') {
            $application->jobPost->update(['status' => 'filled']);
        }

        $application->coachProfile->user->notify(new JobApplicationStatusNotification($application));

        return $application;
    }
}
