<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Player;
use Illuminate\Http\JsonResponse;

class PlayerController extends Controller
{
    public function show(Player $player): JsonResponse
    {
        $this->authorize('view', $player);

        $player->load(['team', 'academy', 'mediaAssets' => fn ($q) => $q->orderBy('sort_order')]);

        return response()->json([
            'data' => [
                'id' => $player->id,
                'slug' => $player->slug,
                'full_name' => $player->full_name,
                'age' => $player->age,
                'sport' => $player->sport,
                'position' => $player->position,
                'secondary_position' => $player->secondary_position,
                'nationality' => $player->nationality,
                'foot' => $player->foot,
                'height_cm' => $player->height_cm,
                'weight_kg' => $player->weight_kg,
                'bio' => $player->bio,
                'achievements' => $player->achievements,
                'primary_photo_url' => $player->primary_photo_url ? asset('storage/'.$player->primary_photo_url) : null,
                'club_name' => $player->academy?->club_name ?? __('Free Agent'),
                'media' => $player->mediaAssets->map(fn ($media) => [
                    'id' => $media->id,
                    'type' => $media->type,
                    'url' => $media->url,
                ]),
                'url' => route('player.show', $player),
            ],
        ]);
    }
}
