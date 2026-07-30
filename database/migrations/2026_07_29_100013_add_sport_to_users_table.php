<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Player/Agent/Coach profiles now live in one of two physical databases
 * depending on which sport they registered under (see config/database.php's
 * "mysql_basketball" connection). Before this, `hasOne(Player::class)` etc.
 * always pointed at one hardcoded table regardless of sport, so it worked
 * without this column - now User needs to know which database to look in.
 * Null for Academy (multi-sport, stays central) and Super Admin.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('sport', ['football', 'basketball'])->nullable()->index()->after('role');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('sport');
        });
    }
};
