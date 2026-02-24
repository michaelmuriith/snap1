<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Transaction;
use App\Enums\TransactionType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class TransactionTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    public function test_carrier_can_view_transactions_and_balance()
    {
        $carrier = User::factory()->create(['role' => 'carrier']);

        Transaction::factory()->create([
            'user_id' => $carrier->id,
            'amount' => 100,
            'type' => TransactionType::Earning->value,
        ]);

        Transaction::factory()->create([
            'user_id' => $carrier->id,
            'amount' => 20,
            'type' => TransactionType::Withdrawal->value,
        ]);

        $response = $this->actingAs($carrier)->get(route('transactions.index'));

        $response->assertOk();
        // Since it's Inertia, we assert view
        $response->assertInertia(
            fn($page) => $page
                ->component('Transactions/Index')
                ->has('balance')
                ->where('balance', 80)
        );
    }

    public function test_carrier_can_request_withdrawal()
    {
        $carrier = User::factory()->create(['role' => 'carrier']);

        Transaction::factory()->create([
            'user_id' => $carrier->id,
            'amount' => 50,
            'type' => TransactionType::Earning->value,
        ]);

        $response = $this->actingAs($carrier)->post(route('transactions.withdraw'), [
            'amount' => 25,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('transactions', [
            'user_id' => $carrier->id,
            'amount' => 25,
            'type' => TransactionType::Withdrawal->value,
            'status' => 'pending',
        ]);
    }

    public function test_carrier_cannot_withdraw_more_than_balance()
    {
        $carrier = User::factory()->create(['role' => 'carrier']);

        Transaction::factory()->create([
            'user_id' => $carrier->id,
            'amount' => 50,
            'type' => TransactionType::Earning->value,
        ]);

        $response = $this->actingAs($carrier)->post(route('transactions.withdraw'), [
            'amount' => 100, // exceeds 50 balance
        ]);

        $response->assertSessionHasErrors(['amount']);
        $this->assertDatabaseMissing('transactions', [
            'user_id' => $carrier->id,
            'type' => TransactionType::Withdrawal->value,
        ]);
    }
}
