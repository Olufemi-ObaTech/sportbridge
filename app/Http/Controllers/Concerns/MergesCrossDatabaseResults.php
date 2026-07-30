<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

trait MergesCrossDatabaseResults
{
    /**
     * Football and basketball data for a shared feature (jobs, players, teams)
     * lives in two physically separate databases - there's no single SQL query
     * that can paginate across both, so both sides are fetched in full (this
     * app's per-scope result sets are small) and paginated here in PHP.
     */
    protected function paginateMerged(Collection $items, Request $request, int $perPage = 12, string $sortBy = 'created_at'): LengthAwarePaginator
    {
        $sorted = $items->sortByDesc($sortBy)->values();
        $page = $request->integer('page', 1);

        return new LengthAwarePaginator(
            $sorted->forPage($page, $perPage),
            $sorted->count(),
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );
    }
}
