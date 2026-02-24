<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered()
    {
        $response = $this->get(route('register'));

        $response->assertOk();
    }

    public function test_new_users_can_register_as_customer()
    {
        $response = $this->post(route('register.store'), [
            'name' => 'Test Customer',
            'email' => 'customer@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'customer',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
        $this->assertDatabaseHas('users', ['email' => 'customer@example.com', 'role' => 'customer']);
    }

    public function test_new_users_can_register_as_business()
    {
        $response = $this->post(route('register.store'), [
            'name' => 'Test Business',
            'email' => 'business@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'business',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
        $this->assertDatabaseHas('users', ['email' => 'business@example.com', 'role' => 'business']);
    }

    public function test_new_users_can_register_as_carrier_with_backpack()
    {
        $response = $this->post(route('register.store'), [
            'name' => 'Test Carrier Backpack',
            'email' => 'carrier.bp@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'carrier',
            'vehicle_type' => 'backpack',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
        $this->assertDatabaseHas('users', [
            'email' => 'carrier.bp@example.com',
            'role' => 'carrier',
            'vehicle_type' => 'backpack',
        ]);
    }

    public function test_new_users_can_register_as_carrier_with_bike()
    {
        \Illuminate\Support\Facades\Storage::fake('public');

        $response = $this->post(route('register.store'), [
            'name' => 'Test Carrier Bike',
            'email' => 'carrier.bike@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'carrier',
            'vehicle_type' => 'bike',
            'bike_reg_number' => 'ABC-1234',
            'id_number' => 'ID-987654321',
            'photo' => \Illuminate\Http\UploadedFile::fake()->image('photo.jpg'),
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
        $this->assertDatabaseHas('users', [
            'email' => 'carrier.bike@example.com',
            'role' => 'carrier',
            'vehicle_type' => 'bike',
            'bike_reg_number' => 'ABC-1234',
            'id_number' => 'ID-987654321',
        ]);
    }
}
