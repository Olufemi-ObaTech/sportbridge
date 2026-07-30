<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `academy_id` and `posted_by_user_id` are soft references (no DB FK) to
 * the main database's academy_profiles/users tables.
 */
return new class extends Migration
{
    protected $connection = 'mysql_basketball';

    public function up(): void
    {
        Schema::connection($this->connection)->create('job_posts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('academy_id')->nullable()->index();
            $table->unsignedBigInteger('posted_by_user_id')->nullable()->index();
            $table->enum('sport', ['football', 'basketball'])->default('basketball')->index();
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
        Schema::connection($this->connection)->dropIfExists('job_posts');
    }
};
