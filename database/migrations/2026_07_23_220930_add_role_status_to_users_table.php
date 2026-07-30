<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['super_admin', 'academy', 'agent', 'coach', 'player'])->after('email')->index();
            $table->enum('status', ['pending', 'active', 'suspended', 'denied'])->default('pending')->after('role')->index();
            $table->string('username')->unique()->after('status');
            $table->string('profile_photo_path')->nullable()->after('username');
            $table->timestamp('last_seen_at')->nullable()->after('profile_photo_path');
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'status', 'username', 'profile_photo_path', 'last_seen_at', 'deleted_at']);
        });
    }
};
