<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewRegistrationNotification extends Notification
{
    public function __construct(public User $registrant) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New account registered')
            ->line("{$this->registrant->name} ({$this->registrant->role}) has registered and their account is already active.")
            ->action('View users', route('admin.users.index'))
            ->line('You can suspend or remove the account at any time if something looks wrong.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'new_registration',
            'user_id' => $this->registrant->id,
            'name' => $this->registrant->name,
            'role' => $this->registrant->role,
        ];
    }
}
