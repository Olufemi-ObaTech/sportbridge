<?php

namespace Tests\Feature;

use App\Models\FeedPost;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class FeedPostTest extends TestCase
{
    use RefreshDatabase;

    protected function activeUser(): User
    {
        return User::factory()->create(['role' => User::ROLE_PLAYER, 'status' => User::STATUS_ACTIVE]);
    }

    public function test_user_can_post_an_image_to_the_feed(): void
    {
        Storage::fake('public');
        $user = $this->activeUser();

        $this->actingAs($user)->post(route('feed.store'), [
            'content' => 'Check out this photo',
            'media' => [UploadedFile::fake()->image('photo.jpg', 800, 600)],
        ])->assertRedirect();

        $post = FeedPost::latest()->firstOrFail();
        $this->assertSame('Check out this photo', $post->content);
        $this->assertCount(1, $post->media_urls);
        $this->assertSame('image', $post->media_urls[0]['type']);
        Storage::disk('public')->assertExists($post->media_urls[0]['url']);
    }

    public function test_user_can_post_a_video_to_the_feed(): void
    {
        Storage::fake('public');
        $user = $this->activeUser();

        $this->actingAs($user)->post(route('feed.store'), [
            'content' => 'Check out this clip',
            'media' => [UploadedFile::fake()->create('clip.mp4', 5000, 'video/mp4')],
        ])->assertRedirect();

        $post = FeedPost::latest()->firstOrFail();
        $this->assertCount(1, $post->media_urls);
        $this->assertSame('video', $post->media_urls[0]['type']);
        Storage::disk('public')->assertExists($post->media_urls[0]['url']);
    }

    public function test_user_can_host_a_live_training_session(): void
    {
        $user = $this->activeUser();

        $this->actingAs($user)->post(route('feed.store'), [
            'content' => 'Join my training session',
            'is_training' => '1',
            'training_link' => 'https://meet.google.com/abc-defg-hij',
            'training_at' => now()->addHours(2)->format('Y-m-d\TH:i'),
        ])->assertRedirect();

        $post = FeedPost::latest()->firstOrFail();
        $this->assertTrue($post->is_training);
        $this->assertSame('https://meet.google.com/abc-defg-hij', $post->training_link);
        $this->assertNotNull($post->training_at);
        $this->assertFalse($post->is_live);
    }

    public function test_training_link_is_required_when_is_training_is_checked(): void
    {
        $user = $this->activeUser();

        $this->actingAs($user)->post(route('feed.store'), [
            'content' => 'Join my training session',
            'is_training' => '1',
        ])->assertSessionHasErrors('training_link');

        $this->assertSame(0, FeedPost::count());
    }

    public function test_user_can_post_a_live_video(): void
    {
        $user = $this->activeUser();

        $this->actingAs($user)->post(route('feed.store'), [
            'content' => 'Going live right now',
            'is_live' => '1',
            'live_link' => 'https://youtube.com/live/xyz',
        ])->assertRedirect();

        $post = FeedPost::latest()->firstOrFail();
        $this->assertTrue($post->is_live);
        $this->assertSame('https://youtube.com/live/xyz', $post->live_link);
        $this->assertFalse($post->is_training);
    }

    public function test_live_link_is_required_when_is_live_is_checked(): void
    {
        $user = $this->activeUser();

        $this->actingAs($user)->post(route('feed.store'), [
            'content' => 'Going live right now',
            'is_live' => '1',
        ])->assertSessionHasErrors('live_link');

        $this->assertSame(0, FeedPost::count());
    }

    public function test_feed_post_can_include_multiple_media_files(): void
    {
        Storage::fake('public');
        $user = $this->activeUser();

        $this->actingAs($user)->post(route('feed.store'), [
            'content' => 'Photo dump',
            'media' => [
                UploadedFile::fake()->image('one.jpg'),
                UploadedFile::fake()->image('two.jpg'),
                UploadedFile::fake()->create('clip.mp4', 3000, 'video/mp4'),
            ],
        ])->assertRedirect();

        $post = FeedPost::latest()->firstOrFail();
        $this->assertCount(3, $post->media_urls);
    }

    public function test_guest_cannot_post_to_the_feed(): void
    {
        $this->post(route('feed.store'), ['content' => 'Should not work'])
            ->assertRedirect(route('login'));

        $this->assertSame(0, FeedPost::count());
    }
}
