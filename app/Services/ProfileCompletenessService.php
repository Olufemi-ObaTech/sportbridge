<?php

namespace App\Services;

use App\Models\AcademyProfile;
use App\Models\AgentProfile;
use App\Models\CoachProfile;
use App\Models\Player;

class ProfileCompletenessService
{
    /**
     * @return array{percent: int, next_action: string|null}
     */
    public function forAcademy(AcademyProfile $profile): array
    {
        return $this->evaluate([
            'Add your club logo' => (bool) $profile->logo_url,
            'Add a cover image' => (bool) $profile->cover_image_url,
            'Write an about section' => filled($profile->about),
            'Add your stadium/training ground address' => (bool) $profile->address,
            'Create your first team' => $profile->teams()->exists() || $profile->basketballTeams()->exists(),
            'Add your first player' => $profile->players()->exists() || $profile->basketballPlayers()->exists(),
        ]);
    }

    public function forAgent(AgentProfile $profile): array
    {
        return $this->evaluate([
            'Add a cover image' => (bool) $profile->cover_image_url,
            'Write an about section' => filled($profile->about),
            'Select the regions you cover' => ! empty($profile->regions),
            'Add players to your watchlist' => $profile->watchlists()->exists(),
        ]);
    }

    public function forCoach(CoachProfile $profile): array
    {
        return $this->evaluate([
            'Add a cover image' => (bool) $profile->cover_image_url,
            'Write an about section' => filled($profile->about),
            'Add your coaching badges' => ! empty($profile->badges),
            'Upload your CV' => (bool) $profile->cv_url,
            'Apply to your first job' => $profile->jobApplications()->exists(),
        ]);
    }

    public function forPlayer(Player $profile): array
    {
        return $this->evaluate([
            'Add a profile photo' => (bool) $profile->primary_photo_url,
            'Write your bio' => filled($profile->bio),
            'Upload your CV' => (bool) $profile->cv_url,
            'Add a highlight video' => $profile->mediaAssets()->exists(),
        ]);
    }

    /**
     * @param  array<string, bool>  $checks  label => is complete
     * @return array{percent: int, next_action: string|null}
     */
    protected function evaluate(array $checks): array
    {
        $total = count($checks);
        $done = count(array_filter($checks));
        $percent = $total > 0 ? (int) round(($done / $total) * 100) : 100;

        $nextAction = null;
        foreach ($checks as $label => $isComplete) {
            if (! $isComplete) {
                $nextAction = $label;
                break;
            }
        }

        return ['percent' => $percent, 'next_action' => $nextAction];
    }
}
