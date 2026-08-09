<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Runs on the default connection - a try-out belongs to a User (poster),
     * which always lives on the main database. Unlike JobPost/Player, this
     * has no need to live in two physical databases per sport: nothing here
     * needs a real foreign key into a split-by-sport table (interest is
     * tracked by user_id, not player_id - see try_out_interests), so `sport`
     * is just a plain filterable column, same pattern as Trial.
     */
    public function up(): void
    {
        Schema::create('try_outs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('posted_by_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('sport');
            $table->string('gender');
            $table->string('title');
            $table->text('description');
            $table->string('location')->nullable();
            $table->date('scheduled_date')->nullable();
            $table->string('age_group')->nullable();
            $table->string('status')->default('open');
            $table->timestamps();

            $table->index(['sport', 'gender', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('try_outs');
    }
};
