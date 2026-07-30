<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coach_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('full_name');
            $table->json('badges');
            $table->json('certificates')->nullable();
            $table->string('preferred_role')->index();
            $table->unsignedSmallInteger('experience_years')->default(0);
            $table->string('current_club')->nullable();
            $table->string('nationality')->index();
            $table->string('cv_url')->nullable();
            $table->longText('about')->nullable();
            $table->string('cover_image_url')->nullable();
            $table->string('photo_url')->nullable();
            $table->boolean('open_to_work')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coach_profiles');
    }
};
