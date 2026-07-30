<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('academy_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('club_name');
            $table->string('slug')->unique();
            $table->string('license_number');
            $table->string('license_doc_url')->nullable();
            $table->string('country')->index();
            $table->string('state')->nullable();
            $table->string('address')->nullable();
            $table->string('phone')->nullable();
            $table->unsignedSmallInteger('year_founded')->nullable();
            $table->string('logo_url')->nullable();
            $table->string('cover_image_url')->nullable();
            $table->longText('about')->nullable();
            $table->boolean('verified_badge')->default(false);
            $table->json('leagues')->nullable();
            $table->json('languages')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('academy_profiles');
    }
};
