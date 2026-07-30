<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminLog;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LogController extends Controller
{
    public function index(Request $request): View
    {
        $logs = AdminLog::with(['admin', 'targetUser'])
            ->when($request->filled('action'), fn ($q) => $q->where('action', $request->string('action')))
            ->latest()
            ->paginate(25)
            ->withQueryString();

        return view('admin.logs.index', ['logs' => $logs]);
    }

    public function export(Request $request): StreamedResponse
    {
        $logs = AdminLog::with(['admin', 'targetUser'])
            ->when($request->filled('action'), fn ($q) => $q->where('action', $request->string('action')))
            ->latest()
            ->get();

        return response()->streamDownload(function () use ($logs) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Date', 'Admin', 'Action', 'Target', 'Reason', 'IP Address']);

            foreach ($logs as $log) {
                fputcsv($handle, [
                    $log->created_at->toDateTimeString(),
                    $log->admin?->name,
                    $log->action,
                    $log->targetUser?->name,
                    $log->reason,
                    $log->ip_address,
                ]);
            }

            fclose($handle);
        }, 'admin-activity-log.csv', ['Content-Type' => 'text/csv']);
    }
}
