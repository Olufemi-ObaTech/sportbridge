<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\MergesCrossDatabaseResults;
use App\Http\Requests\RespondAccessRequestRequest;
use App\Http\Requests\StoreAccessRequestRequest;
use App\Models\AccessRequest;
use App\Models\Player;
use App\Services\AccessRequestService;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AccessRequestController extends Controller
{
    use MergesCrossDatabaseResults;

    public function __construct(protected AccessRequestService $accessRequests) {}

    public function index(Request $request): View
    {
        $academy = $request->user()->academyProfile;

        // A multi-sport academy's access requests span two physical databases -
        // merge both in PHP rather than a single SQL query (see JobController).
        $requests = $academy->accessRequests()->with(['agent', 'player'])->get()
            ->concat($academy->basketballAccessRequests()->with(['agent', 'player'])->get());

        return view('academy.access-requests.index', ['requests' => $this->paginateMerged($requests, $request, 15)]);
    }

    public function store(StoreAccessRequestRequest $request, Player $player): RedirectResponse
    {
        $this->accessRequests->request($request->user()->agentProfile, $player, $request->string('message'));

        return back()->with('status', __('Access request sent to the academy.'));
    }

    public function respond(RespondAccessRequestRequest $request, AccessRequest $accessRequest): RedirectResponse
    {
        $this->accessRequests->respond($accessRequest, $request->string('decision') === 'grant');

        return back()->with('status', __('Response recorded.'));
    }
}
