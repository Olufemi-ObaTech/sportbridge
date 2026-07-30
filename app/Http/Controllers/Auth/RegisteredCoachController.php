<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterCoachRequest;
use App\Services\RegistrationService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class RegisteredCoachController extends Controller
{
    public function __construct(protected RegistrationService $registration) {}

    public function create(string $sport): View
    {
        return view('auth.register-coach', ['sport' => $sport]);
    }

    public function store(RegisterCoachRequest $request, string $sport): RedirectResponse
    {
        $user = $this->registration->registerCoach(array_merge($request->validated(), ['sport' => $sport]));

        event(new Registered($user));

        Auth::login($user);

        return redirect()->route('dashboard');
    }
}
