<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAgentDocumentRequest;
use App\Models\AgentDocument;
use App\Models\AgentProfile;
use App\Services\ImageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AgentDocumentController extends Controller
{
    public function __construct(protected ImageService $images) {}

    public function store(StoreAgentDocumentRequest $request, AgentProfile $agent): RedirectResponse
    {
        AgentDocument::create([
            'agent_profile_id' => $agent->id,
            'sport' => $agent->sport,
            'title' => $request->string('title'),
            'file_url' => $this->images->storePrivateDocument($request->file('file'), 'agent-documents'),
        ]);

        return back()->with('status', __('Document uploaded.'));
    }

    public function destroy(Request $request, AgentProfile $agent, AgentDocument $document): RedirectResponse
    {
        abort_unless($request->user()?->agentProfile?->is($agent), 403);
        abort_unless($document->agent_profile_id === $agent->id && $document->sport === $agent->sport, 404);

        $this->images->delete($document->file_url, 'local');
        $document->delete();

        return back()->with('status', __('Document removed.'));
    }
}
