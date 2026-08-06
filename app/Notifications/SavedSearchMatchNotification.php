<?php

namespace App\Notifications;

use App\Models\Player;
use App\Models\SavedSearch;
use App\Notifications\Channels\WebPushChannel;
use App\Support\NotificationPresenter;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SavedSearchMatchNotification extends Notification
{
    public function __construct(public Player $player, public SavedSearch $savedSearch) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database', WebPushChannel::class];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New player matches your saved search')
            ->line("{$this->player->full_name} just joined and matches your saved search \"{$this->savedSearch->label}\".")
            ->action('View player', route('player.show', $this->player));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'saved_search_match',
            'player_id' => $this->player->id,
            'player_slug' => $this->player->slug,
            'player_name' => $this->player->full_name,
            'saved_search_id' => $this->savedSearch->id,
            'saved_search_label' => $this->savedSearch->label,
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
