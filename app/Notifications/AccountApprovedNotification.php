<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountApprovedNotification extends Notification
{
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $appName = config('app.name');

        return (new MailMessage)
            ->subject("Your {$appName} account has been approved")
            ->greeting("Welcome, {$notifiable->name}!")
            ->line('Your account has been reviewed and approved by our team.')
            ->action('Go to your dashboard', url('/dashboard'))
            ->line("Thanks for joining {$appName}.");
    }

    public function toArray(object $notifiable): array
    {
        return ['type' => 'account_approved'];
    }
}
