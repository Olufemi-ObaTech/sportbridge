<?php

namespace App\Services;

use App\Models\AdminLog;
use App\Models\Report;
use App\Models\User;
use App\Notifications\NewReportNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Request;

/**
 * Complaints never change an account's status on their own - a report is
 * purely a signal that lands in the Super Admin's queue (see
 * NewReportNotification/admin.reports.index). A human admin investigates and
 * decides whether to suspend/deny/dismiss via the normal moderation actions
 * (ModerationController), then marks the report(s) actioned once they have.
 */
class ReportService
{
    public function fileReport(User $reporter, User $reported, string $reason, ?string $details): Report
    {
        $report = Report::create([
            'reporter_id' => $reporter->id,
            'reported_user_id' => $reported->id,
            'reason' => $reason,
            'details' => $details,
        ]);

        $admins = User::role(User::ROLE_SUPER_ADMIN)->get();
        if ($admins->isNotEmpty()) {
            Notification::send($admins, new NewReportNotification($report));
        }

        return $report;
    }

    public function dismiss(User $admin, Report $report): void
    {
        DB::transaction(function () use ($admin, $report) {
            $report->update([
                'status' => Report::STATUS_DISMISSED,
                'reviewed_by' => $admin->id,
                'reviewed_at' => now(),
            ]);

            AdminLog::create([
                'admin_id' => $admin->id,
                'target_user_id' => $report->reported_user_id,
                'target_type' => User::class,
                'target_id' => $report->reported_user_id,
                'action' => 'dismiss_report',
                'reason' => "Report #{$report->id} dismissed.",
                'ip_address' => Request::ip(),
            ]);
        });
    }

    /**
     * Mark this report (and every other still-open report against the same
     * user) as actioned - used once an admin has actually suspended/denied
     * the account off the back of these complaints, so the queue doesn't
     * keep nagging about reports that already led to action.
     */
    public function markActioned(User $admin, Report $report): void
    {
        DB::transaction(function () use ($admin, $report) {
            Report::pending()
                ->where('reported_user_id', $report->reported_user_id)
                ->update([
                    'status' => Report::STATUS_ACTIONED,
                    'reviewed_by' => $admin->id,
                    'reviewed_at' => now(),
                ]);

            AdminLog::create([
                'admin_id' => $admin->id,
                'target_user_id' => $report->reported_user_id,
                'target_type' => User::class,
                'target_id' => $report->reported_user_id,
                'action' => 'report_actioned',
                'reason' => "Reports against user #{$report->reported_user_id} marked actioned.",
                'ip_address' => Request::ip(),
            ]);
        });
    }
}
