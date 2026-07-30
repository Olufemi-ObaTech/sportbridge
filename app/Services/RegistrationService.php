<?php

namespace App\Services;

use App\Models\AcademyProfile;
use App\Models\AgentProfile;
use App\Models\Basketball\BasketballAgentProfile;
use App\Models\Basketball\BasketballCoachProfile;
use App\Models\Basketball\BasketballPlayer;
use App\Models\CoachProfile;
use App\Models\Player;
use App\Models\User;
use App\Notifications\NewRegistrationNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;

class RegistrationService
{
    public function __construct(protected ImageService $images) {}

    public function registerAcademy(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = $this->createUser($data, User::ROLE_ACADEMY);

            AcademyProfile::create([
                'user_id' => $user->id,
                'club_name' => $data['club_name'],
                'slug' => $this->uniqueSlug(AcademyProfile::class, $data['club_name']),
                'license_number' => $data['license_number'],
                'license_doc_url' => $this->images->storePrivateDocument($data['license_document'], 'licenses'),
                'fifa_connect_id' => $data['fifa_connect_id'] ?? null,
                'has_fifa_tms_account' => $data['has_fifa_tms_account'] ?? null,
                'fiba_map_id' => $data['fiba_map_id'] ?? null,
                'has_fiba_map_account' => $data['has_fiba_map_account'] ?? null,
                'sports' => $data['sports'] ?? null,
                'linkedin' => $data['linkedin'] ?? null,
                'country' => $data['country'],
                'state' => $data['state'] ?? null,
                'address' => $data['address'],
                'phone' => $data['phone'],
                'year_founded' => $data['year_founded'] ?? null,
                'logo_url' => isset($data['logo']) ? $this->images->storePublicImage($data['logo'], 'academies/logos', 600) : null,
            ]);

            $this->notifyAdmins($user);

            return $user;
        });
    }

    public function registerAgent(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = $this->createUser($data, User::ROLE_AGENT);

            $agentModel = $data['sport'] === AgentProfile::SPORT_BASKETBALL
                ? BasketballAgentProfile::class
                : AgentProfile::class;

            $agentModel::create([
                'user_id' => $user->id,
                'agency_name' => $data['agency_name'],
                'sport' => $data['sport'],
                'license_number' => $data['license_number'],
                'nationality' => $data['nationality'],
                'experience_years' => $data['experience_years'],
                'regions' => $data['regions'],
                'verification_body' => $data['verification_body'] ?? null,
                'linkedin' => $data['linkedin'] ?? null,
                'photo_url' => isset($data['photo']) ? $this->images->storePublicImage($data['photo'], 'agents/photos', 800) : null,
                'id_doc_url' => $this->images->storePrivateDocument($data['id_document'], 'agent-ids'),
            ]);

            $this->notifyAdmins($user);

            return $user;
        });
    }

    public function registerCoach(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = $this->createUser($data, User::ROLE_COACH);

            $coachModel = $data['sport'] === CoachProfile::SPORT_BASKETBALL
                ? BasketballCoachProfile::class
                : CoachProfile::class;

            $coachModel::create([
                'user_id' => $user->id,
                'sport' => $data['sport'],
                'full_name' => $data['name'],
                'badges' => $data['badges'],
                'certificates' => array_values(array_filter(array_map('trim', explode("\n", $data['certificates'] ?? '')))),
                'preferred_role' => $data['preferred_role'],
                'experience_years' => $data['experience_years'],
                'current_club' => $data['current_club'] ?? null,
                'nationality' => $data['nationality'],
                'linkedin' => $data['linkedin'] ?? null,
                'photo_url' => isset($data['photo']) ? $this->images->storePublicImage($data['photo'], 'coaches/photos', 800) : null,
                'cv_url' => $this->images->storePrivateDocument($data['cv'], 'coach-cvs'),
            ]);

            $this->notifyAdmins($user);

            return $user;
        });
    }

    public function registerPlayer(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'role' => User::ROLE_PLAYER,
                // Free players are self-service and unmoderated - active immediately,
                // unlike academies/agents/coaches who require document verification.
                'status' => User::STATUS_ACTIVE,
                'username' => $this->uniqueUsername($data['name']),
                'sport' => $data['sport'],
            ]);

            $playerModel = $data['sport'] === Player::SPORT_BASKETBALL
                ? BasketballPlayer::class
                : Player::class;

            $playerModel::create(Player::sanitizeFootHand([
                'user_id' => $user->id,
                'team_id' => null,
                'academy_id' => null,
                'sport' => $data['sport'],
                'full_name' => $data['name'],
                'slug' => Player::uniqueSlug($data['name']),
                'dob' => $data['dob'],
                'nationality' => $data['nationality'],
                'position' => $data['position'],
                'secondary_position' => $data['secondary_position'] ?? null,
                'foot' => $data['foot'] ?? null,
                'dominant_hand' => $data['dominant_hand'] ?? null,
                'current_club' => $data['current_club'] ?? null,
                'linkedin' => $data['linkedin'] ?? null,
                'primary_photo_url' => isset($data['photo']) ? $this->images->storePublicImage($data['photo'], 'players/photos', 1000) : null,
                'guardian_name' => $data['guardian_name'] ?? null,
                'guardian_consent_at' => isset($data['guardian_name']) ? now() : null,
                'is_public' => true,
            ], $data['sport']));

            return $user;
        });
    }

    protected function createUser(array $data, string $role): User
    {
        return User::create([
            'name' => $data['name'] ?? $data['club_name'] ?? $data['agency_name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => $role,
            // No pre-approval gate: accounts go live immediately. Admins are still
            // notified (see notifyAdmins) and can suspend/remove bad actors after the fact.
            'status' => User::STATUS_ACTIVE,
            'username' => $this->uniqueUsername($data['name'] ?? $data['club_name'] ?? $data['agency_name']),
            // Academies are multi-sport (see `sports` JSON) and have no single value here.
            'sport' => $data['sport'] ?? null,
        ]);
    }

    protected function uniqueUsername(string $seed): string
    {
        $base = Str::slug($seed);
        $username = $base;
        $i = 1;

        while (User::where('username', $username)->exists()) {
            $username = "{$base}-".(++$i);
        }

        return $username;
    }

    protected function uniqueSlug(string $modelClass, string $seed): string
    {
        $base = Str::slug($seed);
        $slug = $base;
        $i = 1;

        while ($modelClass::where('slug', $slug)->exists()) {
            $slug = "{$base}-".(++$i);
        }

        return $slug;
    }

    protected function notifyAdmins(User $registrant): void
    {
        $admins = User::role(User::ROLE_SUPER_ADMIN)->get();

        if ($admins->isNotEmpty()) {
            Notification::send($admins, new NewRegistrationNotification($registrant));
        }
    }
}
