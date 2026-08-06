<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

/**
 * Token-based (Sanctum "personal access token") auth for a future native app -
 * deliberately NOT the SPA/cookie flow, since a mobile client has no shared
 * cookie jar with the browser.
 */
class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'device_name' => ['required', 'string', 'max:255'],
        ]);

        if (! Auth::once($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => [__('These credentials do not match our records.')],
            ]);
        }

        /** @var User $user */
        $user = Auth::user();

        if (in_array($user->status, [User::STATUS_SUSPENDED, User::STATUS_DENIED], true)) {
            throw ValidationException::withMessages([
                'email' => [__('Your account is not active. Please contact support.')],
            ]);
        }

        $token = $user->createToken($credentials['device_name']);

        return response()->json([
            'token' => $token->plainTextToken,
            'user' => $this->presentUser($user),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['status' => 'logged_out']);
    }

    public function user(Request $request): JsonResponse
    {
        return response()->json(['user' => $this->presentUser($request->user())]);
    }

    private function presentUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'role' => $user->role,
            'sport' => $user->sport,
            'status' => $user->status,
        ];
    }
}
