<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academy_id')->nullable()->constrained('academy_profiles')->cascadeOnDelete();
            $table->foreignId('posted_by_user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('role_type')->index();
            $table->longText('description');
            $table->text('requirements')->nullable();
            $table->string('location')->index();
            $table->unsignedInteger('salary_min')->nullable();
            $table->unsignedInteger('salary_max')->nullable();
            $table->string('currency', 3)->default('NGN');
            $table->enum('contract_type', ['full_time', 'part_time', 'contract', 'volunteer'])->index();
            $table->date('application_deadline')->index();
            $table->enum('status', ['open', 'filled', 'closed'])->default('open')->index();
            $table->unsignedInteger('applications_count')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_posts');
    }
};
