<?php

namespace Database\Factories;

use App\Models\FeedPost;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FeedPost>
 */
class FeedPostFactory extends Factory
{
    private const SAMPLE_POSTS = [
        "Delighted to announce that three of our U18 graduates have signed their first professional contracts this week. Proud of the hard work they've put in over the past two seasons.",
        'Scouting report: watched a very promising left-back this weekend — excellent recovery pace, reads the game well, and already comfortable playing out from the back at just 17 years old.',
        "Great turnout at today's open trial. Over 60 players came through, and our coaching staff will be following up with a shortlist by the end of the week.",
        "Reminder: pre-season training resumes Monday at 8am. Please bring both home and away kits — we'll be doing fitness testing followed by a small-sided match.",
        "Just wrapped up contract renewal talks with one of our academy's most consistent performers. Excited to see her continue developing with us next season.",
        'Our regional scouting network keeps turning up hidden gems. This week we identified two centre-backs and a winger worth a closer look ahead of trials.',
        'Congratulations to our academy squad on a clean sweep this tournament — three wins from three, and the best defensive record in the group.',
        'Looking for talented young goalkeepers aged 15-17 for an upcoming trial camp. Get in touch if you or someone you coach might be a good fit.',
        "A brilliant week of training sessions focused on transition play. The improvement in our players' decision-making under pressure has been noticeable.",
        'Proud to partner with a local secondary school to give more students access to structured football coaching twice a week.',
        'Player development update: our sports science team has rolled out individualised recovery plans for every player in the first team squad.',
        'Had a fantastic conversation with a club director today about pathways for players moving from academy football into senior professional squads.',
        'Our coaching badges workshop this weekend drew coaches from across the region — always great to share ideas and raise standards together.',
        'Watched an U16 fixture yesterday that had everything: composure on the ball, quick transitions, and a last-minute winner. Football at its best.',
        'New training ground upgrades are complete, including a redesigned strength and conditioning area for our academy players.',
        'Excited to confirm our squad for the upcoming international youth tournament. Six players will be representing the academy on the biggest stage of their careers so far.',
        "Agent's note: always advise young players to focus on their education alongside football — a well-rounded athlete makes better decisions on and off the pitch.",
        'Fantastic session today working on set-piece routines. Small margins make a big difference at this level, and the players are buying into the detail.',
        "We're expanding our scouting coverage to three new regions this season. If you know a standout young player, we'd love to hear about them.",
        'End of season review: incredible progress from our development squad, with five players stepping up to train with the first team.',
    ];

    public function definition(): array
    {
        return [
            'author_id' => User::factory(),
            'content' => fake()->randomElement(self::SAMPLE_POSTS),
            'media_urls' => null,
            'is_pinned' => false,
            'visibility' => 'public',
            'likes_count' => 0,
            'comments_count' => 0,
        ];
    }
}
