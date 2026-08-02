<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterAcademyRequest;
use App\Services\RegistrationService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class RegisteredAcademyController extends Controller
{
    public function __construct(protected RegistrationService $registration) {}

    public function create(string $sport): View
    {
        return view('auth.register-academy', ['sport' => $sport]);
    }

    public function store(RegisterAcademyRequest $request, string $sport): RedirectResponse
    {
        $user = $this->registration->registerAcademy(array_merge($request->validated(), [
            'sports' => [$sport],
            'ref' => $request->input('ref'),
        ]));

        event(new Registered($user));

        Auth::login($user);

        return redirect()->route('dashboard');
    }
}
