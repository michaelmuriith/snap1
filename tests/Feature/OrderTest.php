<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use App\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class OrderTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    public function test_customer_can_create_an_order()
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $response = $this->actingAs($customer)->post(route('orders.store'), [
            'description' => 'Test Item',
            'pickup_address' => '123 Test St',
            'delivery_address' => '456 Delivery Ave',
            'price' => 20.00,
            'distance' => 5,
            'carrier_type' => 'backpack',
        ]);

        $response->assertRedirect(route('orders.index'));
        $this->assertDatabaseHas('orders', [
            'customer_id' => $customer->id,
            'description' => 'Test Item',
            'status' => 'pending',
        ]);
    }

    public function test_business_can_create_an_order()
    {
        $business = User::factory()->create(['role' => 'business']);

        $response = $this->actingAs($business)->post(route('orders.store'), [
            'description' => 'Business Package',
            'pickup_address' => 'Biz Store',
            'delivery_address' => 'Customer House',
            'price' => 50.00,
            'distance' => 10,
            'carrier_type' => 'bike',
        ]);

        $response->assertRedirect(route('orders.index'));
        $this->assertDatabaseHas('orders', [
            'business_id' => $business->id,
            'description' => 'Business Package',
            'status' => 'pending',
        ]);
    }

    public function test_carrier_cannot_create_an_order()
    {
        $carrier = User::factory()->create(['role' => 'carrier']);

        $response = $this->actingAs($carrier)->post(route('orders.store'), [
            'description' => 'Carrier Test',
            'pickup_address' => 'No',
            'delivery_address' => 'No',
            'price' => 10,
            'distance' => 10,
            'carrier_type' => 'bike',
        ]);

        $response->assertForbidden();
    }

    public function test_carrier_can_accept_an_order()
    {
        $order = Order::factory()->create(['status' => 'pending']);
        $carrier = User::factory()->create(['role' => 'carrier']);

        $response = $this->actingAs($carrier)->put(route('orders.update', $order), [
            'status' => 'accepted',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'carrier_id' => $carrier->id,
            'status' => 'accepted',
        ]);
    }

    public function test_carrier_can_update_status_to_picked_up()
    {
        $carrier = User::factory()->create(['role' => 'carrier']);
        $order = Order::factory()->create([
            'status' => 'accepted',
            'carrier_id' => $carrier->id,
        ]);

        $response = $this->actingAs($carrier)->put(route('orders.update', $order), [
            'status' => 'picked_up',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'picked_up',
        ]);
    }

    public function test_carrier_can_deliver_order_with_valid_code()
    {
        $carrier = User::factory()->create(['role' => 'carrier']);
        $order = Order::factory()->create([
            'status' => 'in_transit',
            'carrier_id' => $carrier->id,
            'confirmation_code' => '1234',
            'delivery_fee' => 5.50,
        ]);

        $response = $this->actingAs($carrier)->put(route('orders.update', $order), [
            'status' => 'delivered',
            'confirmation_code' => '1234',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'delivered',
        ]);

        $this->assertDatabaseHas('transactions', [
            'user_id' => $carrier->id,
            'amount' => 5.50,
            'type' => 'earning',
        ]);
    }

    public function test_carrier_cannot_deliver_order_with_invalid_code()
    {
        $carrier = User::factory()->create(['role' => 'carrier']);
        $order = Order::factory()->create([
            'status' => 'in_transit',
            'carrier_id' => $carrier->id,
            'confirmation_code' => '1234',
        ]);

        $response = $this->actingAs($carrier)->put(route('orders.update', $order), [
            'status' => 'delivered',
            'confirmation_code' => '0000', // Invalid code
        ]);

        $response->assertSessionHasErrors(['confirmation_code']);
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'in_transit',
        ]);
    }
}
