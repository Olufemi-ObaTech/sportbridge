<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Lives in the "mysql_admin" physical database - see config/database.php.
 * Read-only reporting snapshot, rebuilt on demand by
 * App\Console\Commands\SyncAdminUserRecords, not written to by the app
 * directly. No foreign keys back to the main database - it's a different
 * physical database, so a DB-level FK isn't possible (same reasoning as the
 * basketball tables' academy_id references).
 */
return new class extends Migration
{
    protected $connection = 'mysql_admin';

    public function up(): void
    {
        Schema::connection($this->connection)->create('football_user_records', function (Blueprint $table) {
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
        Schema::connection($this->connection)->dropIfExists('football_user_records');
    }
};
