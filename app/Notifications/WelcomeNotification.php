<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WelcomeNotification extends Notification
{
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Welcome to '.config('app.name').'!')
            ->greeting("Welcome, {$notifiable->name}!")
            ->line('Your account is ready to go on '.config('app.name').', the multi-sport talent and recruitment platform.')
            ->action('Go to your dashboard', route('dashboard'))
            ->line("We're glad you're here - if you have any questions, just reply to this email.");
    }
}
