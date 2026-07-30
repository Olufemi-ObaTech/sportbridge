<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Basketball's counterpart to football_user_records - see that migration's
 * docblock. Deliberately a separate table (not one table with a `sport`
 * column) so the Super Admin's export genuinely produces two distinct
 * football/basketball record sets, matching the rest of the platform's
 * dual-sport separation.
 */
return new class extends Migration
{
    protected $connection = 'mysql_admin';

    public function up(): void
    {
        Schema::connection($this->connection)->create('basketball_user_records', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('source_user_id')->unique();
            $table->string('name');
            $table->string('email');
            $table->string('role');
            $table->string('status');
            $table->string('club_or_agency_name')->nullable();
            $table->timestamp('source_created_at')->nullable();
            $table->timestamp('synced_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::connection($this->connection)->dropIfExists('basketball_user_records');
    }
};
