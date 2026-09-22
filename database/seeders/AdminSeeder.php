<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $admin = config('app.admin');
        $email = $admin['email'];

        User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $admin['name'],
                'username' => 'admin-'.Str::random(6),
                'password' => $admin['password'],
                'role' => User::ROLE_SUPER_ADMIN,
                'status' => User::STATUS_ACTIVE,
                'email_verified_at' => now(),
            ]
        );

        $this->command->info("Super admin ready: {$email}");
    }
}
