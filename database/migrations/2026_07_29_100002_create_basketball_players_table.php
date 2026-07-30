<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `user_id` and `academy_id` have no DB-level FK - both reference tables
 * (users, academy_profiles) live in the shared main database. `team_id`
 * DOES get a real FK since basketball teams live in this same database.
 * No `foot` column at all - that's a football-only concept; basketball
 * players only ever have `dominant_hand`.
 */
return new class extends Migration
{
    protected $connection = 'mysql_basketball';

    public function up(): void
    {
        Schema::connection($this->connection)->create('players', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->foreignId('team_id')->nullable()->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('academy_id')->nullable()->index();
            $table->enum('sport', ['football', 'basketball'])->default('basketball')->index();
            $table->string('full_name');
            $table->string('slug')->unique();
            $table->date('dob')->index();
            $table->string('nationality')->index();
            $table->string('position', 20)->index();
            $table->string('secondary_position', 20)->nullable();
            $table->enum('dominant_hand', ['left', 'right', 'ambidextrous'])->nullable();
            $table->unsignedSmallInteger('height_cm')->nullable();
            $table->unsignedSmallInteger('weight_kg')->nullable();
            $table->unsignedTinyInteger('jersey_number')->nullable();
            $table->text('bio')->nullable();
            $table->string('primary_photo_url')->nullable();
            $table->string('cv_url')->nullable();
            $table->string('current_club')->nullable();
            $table->json('previous_clubs')->nullable();
            $table->text('achievements')->nullable();
            $table->string('linkedin')->nullable();
            $table->string('guardian_name')->nullable();
            $table->timestamp('guardian_consent_at')->nullable();
            $table->boolean('is_public')->default(true)->index();
            $table->unsignedInteger('views_count')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::connection($this->connection)->dropIfExists('players');
    }
};
