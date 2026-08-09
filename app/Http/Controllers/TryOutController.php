<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTryOutRequest;
use App\Http\Requests\UpdateTryOutRequest;
use App\Models\TryOut;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TryOutController extends Controller
{
    public function index(Request $request): View
    {
        $tryOuts = TryOut::query()
            ->with('postedByUser')
            ->open()
            ->when($request->filled('sport'), fn ($q) => $q->where('sport', $request->string('sport')))
            ->when($request->filled('gender'), fn ($q) => $q->where('gender', $request->string('gender')))
            ->when($request->filled('location'), fn ($q) => $q->where('location', 'like', '%'.$request->string('location').'%'))
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return view('try-outs.index', ['tryOuts' => $tryOuts]);
    }

    public function show(Request $request, TryOut $tryOut): View
    {
        $tryOut->load('postedByUser');

        $hasExpressedInterest = $request->user()
            ? $tryOut->interests()->where('user_id', $request->user()->id)->exists()
            : false;

        return view('try-outs.show', ['tryOut' => $tryOut, 'hasExpressedInterest' => $hasExpressedInterest]);
    }

    public function mineIndex(Request $request): View
    {
        $tryOuts = TryOut::query()
            ->withCount('interests')
            ->where('posted_by_user_id', $request->user()->id)
            ->latest()
            ->paginate(12);

        return view('try-outs.mine', ['tryOuts' => $tryOuts]);
    }

    public function create(): View
    {
        $this->authorize('create', TryOut::class);

        return view('try-outs.create');
    }

    public function store(StoreTryOutRequest $request): RedirectResponse
    {
        $tryOut = TryOut::create(array_merge($request->validated(), [
            'posted_by_user_id' => $request->user()->id,
            'status' => TryOut::STATUS_OPEN,
        ]));

        return redirect()->route('try-outs.show', $tryOut)->with('status', __('Try-out opportunity posted.'));
    }

    public function edit(TryOut $tryOut): View
    {
        $this->authorize('update', $tryOut);

        return view('try-outs.edit', ['tryOut' => $tryOut]);
    }

    public function update(UpdateTryOutRequest $request, TryOut $tryOut): RedirectResponse
    {
        $tryOut->update($request->validated());

        return redirect()->route('try-outs.show', $tryOut)->with('status', __('Try-out updated.'));
    }

    public function close(TryOut $tryOut): RedirectResponse
    {
        $this->authorize('close', $tryOut);

        $tryOut->update(['status' => TryOut::STATUS_CLOSED]);

        return back()->with('status', __('Try-out closed.'));
    }

    public function interested(TryOut $tryOut): View
    {
        $this->authorize('viewInterests', $tryOut);

        $interests = $tryOut->interests()->with('user')->latest()->paginate(20);

        return view('try-outs.interested', ['tryOut' => $tryOut, 'interests' => $interests]);
    }
}
