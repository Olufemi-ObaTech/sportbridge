<?php

namespace App\Notifications;

use App\Models\Report;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewReportNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Report $report) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New complaint filed')
            ->line("{$this->report->reporter->name} filed a complaint against {$this->report->reportedUser->name}.")
            ->line('Reason: '.Report::REASONS[$this->report->reason])
            ->action('Review reports', route('admin.reports.index'))
            ->line('Please review and investigate before taking any action on the account.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'new_report',
            'report_id' => $this->report->id,
            'reported_user_id' => $this->report->reported_user_id,
            'reason' => $this->report->reason,
        ];
    }
}
