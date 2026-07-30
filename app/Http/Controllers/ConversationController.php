<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    public function index(Request $request): View
    {
        return view('inbox.index', [
            'conversations' => $this->conversationsFor($request->user()),
        ]);
    }

    public function start(Request $request, User $user): RedirectResponse
    {
        $this->authorize('create', Conversation::class);

        $me = $request->user();
        abort_if($me->id === $user->id, 403);
        abort_unless($user->isActive(), 404);

        $conversation = Conversation::where(function ($q) use ($me, $user) {
            $q->where('initiator_id', $me->id)->where('recipient_id', $user->id);
        })->orWhere(function ($q) use ($me, $user) {
            $q->where('initiator_id', $user->id)->where('recipient_id', $me->id);
        })->first();

        if (! $conversation) {
            $conversation = Conversation::create([
                'initiator_id' => $me->id,
                'recipient_id' => $user->id,
                'last_message_at' => now(),
            ]);
        }

        return redirect()->route('inbox.show', $conversation);
    }

    public function show(Request $request, Conversation $conversation): View
    {
        $this->authorize('view', $conversation);

        // Message::playerCard() branches on $this->player_sport per-instance, which
        // nested eager loading can't resolve correctly (it evaluates the relation
        // once against a blank Message) - left to resolve lazily per-message instead.
        $conversation->load(['messages.sender', 'initiator', 'recipient']);

        $conversation->messages()
            ->where('sender_id', '!=', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return view('inbox.show', [
            'conversation' => $conversation,
            'conversations' => $this->conversationsFor($request->user()),
            'otherUser' => $conversation->otherParticipant($request->user()),
        ]);
    }

    protected function conversationsFor(User $user): LengthAwarePaginator
    {
        return Conversation::with(['initiator', 'recipient', 'messages' => fn ($q) => $q->latest()->limit(1)])
            ->where('initiator_id', $user->id)
            ->orWhere('recipient_id', $user->id)
            ->orderByDesc('last_message_at')
            ->paginate(20);
    }
}
