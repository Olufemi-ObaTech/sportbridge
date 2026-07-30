<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('feed_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
            $table->text('content');
            $table->json('media_urls')->nullable();
            $table->boolean('is_pinned')->default(false)->index();
            $table->boolean('is_training')->default(false)->index();
            $table->string('training_link')->nullable();
            $table->timestamp('training_at')->nullable();
            $table->enum('visibility', ['public', 'connections'])->default('public')->index();
            $table->unsignedInteger('likes_count')->default(0);
            $table->unsignedInteger('comments_count')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feed_posts');
    }
};
