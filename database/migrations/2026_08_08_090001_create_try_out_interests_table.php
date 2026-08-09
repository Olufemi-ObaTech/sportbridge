<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Runs on the default connection alongside try_outs - both the try-out
     * and the interested user are real foreign keys here since users always
     * live on the main database regardless of sport (see User's
     * getConnectionName() override), so no player_id/sport split is needed.
     */
    public function up(): void
    {
        Schema::create('try_out_interests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('try_out_id')->constrained('try_outs')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('message')->nullable();
            $table->timestamps();

            $table->unique(['try_out_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('try_out_interests');
    }
};
