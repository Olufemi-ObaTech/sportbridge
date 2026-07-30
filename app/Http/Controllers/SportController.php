<?php

namespace App\Http\Controllers;

use App\Http\Middleware\SetSport;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class SportController extends Controller
{
    public function update(Request $request, string $sport): RedirectResponse
    {
        if (in_array($sport, SetSport::SUPPORTED, true)) {
            $request->session()->put('sport', $sport);
        }

        return back();
    }
}
