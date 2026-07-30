<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountDeniedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public string $reason) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your '.config('app.name').' registration was not approved')
            ->greeting("Hello {$notifiable->name},")
            ->line('Unfortunately your registration could not be approved at this time.')
            ->line("Reason: {$this->reason}")
            ->line('You are welcome to contact support if you believe this was a mistake.');
    }

    public function toArray(object $notifiable): array
    {
        return ['type' => 'account_denied', 'reason' => $this->reason];
    }
}
