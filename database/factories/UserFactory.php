<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        $name = fake()->name();

        return [
            'name' => $name,
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'role' => User::ROLE_ACADEMY,
            'status' => User::STATUS_ACTIVE,
            'username' => Str::slug($name).'-'.fake()->unique()->numberBetween(1000, 9999),
            'remember_token' => Str::random(10),
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    public function academy(): static
    {
        return $this->state(fn (array $attributes) => ['role' => User::ROLE_ACADEMY]);
    }

    public function agent(): static
    {
        return $this->state(fn (array $attributes) => ['role' => User::ROLE_AGENT]);
    }

    public function coach(): static
    {
        return $this->state(fn (array $attributes) => ['role' => User::ROLE_COACH]);
    }

    public function superAdmin(): static
    {
        return $this->state(fn (array $attributes) => ['role' => User::ROLE_SUPER_ADMIN]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => ['status' => User::STATUS_PENDING]);
    }

    public function suspended(): static
    {
        return $this->state(fn (array $attributes) => ['status' => User::STATUS_SUSPENDED]);
    }
}
