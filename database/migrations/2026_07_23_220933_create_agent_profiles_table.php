<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agent_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('agency_name');
            $table->string('fifa_license');
            $table->string('nationality')->index();
            $table->unsignedSmallInteger('experience_years')->default(0);
            $table->json('regions');
            $table->string('id_doc_url')->nullable();
            $table->longText('about')->nullable();
            $table->string('cover_image_url')->nullable();
            $table->string('photo_url')->nullable();
            $table->string('verification_body')->nullable();
            $table->boolean('verified_badge')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_profiles');
    }
};
