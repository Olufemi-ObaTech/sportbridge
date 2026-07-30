<?php

namespace App\Services;

class YoutubeService
{
    /**
     * Extract the 11-character video ID from any common YouTube URL format:
     * watch?v=, youtu.be/, /embed/, and /shorts/.
     */
    public function extractVideoId(string $url): ?string
    {
        $patterns = [
            '~youtube\.com/watch\?v=([A-Za-z0-9_-]{11})~',
            '~youtu\.be/([A-Za-z0-9_-]{11})~',
            '~youtube\.com/embed/([A-Za-z0-9_-]{11})~',
            '~youtube\.com/shorts/([A-Za-z0-9_-]{11})~',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $url, $matches)) {
                return $matches[1];
            }
        }

        // Bare 11-character ID pasted directly.
        if (preg_match('~^[A-Za-z0-9_-]{11}$~', trim($url))) {
            return trim($url);
        }

        return null;
    }

    public function embedUrl(string $videoId): string
    {
        return "https://www.youtube.com/embed/{$videoId}";
    }

    public function thumbnailUrl(string $videoId): string
    {
        return "https://img.youtube.com/vi/{$videoId}/hqdefault.jpg";
    }
}
