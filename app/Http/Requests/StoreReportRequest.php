<?php

namespace App\Http\Requests;

use App\Models\Report;
use Illuminate\Foundation\Http\FormRequest;

class StoreReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        if (! $this->user()?->isActive()) {
            return false;
        }

        // Checked here (not just in the controller) so it runs before
        // validation - otherwise a missing "reason" field would produce a
        // 422 instead of the 404 a self/admin report should always get.
        $target = $this->route('user');
        abort_if($target && $target->id === $this->user()->id, 404);
        abort_if($target?->isSuperAdmin(), 404);

        return true;
    }

    public function rules(): array
    {
        return [
            'reason' => ['required', 'in:'.implode(',', array_keys(Report::REASONS))],
            'details' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
