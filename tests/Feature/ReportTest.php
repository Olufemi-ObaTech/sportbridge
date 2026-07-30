<?php

namespace Tests\Feature;

use App\Models\Report;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_active_user_can_report_another_user(): void
    {
        $reporter = User::factory()->coach()->create(['status' => User::STATUS_ACTIVE]);
        $reported = User::factory()->academy()->create(['status' => User::STATUS_ACTIVE]);

        $response = $this->actingAs($reporter)->post(route('reports.store', $reported), [
            'reason' => 'fraud_or_payment_request',
            'details' => 'Asked me to pay a trial fee upfront.',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('reports', [
            'reporter_id' => $reporter->id,
            'reported_user_id' => $reported->id,
            'reason' => 'fraud_or_payment_request',
            'status' => Report::STATUS_PENDING,
        ]);
    }

    public function test_user_cannot_file_a_second_open_report_against_the_same_account(): void
    {
        $reporter = User::factory()->coach()->create(['status' => User::STATUS_ACTIVE]);
        $reported = User::factory()->academy()->create(['status' => User::STATUS_ACTIVE]);

        Report::factory()->create([
            'reporter_id' => $reporter->id,
            'reported_user_id' => $reported->id,
            'reason' => 'other',
            'status' => Report::STATUS_PENDING,
        ]);

        $response = $this->actingAs($reporter)->post(route('reports.store', $reported), [
            'reason' => 'harassment',
        ]);

        $response->assertSessionHasErrors('report');
        $this->assertSame(1, Report::where('reported_user_id', $reported->id)->count());
    }

    public function test_user_cannot_report_themselves_or_a_super_admin(): void
    {
        $user = User::factory()->coach()->create(['status' => User::STATUS_ACTIVE]);
        $admin = User::factory()->superAdmin()->create(['status' => User::STATUS_ACTIVE]);

        $this->actingAs($user)->post(route('reports.store', $user))->assertNotFound();
        $this->actingAs($user)->post(route('reports.store', $admin))->assertNotFound();
    }

    public function test_filing_reports_never_changes_the_reported_accounts_status_automatically(): void
    {
        $reported = User::factory()->academy()->create(['status' => User::STATUS_ACTIVE]);
        $reporters = User::factory()->count(5)->coach()->create(['status' => User::STATUS_ACTIVE]);

        foreach ($reporters as $reporter) {
            $this->actingAs($reporter)->post(route('reports.store', $reported), [
                'reason' => 'harassment',
            ]);
        }

        // A Super Admin must investigate and act manually - see ReportService's
        // class docblock. Reports are purely a signal, never an automatic action.
        $this->assertSame(User::STATUS_ACTIVE, $reported->fresh()->status);
        $this->assertSame(5, Report::where('reported_user_id', $reported->id)->count());
    }

    public function test_admin_can_dismiss_a_report(): void
    {
        $admin = User::factory()->superAdmin()->create(['status' => User::STATUS_ACTIVE]);
        $report = Report::factory()->create(['status' => Report::STATUS_PENDING]);

        $this->actingAs($admin)->post(route('admin.reports.dismiss', $report))->assertRedirect();

        $this->assertSame(Report::STATUS_DISMISSED, $report->fresh()->status);
        $this->assertSame($admin->id, $report->fresh()->reviewed_by);
    }

    public function test_admin_investigates_then_manually_suspends_and_marks_the_report_actioned(): void
    {
        $admin = User::factory()->superAdmin()->create(['status' => User::STATUS_ACTIVE]);
        $reported = User::factory()->academy()->create(['status' => User::STATUS_ACTIVE]);
        $report = Report::factory()->create(['reported_user_id' => $reported->id, 'status' => Report::STATUS_PENDING]);

        // The investigation itself is a manual admin decision - suspend uses
        // the normal moderation action, entirely separate from the report.
        $this->actingAs($admin)->post(route('admin.moderation.suspend', $reported), ['reason' => 'Confirmed after investigating the complaint'])
            ->assertRedirect();
        $this->assertSame(User::STATUS_SUSPENDED, $reported->fresh()->status);

        $this->actingAs($admin)->post(route('admin.reports.actioned', $report))->assertRedirect();
        $this->assertSame(Report::STATUS_ACTIONED, $report->fresh()->status);
        $this->assertSame($admin->id, $report->fresh()->reviewed_by);
    }

    public function test_non_admin_cannot_access_the_reports_queue(): void
    {
        $coach = User::factory()->coach()->create(['status' => User::STATUS_ACTIVE]);

        $this->actingAs($coach)->get(route('admin.reports.index'))->assertForbidden();
    }
}
