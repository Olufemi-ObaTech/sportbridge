<?php

namespace Database\Seeders;

use App\Models\AcademyProfile;
use App\Models\AgentProfile;
use App\Models\Basketball\BasketballAgentProfile;
use App\Models\Basketball\BasketballCoachProfile;
use App\Models\Basketball\BasketballPlayer;
use App\Models\CoachProfile;
use App\Models\Player;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * DemoSeeder/BasketballDemoSeeder create dozens of accounts with random
 * Faker emails - great for populated search/browse views, useless for
 * "here are the login credentials" since nobody can predict a Faker email.
 * This seeder adds one fixed, memorable, active account per role per sport
 * (8 total, on top of the existing random pool and the super admin from
 * AdminSeeder) so every role can actually be logged into on demand.
 */
class DemoCredentialsSeeder extends Seeder
{
    public const PASSWORD = 'Password!2026';

    public function run(): void
    {
        $this->footballAcademy();
        $this->footballAgent();
        $this->footballCoach();
        $this->footballPlayer();

        $this->basketballAcademy();
        $this->basketballAgent();
        $this->basketballCoach();
        $this->basketballPlayer();

        $this->command->info('Demo credential accounts seeded (password for all: '.self::PASSWORD.').');
    }

    private function footballAcademy(): void
    {
        $academy = AcademyProfile::factory()->verified()->create([
            'club_name' => 'Lagos Elite FC',
            'slug' => 'lagos-elite-fc-demo',
            'sports' => ['football'],
            'fifa_connect_id' => 'FIFA-CONNECT-DEMO1',
            'has_fifa_tms_account' => true,
        ]);

        $academy->user->update([
            'name' => 'Lagos Elite FC',
            'email' => 'demo.academy.football@sportbridge.test',
            'password' => self::PASSWORD,
            'status' => User::STATUS_ACTIVE,
            'email_verified_at' => now(),
        ]);
    }

    private function footballAgent(): void
    {
        $agent = AgentProfile::factory()->create([
            'agency_name' => 'Continental Sports Management',
            'sport' => AgentProfile::SPORT_FOOTBALL,
            'verified_badge' => true,
        ]);

        $agent->user->update([
            'name' => 'Continental Sports Management',
            'username' => 'continental-sports-management-demo',
            'email' => 'demo.agent.football@sportbridge.test',
            'password' => self::PASSWORD,
            'status' => User::STATUS_ACTIVE,
            'email_verified_at' => now(),
        ]);
    }

    private function footballCoach(): void
    {
        $coach = CoachProfile::factory()->create([
            'full_name' => 'Demo Coach (Football)',
            'preferred_role' => 'head_coach',
        ]);

        $coach->user->update([
            'name' => 'Demo Coach (Football)',
            'username' => 'demo-coach-football',
            'email' => 'demo.coach.football@sportbridge.test',
            'password' => self::PASSWORD,
            'status' => User::STATUS_ACTIVE,
            'email_verified_at' => now(),
        ]);
    }

    private function footballPlayer(): void
    {
        $user = User::create([
            'name' => 'Demo Player (Football)',
            'email' => 'demo.player.football@sportbridge.test',
            'password' => self::PASSWORD,
            'role' => User::ROLE_PLAYER,
            'status' => User::STATUS_ACTIVE,
            'username' => 'demo-player-football',
            'sport' => Player::SPORT_FOOTBALL,
            'email_verified_at' => now(),
        ]);

        Player::create([
            'user_id' => $user->id,
            'team_id' => null,
            'academy_id' => null,
            'sport' => Player::SPORT_FOOTBALL,
            'full_name' => $user->name,
            'slug' => 'demo-player-football',
            'dob' => now()->subYears(19)->format('Y-m-d'),
            'nationality' => 'Nigeria',
            'position' => 'ST',
            'foot' => 'right',
            'is_public' => true,
        ]);
    }

    private function basketballAcademy(): void
    {
        $academy = AcademyProfile::factory()->verified()->create([
            'club_name' => 'Accra Hoopers Basketball Academy',
            'slug' => 'accra-hoopers-basketball-academy-demo',
            'sports' => ['basketball'],
            'fiba_map_id' => 'FIBA-MAP-DEMO1',
            'has_fiba_map_account' => true,
        ]);

        $academy->user->update([
            'name' => 'Accra Hoopers Basketball Academy',
            'email' => 'demo.academy.basketball@sportbridge.test',
            'password' => self::PASSWORD,
            'status' => User::STATUS_ACTIVE,
            'email_verified_at' => now(),
        ]);
    }

    private function basketballAgent(): void
    {
        $user = User::factory()->agent()->create([
            'name' => 'Baseline Basketball Management',
            'username' => 'baseline-basketball-management-demo',
            'email' => 'demo.agent.basketball@sportbridge.test',
            'password' => self::PASSWORD,
            'status' => User::STATUS_ACTIVE,
            'sport' => 'basketball',
            'email_verified_at' => now(),
        ]);

        BasketballAgentProfile::create([
            'user_id' => $user->id,
            'agency_name' => 'Baseline Basketball Management',
            'sport' => 'basketball',
            'license_number' => 'NBPA-DEMO-1',
            'nationality' => 'Ghana',
            'experience_years' => 8,
            'regions' => ['West Africa', 'Europe'],
            'id_doc_url' => 'seed/id-demo-basketball-agent.pdf',
            'verification_body' => 'FIBA',
            'verified_badge' => true,
        ]);
    }

    private function basketballCoach(): void
    {
        $user = User::factory()->coach()->create([
            'name' => 'Demo Coach (Basketball)',
            'username' => 'demo-coach-basketball',
            'email' => 'demo.coach.basketball@sportbridge.test',
            'password' => self::PASSWORD,
            'status' => User::STATUS_ACTIVE,
            'sport' => 'basketball',
            'email_verified_at' => now(),
        ]);

        BasketballCoachProfile::create([
            'user_id' => $user->id,
            'sport' => 'basketball',
            'full_name' => $user->name,
            'badges' => ['FIBA Coaching License'],
            'preferred_role' => 'head_coach',
            'experience_years' => 10,
            'nationality' => 'Ghana',
            'cv_url' => 'seed/cv-demo-basketball-coach.pdf',
        ]);
    }

    private function basketballPlayer(): void
    {
        $user = User::create([
            'name' => 'Demo Player (Basketball)',
            'email' => 'demo.player.basketball@sportbridge.test',
            'password' => self::PASSWORD,
            'role' => User::ROLE_PLAYER,
            'status' => User::STATUS_ACTIVE,
            'username' => 'demo-player-basketball',
            'sport' => 'basketball',
            'email_verified_at' => now(),
        ]);

        BasketballPlayer::create([
            'user_id' => $user->id,
            'team_id' => null,
            'academy_id' => null,
            'sport' => 'basketball',
            'full_name' => $user->name,
            'slug' => 'demo-player-basketball',
            'dob' => now()->subYears(19)->format('Y-m-d'),
            'nationality' => 'Ghana',
            'position' => 'PG',
            'dominant_hand' => 'right',
            'is_public' => true,
        ]);
    }
}
