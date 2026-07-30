<?php

namespace Database\Seeders;

use App\Models\AcademyProfile;
use App\Models\AccessRequest;
use App\Models\AgentProfile;
use App\Models\CoachProfile;
use App\Models\Conversation;
use App\Models\FeedPost;
use App\Models\JobApplication;
use App\Models\JobPost;
use App\Models\MediaAsset;
use App\Models\Message;
use App\Models\Player;
use App\Models\PostComment;
use App\Models\PostLike;
use App\Models\Team;
use App\Models\User;
use App\Models\Watchlist;
use Illuminate\Database\Seeder;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $academies = AcademyProfile::factory()
            ->count(3)
            ->verified()
            ->create()
            ->each(function (AcademyProfile $academy) {
                $academy->user()->update(['status' => User::STATUS_ACTIVE, 'email_verified_at' => now()]);
            });

        $agents = AgentProfile::factory()
            ->count(5)
            ->create()
            ->each(function (AgentProfile $agent) {
                $agent->user()->update(['status' => User::STATUS_ACTIVE, 'email_verified_at' => now()]);
            });

        $coaches = CoachProfile::factory()
            ->count(8)
            ->create()
            ->each(function (CoachProfile $coach) {
                $coach->user()->update(['status' => User::STATUS_ACTIVE, 'email_verified_at' => now()]);
            });

        // A handful of pending / suspended accounts so the admin moderation queue isn't empty.
        AcademyProfile::factory()->create()->user()->update(['status' => User::STATUS_PENDING, 'email_verified_at' => now()]);
        AgentProfile::factory()->create()->user()->update(['status' => User::STATUS_PENDING, 'email_verified_at' => now()]);
        CoachProfile::factory()->create()->user()->update(['status' => User::STATUS_PENDING, 'email_verified_at' => now()]);
        CoachProfile::factory()->create()->user()->update(['status' => User::STATUS_SUSPENDED, 'email_verified_at' => now()]);

        $teams = collect();
        foreach ($academies as $academy) {
            $teams = $teams->merge(
                Team::factory()->count(rand(2, 3))->create(['academy_id' => $academy->id])
            );
        }

        $players = collect();
        foreach ($teams as $team) {
            $count = (int) ceil(40 / $teams->count());
            $players = $players->merge(
                Player::factory()->count($count)->create([
                    'team_id' => $team->id,
                    'academy_id' => $team->academy_id,
                ])
            );
        }
        $players = $players->take(40);

        // Featured media for roughly a third of the roster.
        $players->random((int) ceil($players->count() / 3))->each(function (Player $player) {
            MediaAsset::factory()->featured()->create(['player_id' => $player->id, 'type' => 'image']);
            MediaAsset::factory()->create(['player_id' => $player->id, 'type' => 'youtube']);
        });

        $jobPosts = collect();
        foreach ($academies as $academy) {
            $jobPosts = $jobPosts->merge(
                JobPost::factory()->count(4)->create(['academy_id' => $academy->id])
            );
        }
        $jobPosts = $jobPosts->take(10);

        foreach ($jobPosts->take(6) as $jobPost) {
            $applicants = $coaches->random(min(2, $coaches->count()));
            foreach ($applicants as $coach) {
                JobApplication::factory()->create([
                    'job_post_id' => $jobPost->id,
                    'coach_profile_id' => $coach->id,
                ]);
                $jobPost->increment('applications_count');
            }
        }

        // Feed posts authored by academies, agents, and coaches, with likes/comments.
        $authors = $academies->pluck('user_id')
            ->merge($agents->pluck('user_id'))
            ->merge($coaches->pluck('user_id'));

        $posts = collect(range(1, 15))->map(
            fn () => FeedPost::factory()->create(['author_id' => $authors->random()])
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
        $posts->first()?->update(['is_pinned' => true]);

        // Watchlists + access requests linking agents to players.
        foreach ($agents as $agent) {
            $watched = $players->random(min(4, $players->count()));
            foreach ($watched as $player) {
                Watchlist::factory()->create(['agent_id' => $agent->id, 'player_id' => $player->id]);
            }

            $requestPlayer = $players->random();
            AccessRequest::factory()->create([
                'agent_id' => $agent->id,
                'player_id' => $requestPlayer->id,
                'academy_id' => $requestPlayer->academy_id,
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
                'content' => "Hi, I'd like to arrange access to view {$requestPlayer->full_name}'s full profile.",
            ]);
        }

        $this->command->info('Demo data seeded: '.$academies->count().' academies, '.$agents->count().' agents, '.$coaches->count().' coaches, '.$players->count().' players, '.$jobPosts->count().' job posts.');
    }
}
