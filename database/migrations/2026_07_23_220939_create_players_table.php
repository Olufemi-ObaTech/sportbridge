<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('players', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('team_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('academy_id')->nullable()->constrained('academy_profiles')->cascadeOnDelete();
            $table->string('full_name');
            $table->string('slug')->unique();
            $table->date('dob')->index();
            $table->string('nationality')->index();
            $table->enum('position', ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'])->index();
            $table->enum('secondary_position', ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'])->nullable();
            $table->enum('foot', ['left', 'right', 'both'])->index();
            $table->unsignedSmallInteger('height_cm')->nullable();
            $table->unsignedSmallInteger('weight_kg')->nullable();
            $table->unsignedTinyInteger('jersey_number')->nullable();
            $table->text('bio')->nullable();
            $table->string('primary_photo_url')->nullable();
            $table->string('cv_url')->nullable();
            $table->string('current_club')->nullable();
            $table->json('previous_clubs')->nullable();
            $table->text('achievements')->nullable();
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
        Schema::dropIfExists('players');
    }
};
