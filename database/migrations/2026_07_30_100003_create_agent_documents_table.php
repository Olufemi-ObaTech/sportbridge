<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Lives centrally (like agent_ratings/agent_recommendations) rather than
        // split per-sport-database - agent_profile_id is disambiguated by the
        // `sport` column since football/basketball agent_profiles have
        // independent id sequences across two physical databases.
        Schema::create('agent_documents', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('agent_profile_id')->index();
            $table->enum('sport', ['football', 'basketball'])->index();
            $table->string('title');
            $table->string('file_url');
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_documents');
    }
};
