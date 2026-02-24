<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'customer_id' => User::factory(),
            'business_id' => null,
            'carrier_id' => null,
            'description' => $this->faker->sentence(),
            'pickup_address' => $this->faker->address(),
            'delivery_address' => $this->faker->address(),
            'distance' => $this->faker->randomFloat(2, 1, 25),
            'carrier_type' => $this->faker->randomElement(['bike', 'backpack']),
            'price' => $this->faker->randomFloat(2, 10, 100),
            'delivery_fee' => $this->faker->randomFloat(2, 50, 2500),
            'status' => 'pending',
            'confirmation_code' => \Illuminate\Support\Str::random(6),
        ];
    }
}
