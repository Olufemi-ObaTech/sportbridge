<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * A structured, informational record of a proposed referral - not a
     * payment or commission-processing feature. SportBridge has no payment
     * gateway yet, so this only documents the arrangement between parties.
     */
    public function up(): void
    {
        Schema::create('agent_recommendations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('recommender_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('agent_profile_id')->constrained('agent_profiles')->cascadeOnDelete();
            $table->foreignId('player_id')->nullable()->constrained('players')->nullOnDelete();
            // Free-text fallback when the person being recommended to isn't a platform user.
            $table->string('recommended_to_name')->nullable();
            $table->decimal('proposed_percentage', 5, 2);
            $table->text('note')->nullable();
            $table->enum('status', ['pending', 'acknowledged', 'declined'])->default('pending')->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_recommendations');
    }
};
