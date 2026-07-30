<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `academy_id` has no DB FK - academy_profiles stays in the shared main
 * database (a club can run both sports from one profile row).
 */
return new class extends Migration
{
    protected $connection = 'mysql_basketball';

    public function up(): void
    {
        Schema::connection($this->connection)->create('access_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->constrained('agent_profiles')->cascadeOnDelete();
            $table->foreignId('player_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('academy_id')->index();
            $table->enum('status', ['pending', 'granted', 'denied'])->default('pending')->index();
            $table->text('message');
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection($this->connection)->dropIfExists('access_requests');
    }
};
