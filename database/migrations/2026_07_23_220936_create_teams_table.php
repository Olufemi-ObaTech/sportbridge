<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academy_id')->constrained('academy_profiles')->cascadeOnDelete();
            $table->string('name');
            $table->string('season');
            $table->enum('age_group', ['U-13', 'U-15', 'U-17', 'U-20', 'Senior', 'Women'])->index();
            $table->string('coach_name')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teams');
    }
};
