<?php

namespace App\Http\Controllers;

use App\Support\NotificationPresenter;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): View
    {
        $notifications = $request->user()->notifications()->paginate(20);

        return view('notifications.index', [
            'notifications' => $notifications,
            'presented' => $notifications->getCollection()->mapWithKeys(
                fn ($n) => [$n->id => NotificationPresenter::present($n)]
            ),
        ]);
    }

    public function markRead(Request $request, string $notification): RedirectResponse
    {
        $record = $request->user()->notifications()->findOrFail($notification);
        $record->markAsRead();

        return redirect(NotificationPresenter::present($record)['url']);
    }

    public function markAllRead(Request $request): RedirectResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return back();
    }
}
