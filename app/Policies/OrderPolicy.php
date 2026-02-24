<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;
use App\Enums\UserRole;
use Illuminate\Auth\Access\Response;

class OrderPolicy
{
    public function before(User $user, string $ability): bool|null
    {
        if ($user->role === UserRole::Admin->value) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Order $order): bool
    {
        return $user->id === $order->customer_id ||
            $user->id === $order->business_id ||
            $user->id === $order->carrier_id;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, [UserRole::Customer->value, UserRole::Business->value]);
    }

    public function update(User $user, Order $order): bool
    {
        if ($user->role === UserRole::Carrier->value) {
            return $order->carrier_id === null || $order->carrier_id === $user->id;
        }

        return false;
    }

    public function delete(User $user, Order $order): bool
    {
        return false;
    }

    public function restore(User $user, Order $order): bool
    {
        return false;
    }

    public function forceDelete(User $user, Order $order): bool
    {
        return false;
    }
}
