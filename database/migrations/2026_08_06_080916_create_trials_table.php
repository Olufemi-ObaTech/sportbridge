<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Runs on the default connection - trials belong to a User (organizer),
     * which always lives on the main database. `player_id` is intentionally
     * NOT a foreign key: football and basketball players live in two
     * physically separate databases with independent id sequences, so
     * `sport` disambiguates which table/connection it refers to (same
     * pattern as AgentRating.agent_profile_id).
     */
    public function up(): void
    {
        Schema::create('trials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organizer_user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedBigInteger('player_id');
            $table->string('sport');
            $table->dateTime('scheduled_at');
            $table->string('location')->nullable();
            $table->text('notes')->nullable();
            $table->string('status')->default('pending');
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();

            $table->index(['player_id', 'sport']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trials');
    }
};
