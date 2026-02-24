<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Order;
use App\Models\Transaction;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'role' => 'admin',
        ]);

        $customer = User::factory()->create([
            'name' => 'Customer User',
            'email' => 'customer@example.com',
            'role' => 'customer',
        ]);

        $business = User::factory()->create([
            'name' => 'Business User',
            'email' => 'business@example.com',
            'role' => 'business',
        ]);

        $carrier = User::factory()->create([
            'name' => 'Carrier User',
            'email' => 'carrier@example.com',
            'role' => 'carrier',
        ]);

        $order = Order::factory()->create([
            'customer_id' => $customer->id,
            'business_id' => $business->id,
            'carrier_id' => $carrier->id,
            'status' => 'delivered',
        ]);

        Transaction::factory()->create([
            'user_id' => $carrier->id,
            'order_id' => $order->id,
            'amount' => $order->delivery_fee,
            'type' => 'earning',
        ]);
    }
}
