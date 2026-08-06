<?php

namespace App\Support;

use Illuminate\Notifications\DatabaseNotification;

/**
 * Every existing Notification class already writes to the `notifications`
 * table (via => ['mail', 'database']) and has for a while - they were just
 * never surfaced anywhere in the UI, so users only ever saw them via email
 * (which never actually sends, MAIL_MAILER=log). This turns each type's raw
 * `data` payload into a human-readable message + a link, for the bell
 * dropdown and the full notifications page.
 */
class NotificationPresenter
{
    public static function present(DatabaseNotification $notification): array
    {
        return self::presentData($notification->data);
    }

    /**
     * Shared by present() (reads a saved DatabaseNotification's ->data) and
     * each Notification class's toWebPush() (which has the same shape from
     * its own toArray(), before it's ever saved) - keeps the bell dropdown
     * and the push notification payload worded identically.
     */
    public static function presentData(array $data): array
    {
        return match ($data['type'] ?? null) {
            'account_approved' => [
                'message' => __('Your account has been approved.'),
                'url' => route('dashboard'),
                'icon' => 'bi-check-circle-fill text-success',
            ],
            'account_denied' => [
                'message' => __('Your account registration was denied.').(isset($data['reason']) ? ' '.$data['reason'] : ''),
                'url' => route('dashboard'),
                'icon' => 'bi-x-circle-fill text-danger',
            ],
            'new_registration' => [
                'message' => __(':name (:role) just registered and needs review.', [
                    'name' => $data['name'] ?? __('Someone'),
                    'role' => __(ucfirst(str_replace('_', ' ', $data['role'] ?? ''))),
                ]),
                'url' => route('admin.moderation.pending'),
                'icon' => 'bi-person-plus-fill text-primary',
            ],
            'access_request_received' => [
                'message' => __('An agent requested access to one of your players.'),
                'url' => route('academy.access-requests.index'),
                'icon' => 'bi-shield-lock-fill text-primary',
            ],
            'access_request_responded' => [
                'message' => __('Your access request was :status.', ['status' => __($data['status'] ?? 'updated')]),
                'url' => route('agent.dashboard'),
                'icon' => 'bi-shield-check text-primary',
            ],
            'job_application_status' => [
                'message' => __('Your job application status changed to :status.', ['status' => __(ucfirst($data['status'] ?? 'updated'))]),
                'url' => route('coach.dashboard'),
                'icon' => 'bi-briefcase-fill text-primary',
            ],
            'new_report' => [
                'message' => __('A new complaint was filed and needs review.'),
                'url' => route('admin.reports.index'),
                'icon' => 'bi-flag-fill text-warning',
            ],
            'saved_search_match' => [
                'message' => __(':name matches your saved search ":label".', [
                    'name' => $data['player_name'] ?? __('A new player'),
                    'label' => $data['saved_search_label'] ?? '',
                ]),
                'url' => isset($data['player_slug']) ? route('player.show', $data['player_slug']) : route('saved-searches.index'),
                'icon' => 'bi-bookmark-star-fill text-primary',
            ],
            'trial_proposed' => [
                'message' => __(':name proposed a trial with :player.', [
                    'name' => $data['organizer_name'] ?? __('Someone'),
                    'player' => $data['player_name'] ?? __('a player'),
                ]),
                'url' => route('trials.index'),
                'icon' => 'bi-calendar-event-fill text-primary',
            ],
            'trial_responded' => [
                'message' => __('Your trial proposal for :player was :status.', [
                    'player' => $data['player_name'] ?? __('a player'),
                    'status' => __($data['status'] ?? 'updated'),
                ]),
                'url' => route('trials.index'),
                'icon' => 'bi-calendar-check-fill text-primary',
            ],
            default => [
                'message' => __('You have a new notification.'),
                'url' => route('dashboard'),
                'icon' => 'bi-bell-fill text-secondary',
            ],
        };
    }
}
