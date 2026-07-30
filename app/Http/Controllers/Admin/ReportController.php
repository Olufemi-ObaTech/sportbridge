<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Services\ReportService;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(protected ReportService $reports) {}

    public function index(Request $request): View
    {
        $reports = Report::with(['reporter', 'reportedUser'])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')), fn ($q) => $q->pending())
            ->latest()
            ->paginate(20)
            ->withQueryString();

        $reportCounts = Report::pending()
            ->selectRaw('reported_user_id, count(distinct reporter_id) as reporter_count')
            ->groupBy('reported_user_id')
            ->pluck('reporter_count', 'reported_user_id');

        return view('admin.reports.index', [
            'reports' => $reports,
            'reportCounts' => $reportCounts,
            'status' => (string) $request->string('status', 'pending'),
        ]);
    }

    public function dismiss(Request $request, Report $report): RedirectResponse
    {
        $this->reports->dismiss($request->user(), $report);

        return back()->with('status', __('Report dismissed.'));
    }

    public function actioned(Request $request, Report $report): RedirectResponse
    {
        $this->reports->markActioned($request->user(), $report);

        return back()->with('status', __('Report(s) marked actioned.'));
    }
}
