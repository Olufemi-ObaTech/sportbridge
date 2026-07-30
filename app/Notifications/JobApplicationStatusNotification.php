<?php

namespace App\Notifications;

use App\Models\JobApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class JobApplicationStatusNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public JobApplication $application) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $jobTitle = $this->application->jobPost->title;
        $status = $this->application->status;

        $line = match ($status) {
            'shortlisted' => "You've been shortlisted for \"{$jobTitle}\". The club may reach out soon.",
            'hired' => "Congratulations! You've been hired for \"{$jobTitle}\".",
            'rejected' => "Your application for \"{$jobTitle}\" was not successful this time.",
            default => "Your application status for \"{$jobTitle}\" has changed to {$status}.",
        };

        return (new MailMessage)
            ->subject('Update on your job application')
            ->line($line)
            ->action('View job board', route('jobs.index'));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'job_application_status',
            'job_application_id' => $this->application->id,
            'job_post_id' => $this->application->job_post_id,
            'status' => $this->application->status,
        ];
    }
}
