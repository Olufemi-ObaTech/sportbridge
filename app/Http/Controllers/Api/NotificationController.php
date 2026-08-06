<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\NotificationPresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()->notifications()->paginate(20);

        return response()->json([
            'data' => $notifications->map(function ($notification) {
                $presented = NotificationPresenter::present($notification);

                return [
                    'id' => $notification->id,
                    'message' => $presented['message'],
                    'url' => $presented['url'],
                    'read' => $notification->read_at !== null,
                    'created_at' => $notification->created_at->toIso8601String(),
                ];
            }),
            'unread_count' => $request->user()->unreadNotifications()->count(),
            'current_page' => $notifications->currentPage(),
            'last_page' => $notifications->lastPage(),
        ]);
    }
}
