<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'mysql_basketball';

    public function up(): void
    {
        Schema::connection($this->connection)->create('job_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_post_id')->constrained()->cascadeOnDelete();
            $table->foreignId('coach_profile_id')->constrained()->cascadeOnDelete();
            $table->text('cover_letter');
            $table->string('cv_url')->nullable();
            $table->enum('status', ['pending', 'shortlisted', 'rejected', 'hired'])->default('pending')->index();
            $table->timestamp('applied_at');
            $table->timestamps();
            $table->unique(['job_post_id', 'coach_profile_id']);
        });
    }

    public function down(): void
    {
        Schema::connection($this->connection)->dropIfExists('job_applications');
    }
};
