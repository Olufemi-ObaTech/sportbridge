<?php

namespace App\Services;

use App\Imports\PlayersImport;
use App\Models\AcademyProfile;
use App\Models\Team;
use Illuminate\Http\UploadedFile;
use Maatwebsite\Excel\Facades\Excel;

class ExcelImportService
{
    /**
     * @return array{imported: int, failed: int, errors: array<int, array{row: int, attribute: string, errors: array<int, string>, values: array<string, mixed>}>}
     */
    public function importPlayers(UploadedFile $file, Team $team, AcademyProfile $academy): array
    {
        $import = new PlayersImport($team, $academy);

        Excel::import($import, $file);

        $errors = collect($import->failures())->map(fn ($failure) => [
            'row' => $failure->row(),
            'attribute' => $failure->attribute(),
            'errors' => $failure->errors(),
            'values' => $failure->values(),
        ])->all();

        return [
            'imported' => $import->imported - count($errors),
            'failed' => count($errors),
            'errors' => $errors,
        ];
    }
}
