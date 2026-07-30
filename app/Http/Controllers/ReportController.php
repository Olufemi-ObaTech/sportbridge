<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReportRequest;
use App\Models\Report;
use App\Models\User;
use App\Services\ReportService;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;

class ReportController extends Controller
{
    public function __construct(protected ReportService $reports) {}

    public function create(User $user): View
    {
        abort_if($user->id === auth()->id(), 404);
        abort_if($user->isSuperAdmin(), 404);

        return view('reports.create', ['reportedUser' => $user]);
    }

    public function store(StoreReportRequest $request, User $user): RedirectResponse
    {
        abort_if($user->id === $request->user()->id, 404);
        abort_if($user->isSuperAdmin(), 404);

        if (Report::pending()->where('reporter_id', $request->user()->id)->where('reported_user_id', $user->id)->exists()) {
            return back()->withErrors(['report' => __('You already have an open report against this account - an admin hasn\'t reviewed it yet.')]);
        }

        $this->reports->fileReport($request->user(), $user, $request->string('reason'), $request->input('details'));

        return back()->with('status', __('Report submitted. A Super Admin will review it.'));
    }
}
