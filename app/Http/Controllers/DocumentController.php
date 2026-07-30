<?php

namespace App\Http\Controllers;

use App\Models\AcademyProfile;
use App\Models\AgentDocument;
use App\Models\AgentProfile;
use App\Models\CoachProfile;
use App\Models\JobApplication;
use App\Models\Player;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Serves sensitive documents (license certificates, ID documents, CVs) that are
 * stored on the private "local" disk. Every route here requires a valid signed
 * URL AND an explicit authorization check below - the signature alone is not
 * trusted as the sole gate, since a forged or reused signed URL should still
 * fail the ownership check.
 */
class DocumentController extends Controller
{
    public function academyLicense(Request $request, AcademyProfile $academy): StreamedResponse
    {
        $user = $request->user();
        abort_unless($user && ($user->isSuperAdmin() || $user->id === $academy->user_id), 403);

        return $this->stream($academy->license_doc_url);
    }

    public function agentId(Request $request, AgentProfile $agent): StreamedResponse
    {
        $user = $request->user();
        abort_unless($user && ($user->isSuperAdmin() || $user->id === $agent->user_id), 403);

        return $this->stream($agent->id_doc_url);
    }

    public function coachCv(Request $request, CoachProfile $coach): StreamedResponse
    {
        $user = $request->user();
        abort_unless($user && ($user->isSuperAdmin() || $user->id === $coach->user_id), 403);

        return $this->stream($coach->cv_url);
    }

    public function playerCv(Request $request, Player $player): StreamedResponse
    {
        $user = $request->user();
        abort_unless($user && ($user->isSuperAdmin() || $user->id === $player->user_id), 403);

        return $this->stream($player->cv_url);
    }

    public function agentDocument(Request $request, AgentProfile $agent, AgentDocument $document): StreamedResponse
    {
        abort_unless($document->agent_profile_id === $agent->id && $document->sport === $agent->sport, 404);

        $user = $request->user();
        abort_unless($user && ($user->isSuperAdmin() || $user->id === $agent->user_id), 403);

        return $this->stream($document->file_url);
    }

    public function jobApplicationCv(Request $request, JobApplication $jobApplication): StreamedResponse
    {
        $user = $request->user();
        $jobApplication->loadMissing(['coachProfile', 'jobPost']);

        $isApplicant = $user && $user->id === $jobApplication->coachProfile->user_id;
        $isHiringAcademy = $user && $user->role === 'academy'
            && $user->academyProfile?->id === $jobApplication->jobPost->academy_id;

        abort_unless($user && ($user->isSuperAdmin() || $isApplicant || $isHiringAcademy), 403);

        return $this->stream($jobApplication->cv_url ?: $jobApplication->coachProfile->cv_url);
    }

    protected function stream(?string $path): StreamedResponse
    {
        abort_if(! $path || ! Storage::disk('local')->exists($path), 404);

        return Storage::disk('local')->response($path);
    }
}
