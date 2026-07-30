<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Basketball lives in its own physical database (see config/database.php's
 * "mysql_basketball" connection). `academy_id` has no DB-level foreign key
 * here because academy_profiles stays in the shared main database - it's a
 * soft, app-enforced reference (see App\Models\Basketball\BasketballTeam).
 */
return new class extends Migration
{
    protected $connection = 'mysql_basketball';

    public function up(): void
    {
        Schema::connection($this->connection)->create('teams', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('academy_id')->index();
            $table->enum('sport', ['football', 'basketball'])->default('basketball')->index();
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
        Schema::connection($this->connection)->dropIfExists('teams');
    }
};
