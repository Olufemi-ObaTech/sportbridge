<?php

namespace Database\Seeders;

use App\Models\AcademyProfile;
use App\Models\Basketball\BasketballAccessRequest;
use App\Models\Basketball\BasketballAgentProfile;
use App\Models\Basketball\BasketballCoachProfile;
use App\Models\Basketball\BasketballJobApplication;
use App\Models\Basketball\BasketballJobPost;
use App\Models\Basketball\BasketballMediaAsset;
use App\Models\Basketball\BasketballPlayer;
use App\Models\Basketball\BasketballTeam;
use App\Models\Basketball\BasketballWatchlist;
use App\Models\CoachProfile;
use App\Models\Conversation;
use App\Models\FeedPost;
use App\Models\JobPost;
use App\Models\Message;
use App\Models\Player;
use App\Models\PostComment;
use App\Models\PostLike;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Basketball now lives in a genuinely separate physical database
 * (`mysql_basketball` - see config/database.php and app/Models/Basketball/*).
 * This seeder targets that database directly via the Basketball* models.
 * It deliberately does not touch or reuse the older basketball-tagged rows
 * that still exist in the main database from before the physical split
 * (left in place - see the football-vs-basketball database-split plan).
 *
 * Only academy_profiles, feed_posts/comments/likes, and conversations/messages
 * stay in the main database (they're intentionally not split - see
 * AcademyProfile::$connection and Message::playerCard()'s notes), everything
 * else here is created directly in the basketball database.
 */
class BasketballDemoSeeder extends Seeder
{
    private const SAMPLE_POSTS = [
        'Big win tonight in the regional final — our point guard dropped 24 points and 9 assists. Incredible composure down the stretch.',
        "Scouting note: watched a 6'8\" forward this weekend with a genuinely versatile handle and a quick first step. Definitely one to track.",
        'Tryout turnout was outstanding this year — over 80 prospects came through the gym. Coaching staff will post a shortlist by Friday.',
        "Reminder: pre-season conditioning camp starts Monday at 7am. Bring both practice jerseys — we're running combine testing followed by 5-on-5.",
        'Proud to announce two of our academy graduates just signed their first professional contracts overseas.',
        'Our regional scouting network keeps finding hidden gems — this week we identified a lockdown wing defender and a stretch four worth a closer look.',
        "Clean sweep at this weekend's tournament — undefeated with the best defensive rating in the bracket.",
        'Looking for talented young guards aged 15-17 for an upcoming trial camp. Reach out if you coach someone who might be a fit.',
        'Great week of practice focused on pick-and-roll reads. The improvement in decision-making under ball pressure has been noticeable.',
        'Partnering with a local high school to give more student-athletes access to structured basketball coaching twice a week.',
        'Player development update: our performance team rolled out individualised shooting and recovery plans for every player on the roster.',
        'Had a great conversation today about pathways from academy basketball into professional and collegiate programs.',
        'Coaching clinic this weekend drew coaches from across the region — always good to trade ideas and raise the level together.',
        'New training facility upgrades are complete, including a redesigned strength and conditioning room for our players.',
        'Confirmed our roster for the upcoming international youth tournament — five players will represent the academy on the biggest stage of their careers so far.',
        "Agent's note: always encourage young players to prioritise their education alongside basketball — a well-rounded athlete makes better decisions on and off the court.",
        'Great session today on free-throw mechanics and shot discipline. Small details make a big difference at this level.',
        "Expanding our scouting coverage to two new regions this season. If you know a standout young player, we'd love to hear about them.",
        'End of season review: real progress from our development squad, with four players stepping up to train with the senior team.',
        'This is an online training session focused on defensive footwork and closeouts — join link below for anyone who wants to sit in.',
    ];

    // Realistic, position-correlated height/weight ranges (cm/kg) - guards run
    // shorter and lighter, centers taller and heavier, matching real basketball builds.
    private const PHYSIQUE = [
        'PG' => ['height' => [178, 193], 'weight' => [75, 95]],
        'SG' => ['height' => [188, 198], 'weight' => [80, 100]],
        'SF' => ['height' => [196, 206], 'weight' => [90, 110]],
        'PF' => ['height' => [203, 211], 'weight' => [100, 120]],
        'C' => ['height' => [208, 218], 'weight' => [110, 130]],
    ];

    public function run(): void
    {
        // Academies stay central (AcademyProfile isn't split - one club can run
        // both sports via its `sports` JSON column), but their basketball rosters/
        // jobs live in the basketball database via basketballTeams()/basketballJobPosts().
        $academies = AcademyProfile::factory()
            ->count(2)
            ->verified()
            ->create(['country' => fake()->randomElement(['Nigeria', 'Senegal', 'Angola', 'South Africa', 'Egypt'])])
            ->each(function (AcademyProfile $academy) {
                $newName = fake()->city().' '.fake()->randomElement(['Hoopers', 'Ballers', 'Basketball Academy', 'Hawks Basketball', 'Stars Basketball']);
                $academy->update([
                    'club_name' => $newName,
                    'slug' => Str::slug($newName).'-'.fake()->unique()->numberBetween(1000, 9999),
                    'sports' => ['basketball'],
                    'fiba_map_id' => strtoupper(fake()->bothify('FIBA-MAP-####')),
                    'has_fiba_map_account' => true,
                ]);

                $academy->user()->update([
                    'status' => User::STATUS_ACTIVE,
                    'email_verified_at' => now(),
                    'name' => $newName,
                    'sport' => null,
                ]);
            });

        $agents = collect(range(1, 4))->map(function () {
            $user = User::factory()->agent()->create([
                'status' => User::STATUS_ACTIVE,
                'email_verified_at' => now(),
                'sport' => 'basketball',
            ]);

            return BasketballAgentProfile::create([
                'user_id' => $user->id,
                'agency_name' => fake()->company().' Basketball Management',
                'sport' => 'basketball',
                'license_number' => strtoupper(fake()->bothify('NBPA-####-??')),
                'nationality' => fake()->country(),
                'experience_years' => fake()->numberBetween(1, 25),
                'regions' => fake()->randomElements(
                    ['West Africa', 'East Africa', 'North Africa', 'Southern Africa', 'Europe', 'North America'],
                    fake()->numberBetween(1, 3)
                ),
                'id_doc_url' => 'seed/id-'.fake()->uuid().'.pdf',
                'about' => fake()->paragraphs(2, true),
                'verification_body' => fake()->randomElement(['NBPA', 'FIBA', 'National Basketball Federation']),
                'verified_badge' => fake()->boolean(40),
            ]);
        });

        $coachRoles = array_keys(CoachProfile::rolesFor(CoachProfile::SPORT_BASKETBALL));
        $coaches = collect(range(1, 6))->map(function () use ($coachRoles) {
            $user = User::factory()->coach()->create([
                'status' => User::STATUS_ACTIVE,
                'email_verified_at' => now(),
                'sport' => 'basketball',
            ]);

            return BasketballCoachProfile::create([
                'user_id' => $user->id,
                'sport' => 'basketball',
                'full_name' => $user->name,
                'badges' => fake()->randomElements(CoachProfile::BADGES_BASKETBALL, fake()->numberBetween(1, 3)),
                'preferred_role' => fake()->randomElement($coachRoles),
                'experience_years' => fake()->numberBetween(1, 30),
                'current_club' => fake()->optional()->company().' Hoopers',
                'nationality' => fake()->country(),
                'cv_url' => 'seed/cv-'.fake()->uuid().'.pdf',
                'about' => fake()->paragraphs(2, true),
                'open_to_work' => fake()->boolean(80),
            ]);
        });

        // A pending basketball coach so the moderation queue reflects both sports.
        $pendingUser = User::factory()->coach()->create([
            'status' => User::STATUS_PENDING,
            'email_verified_at' => now(),
            'sport' => 'basketball',
        ]);
        BasketballCoachProfile::create([
            'user_id' => $pendingUser->id,
            'sport' => 'basketball',
            'full_name' => $pendingUser->name,
            'badges' => ['FIBA Coaching License'],
            'preferred_role' => 'assistant_coach',
            'experience_years' => fake()->numberBetween(1, 10),
            'nationality' => fake()->country(),
            'cv_url' => 'seed/cv-'.fake()->uuid().'.pdf',
        ]);

        $teams = collect();
        foreach ($academies as $academy) {
            for ($i = 0; $i < 2; $i++) {
                $teams->push(BasketballTeam::create([
                    'academy_id' => $academy->id,
                    'sport' => 'basketball',
                    'name' => fake()->randomElement(['Ballers', 'Hoopers', 'Dunkers', 'Shooters', 'Risers']).' '.fake()->numberBetween(1, 3),
                    'season' => '2025/2026',
                    'age_group' => fake()->randomElement(['U-13', 'U-15', 'U-17', 'U-20', 'Senior', 'Women']),
                    'coach_name' => fake()->name(),
                ]));
            }
        }

        $positions = Player::POSITIONS_BASKETBALL;
        $players = collect();
        foreach ($teams as $team) {
            $count = (int) ceil(24 / $teams->count());
            for ($i = 0; $i < $count; $i++) {
                $position = fake()->randomElement($positions);
                $physique = self::PHYSIQUE[$position];
                $name = fake()->name();

                $players->push(BasketballPlayer::create([
                    'team_id' => $team->id,
                    'academy_id' => $team->academy_id,
                    'sport' => 'basketball',
                    'full_name' => $name,
                    'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(1000, 9999),
                    'dob' => fake()->dateTimeBetween('-30 years', '-15 years')->format('Y-m-d'),
                    'nationality' => fake()->country(),
                    'position' => $position,
                    'secondary_position' => fake()->optional(0.4)->randomElement($positions),
                    'dominant_hand' => fake()->randomElement(['left', 'right', 'ambidextrous']),
                    'height_cm' => fake()->numberBetween(...$physique['height']),
                    'weight_kg' => fake()->numberBetween(...$physique['weight']),
                    'jersey_number' => fake()->numberBetween(0, 99),
                    'bio' => fake()->paragraph(),
                    'is_public' => true,
                    'views_count' => fake()->numberBetween(0, 500),
                ]));
            }
        }
        $players = $players->take(24);

        $players->random((int) ceil($players->count() / 3))->each(function (BasketballPlayer $player) {
            BasketballMediaAsset::create([
                'player_id' => $player->id,
                'type' => 'image',
                'url' => 'seed/media-'.fake()->uuid().'.jpg',
                'title' => fake()->sentence(4),
                'is_featured' => true,
                'sort_order' => 0,
            ]);
            BasketballMediaAsset::create([
                'player_id' => $player->id,
                'type' => 'youtube',
                'youtube_embed_id' => fake()->regexify('[A-Za-z0-9_-]{11}'),
                'title' => fake()->sentence(4),
                'duration_seconds' => fake()->numberBetween(60, 300),
                'is_featured' => false,
                'sort_order' => 1,
            ]);
        });

        $jobRoles = array_keys(JobPost::rolesFor('basketball'));
        $jobPosts = collect();
        foreach ($academies as $academy) {
            for ($i = 0; $i < 4; $i++) {
                $roleType = fake()->randomElement($jobRoles);
                $salaryMin = fake()->numberBetween(150_000, 500_000);

                $jobPosts->push(BasketballJobPost::create([
                    'academy_id' => $academy->id,
                    'posted_by_user_id' => $academy->user_id,
                    'sport' => 'basketball',
                    'title' => ucwords(str_replace('_', ' ', $roleType)).' - '.fake()->city(),
                    'role_type' => $roleType,
                    'description' => fake()->paragraphs(3, true),
                    'requirements' => fake()->paragraph(),
                    'location' => fake()->city().', '.fake()->country(),
                    'salary_min' => $salaryMin,
                    'salary_max' => $salaryMin + fake()->numberBetween(50_000, 300_000),
                    'currency' => 'USD',
                    'contract_type' => fake()->randomElement(['full_time', 'part_time', 'contract', 'volunteer']),
                    'application_deadline' => fake()->dateTimeBetween('+2 weeks', '+3 months')->format('Y-m-d'),
                    'status' => 'open',
                    'applications_count' => 0,
                ]));
            }
        }

        foreach ($jobPosts->take(5) as $jobPost) {
            $applicants = $coaches->random(min(2, $coaches->count()));
            foreach ($applicants as $coach) {
                BasketballJobApplication::create([
                    'job_post_id' => $jobPost->id,
                    'coach_profile_id' => $coach->id,
                    'cover_letter' => fake()->paragraphs(2, true),
                    'status' => 'pending',
                    'applied_at' => now(),
                ]);
                $jobPost->increment('applications_count');
            }
        }

        // Feed posts/comments/likes/conversations/messages stay in the main
        // database (not split - see FeedPost/Message notes), authored by the
        // same users whose profiles now live in the basketball database.
        $authors = $academies->pluck('user_id')
            ->merge($agents->pluck('user_id'))
            ->merge($coaches->pluck('user_id'));

        $posts = collect(self::SAMPLE_POSTS)->map(
            fn (string $content) => FeedPost::factory()->create([
                'author_id' => $authors->random(),
                'sport' => 'basketball',
                'content' => $content,
            ])
        );

        $allUserIds = $authors->values();
        $posts->each(function (FeedPost $post) use ($allUserIds) {
            $commenters = $allUserIds->random(min(3, $allUserIds->count()));
            foreach ($commenters as $userId) {
                PostComment::factory()->create(['feed_post_id' => $post->id, 'user_id' => $userId]);
            }
            $post->update(['comments_count' => $commenters->count()]);

            $likers = $allUserIds->random(min(5, $allUserIds->count()));
            foreach ($likers as $userId) {
                PostLike::factory()->create(['feed_post_id' => $post->id, 'user_id' => $userId]);
            }
            $post->update(['likes_count' => $likers->count()]);
        });

        // One genuine live-training-style post, matching the feature already built for the feed.
        $posts->last()?->update([
            'is_training' => true,
            'training_link' => 'https://meet.google.com/demo-basketball-training',
            'training_at' => now()->addDays(3)->setTime(17, 0),
        ]);

        foreach ($agents as $agent) {
            $watched = $players->random(min(4, $players->count()));
            foreach ($watched as $player) {
                BasketballWatchlist::create(['agent_id' => $agent->id, 'player_id' => $player->id]);
            }

            $requestPlayer = $players->random();
            BasketballAccessRequest::create([
                'agent_id' => $agent->id,
                'player_id' => $requestPlayer->id,
                'academy_id' => $requestPlayer->academy_id,
                'status' => 'pending',
                'message' => fake()->paragraph(),
            ]);

            $conversation = Conversation::factory()->create([
                'initiator_id' => $agent->user_id,
                'recipient_id' => $requestPlayer->academy->user_id,
                'subject' => 'Interested in '.$requestPlayer->full_name,
            ]);

            Message::factory()->create([
                'conversation_id' => $conversation->id,
                'sender_id' => $agent->user_id,
                'player_card_id' => $requestPlayer->id,
                'player_sport' => 'basketball',
                'content' => "Hi, I'd like to arrange access to view {$requestPlayer->full_name}'s full profile.",
            ]);
        }

        $this->command->info('Basketball demo data seeded into mysql_basketball: '.$academies->count().' academies, '.$agents->count().' agents, '.($coaches->count() + 1).' coaches, '.$players->count().' players, '.$jobPosts->count().' job posts.');
    }
}
