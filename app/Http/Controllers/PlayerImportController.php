<?php

namespace App\Http\Controllers;

use App\Http\Requests\ImportPlayersRequest;
use App\Models\Team;
use App\Services\ExcelImportService;
use Illuminate\Http\JsonResponse;

class PlayerImportController extends Controller
{
    public function __construct(protected ExcelImportService $importer) {}

    public function store(ImportPlayersRequest $request, Team $team): JsonResponse
    {
        $result = $this->importer->importPlayers($request->file('file'), $team, $team->academy);

        return response()->json($result);
    }
}
