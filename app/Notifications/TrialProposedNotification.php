<?php

namespace App\Notifications;

use App\Models\Trial;
use App\Notifications\Channels\WebPushChannel;
use App\Support\NotificationPresenter;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TrialProposedNotification extends Notification
{
    public function __construct(public Trial $trial) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database', WebPushChannel::class];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New trial proposal')
            ->line("{$this->trial->organizer->name} proposed a trial on {$this->trial->scheduled_at->format('D, M j Y \a\t g:ia')}.")
            ->when($this->trial->location, fn ($m) => $m->line("Location: {$this->trial->location}"))
            ->action('Respond to trial', route('trials.index'));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'trial_proposed',
            'trial_id' => $this->trial->id,
            'organizer_name' => $this->trial->organizer->name,
            'player_name' => $this->trial->player?->full_name,
        ];
    }

    public function toWebPush(object $notifiable): array
    {
        $presented = NotificationPresenter::presentData($this->toArray($notifiable));

        return [
            'title' => config('app.name'),
            'body' => $presented['message'],
            'url' => $presented['url'],
        ];
    }
}
