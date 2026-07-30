<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin\BasketballUserRecord;
use App\Models\Admin\FootballUserRecord;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Artisan;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DataRecordsController extends Controller
{
    public function index(): View
    {
        return view('admin.data-records.index', [
            'footballCount' => FootballUserRecord::count(),
            'basketballCount' => BasketballUserRecord::count(),
            'lastSyncedAt' => FootballUserRecord::max('synced_at') ?? BasketballUserRecord::max('synced_at'),
        ]);
    }

    public function sync(): RedirectResponse
    {
        Artisan::call('admin:sync-user-records');

        return back()->with('status', __('Records synced: ').Artisan::output());
    }

    public function export(string $sport): StreamedResponse
    {
        abort_unless(in_array($sport, ['football', 'basketball'], true), 404);

        $model = $sport === 'basketball' ? BasketballUserRecord::class : FootballUserRecord::class;
        $records = $model::orderBy('name')->get();

        return response()->streamDownload(function () use ($records) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['User ID', 'Name', 'Email', 'Role', 'Status', 'Club/Agency', 'Registered', 'Synced At']);

            foreach ($records as $record) {
                fputcsv($handle, [
                    $record->source_user_id,
                    $record->name,
                    $record->email,
                    $record->role,
                    $record->status,
                    $record->club_or_agency_name,
                    $record->source_created_at?->toDateTimeString(),
                    $record->synced_at->toDateTimeString(),
                ]);
            }

            fclose($handle);
        }, "{$sport}-user-records.csv", ['Content-Type' => 'text/csv']);
    }
}
