<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'mysql_basketball';

    public function up(): void
    {
        Schema::connection($this->connection)->create('agent_profiles', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->unique();
            $table->string('agency_name');
            $table->enum('sport', ['football', 'basketball'])->default('basketball')->index();
            $table->string('license_number');
            $table->string('nationality')->index();
            $table->unsignedSmallInteger('experience_years')->default(0);
            $table->json('regions');
            $table->string('id_doc_url')->nullable();
            $table->longText('about')->nullable();
            $table->string('cover_image_url')->nullable();
            $table->string('photo_url')->nullable();
            $table->string('verification_body')->nullable();
            $table->boolean('verified_badge')->default(false);
            $table->string('linkedin')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::connection($this->connection)->dropIfExists('agent_profiles');
    }
};
