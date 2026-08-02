<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterAgentRequest;
use App\Services\RegistrationService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class RegisteredAgentController extends Controller
{
    public function __construct(protected RegistrationService $registration) {}

    public function create(string $sport): View
    {
        return view('auth.register-agent', ['sport' => $sport]);
    }

    public function store(RegisterAgentRequest $request, string $sport): RedirectResponse
    {
        $user = $this->registration->registerAgent(array_merge($request->validated(), [
            'sport' => $sport,
            'ref' => $request->input('ref'),
        ]));

        event(new Registered($user));

        Auth::login($user);

        return redirect()->route('dashboard');
    }
}
