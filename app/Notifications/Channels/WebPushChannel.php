<?php

namespace App\Notifications\Channels;

use App\Models\User;
use GuzzleHttp\Client;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;

/**
 * Sends synchronously in the same request (see the ShouldQueue removal on
 * every Notification class - Railway runs no queue worker, so anything
 * queued here would just never send). Guzzle has no default timeout, so a
 * slow/dead push endpoint could otherwise hang an unrelated request (e.g. an
 * admin approving a user) for as long as the push service takes to respond -
 * a short explicit timeout bounds that, and the whole send is best-effort:
 * a failure here must never break the action that triggered the
 * notification. A subscription that comes back expired/gone is deleted
 * immediately so it's never retried.
 */
class WebPushChannel
{
    public function send(User $notifiable, Notification $notification): void
    {
        if (! method_exists($notification, 'toWebPush')) {
            return;
        }

        $subscriptions = $notifiable->pushSubscriptions;

        if ($subscriptions->isEmpty()) {
            return;
        }

        $publicKey = config('services.webpush.public_key');
        $privateKey = config('services.webpush.private_key');

        if (! $publicKey || ! $privateKey) {
            return;
        }

        try {
            $payload = $notification->toWebPush($notifiable);

            $webPush = new WebPush(
                auth: [
                    'VAPID' => [
                        'subject' => config('services.webpush.subject'),
                        'publicKey' => $publicKey,
                        'privateKey' => $privateKey,
                    ],
                ],
                client: new Client(['timeout' => 5, 'connect_timeout' => 3]),
            );

            foreach ($subscriptions as $subscription) {
                $webPush->queueNotification(
                    Subscription::create([
                        'endpoint' => $subscription->endpoint,
                        'publicKey' => $subscription->public_key,
                        'authToken' => $subscription->auth_token,
                        'contentEncoding' => $subscription->content_encoding ?? 'aesgcm',
                    ]),
                    json_encode($payload)
                );
            }

            foreach ($webPush->flush() as $report) {
                if (! $report->isSuccess() && $report->isSubscriptionExpired()) {
                    $notifiable->pushSubscriptions()
                        ->where('endpoint', $report->getEndpoint())
                        ->delete();
                } elseif (! $report->isSuccess()) {
                    Log::warning('Web push delivery failed', [
                        'endpoint' => $report->getEndpoint(),
                        'reason' => $report->getReason(),
                    ]);
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Web push send threw', ['message' => $e->getMessage()]);
        }
    }
}
