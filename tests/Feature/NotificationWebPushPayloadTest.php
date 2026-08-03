<?php

namespace Tests\Feature;

use App\Models\AccessRequest;
use App\Models\JobApplication;
use App\Models\Report;
use App\Models\User;
use App\Notifications\AccessRequestReceivedNotification;
use App\Notifications\AccessRequestRespondedNotification;
use App\Notifications\AccountApprovedNotification;
use App\Notifications\AccountDeniedNotification;
use App\Notifications\JobApplicationStatusNotification;
use App\Notifications\NewRegistrationNotification;
use App\Notifications\NewReportNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Every notification class's toWebPush() runs its own toArray() back through
 * NotificationPresenter::presentData() to build the push payload - this
 * pins that each of the 7 classes actually produces a well-formed
 * {title, body, url} array rather than throwing (e.g. a route() call that
 * needed a param the type didn't provide).
 */
class NotificationWebPushPayloadTest extends TestCase
{
    use RefreshDatabase;

    private function assertValidPayload(array $payload): void
    {
        $this->assertArrayHasKey('title', $payload);
        $this->assertArrayHasKey('body', $payload);
        $this->assertArrayHasKey('url', $payload);
        $this->assertNotEmpty($payload['title']);
        $this->assertNotEmpty($payload['body']);
        $this->assertNotEmpty($payload['url']);
    }

    public function test_account_approved_payload(): void
    {
        $user = User::factory()->create();
        $this->assertValidPayload((new AccountApprovedNotification)->toWebPush($user));
    }

    public function test_account_denied_payload(): void
    {
        $user = User::factory()->create();
        $this->assertValidPayload((new AccountDeniedNotification('Documents unclear'))->toWebPush($user));
    }

    public function test_new_registration_payload(): void
    {
        $admin = User::factory()->superAdmin()->create();
        $registrant = User::factory()->create();
        $this->assertValidPayload((new NewRegistrationNotification($registrant))->toWebPush($admin));
    }

    public function test_access_request_received_payload(): void
    {
        $accessRequest = AccessRequest::factory()->create();
        $academyUser = $accessRequest->academy->user;
        $this->assertValidPayload((new AccessRequestReceivedNotification($accessRequest))->toWebPush($academyUser));
    }

    public function test_access_request_responded_payload(): void
    {
        $accessRequest = AccessRequest::factory()->create(['status' => 'granted']);
        $agentUser = $accessRequest->agent->user;
        $this->assertValidPayload((new AccessRequestRespondedNotification($accessRequest))->toWebPush($agentUser));
    }

    public function test_job_application_status_payload(): void
    {
        $application = JobApplication::factory()->create(['status' => 'shortlisted']);
        $coachUser = $application->coachProfile->user;
        $this->assertValidPayload((new JobApplicationStatusNotification($application))->toWebPush($coachUser));
    }

    public function test_new_report_payload(): void
    {
        $report = Report::factory()->create();
        $admin = User::factory()->superAdmin()->create();
        $this->assertValidPayload((new NewReportNotification($report))->toWebPush($admin));
    }
}
