<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Enums\OrderStatus;
use App\Enums\UserRole;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('viewAny', Order::class);
        $user = $request->user();
        $query = Order::query()->with(['customer', 'business', 'carrier']);

        if ($user->role === UserRole::Customer->value) {
            $query->where('customer_id', $user->id);
        } elseif ($user->role === UserRole::Business->value) {
            $query->where('business_id', $user->id);
        } elseif ($user->role === UserRole::Carrier->value) {
            $query->whereNull('carrier_id')->orWhere('carrier_id', $user->id);
        }

        return Inertia::render('Orders/Index', [
            'orders' => $query->latest()->get(),
        ]);
    }

    public function store(StoreOrderRequest $request)
    {
        $validated = $request->validated();

        $feeRate = $validated['carrier_type'] === 'bike' ? 100 : 50;
        $validated['delivery_fee'] = $validated['distance'] * $feeRate;

        $order = new Order($validated);

        $order->status = OrderStatus::Pending->value;
        $order->confirmation_code = Str::random(6);

        if ($request->user()->role === UserRole::Customer->value) {
            $order->customer_id = $request->user()->id;
        } elseif ($request->user()->role === UserRole::Business->value) {
            $order->business_id = $request->user()->id;
        }

        $order->save();

        return redirect()->route('orders.index');
    }

    public function show(Order $order)
    {
        Gate::authorize('view', $order);
        return Inertia::render('Orders/Show', [
            'order' => $order->load(['customer', 'business', 'carrier', 'transactions']),
        ]);
    }

    public function update(UpdateOrderRequest $request, Order $order)
    {
        $validated = $request->validated();

        if ($validated['status'] === OrderStatus::Accepted->value && $order->status === OrderStatus::Pending->value) {
            $order->carrier_id = $request->user()->id;
        }

        if ($validated['status'] === OrderStatus::Delivered->value && $order->status !== OrderStatus::Delivered->value) {
            if ($request->input('confirmation_code') !== $order->confirmation_code) {
                return back()->withErrors(['confirmation_code' => 'Invalid confirmation code.']);
            }

            $order->transactions()->create([
                'user_id' => $order->carrier_id,
                'amount' => $order->delivery_fee,
                'type' => \App\Enums\TransactionType::Earning->value,
                'status' => 'completed',
            ]);
        }

        $order->update(['status' => $validated['status']]);

        return back();
    }
}
