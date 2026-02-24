<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function (Illuminate\Http\Request $request) {
        $user = $request->user();
        $stats = [];

        if ($user->role === 'customer') {
            $stats['active_orders'] = \App\Models\Order::where('customer_id', $user->id)
                ->whereIn('status', ['pending', 'accepted', 'picked_up', 'in_transit'])
                ->count();
            $stats['order_history'] = \App\Models\Order::where('customer_id', $user->id)
                ->where('status', 'delivered')
                ->count();
        }

        if ($user->role === 'business') {
            $stats['pending_shipments'] = \App\Models\Order::where('business_id', $user->id)
                ->where('status', 'pending')
                ->count();
            $stats['active_deliveries'] = \App\Models\Order::where('business_id', $user->id)
                ->whereIn('status', ['accepted', 'picked_up', 'in_transit'])
                ->count();
        }

        if ($user->role === 'carrier') {
            $stats['available_jobs'] = \App\Models\Order::whereNull('carrier_id')
                ->where('status', 'pending')
                ->count();
            $stats['current_route'] = \App\Models\Order::where('carrier_id', $user->id)
                ->whereIn('status', ['accepted', 'picked_up', 'in_transit'])
                ->count();
            $stats['todays_earnings'] = \App\Models\Transaction::where('user_id', $user->id)
                ->where('type', 'earning')
                ->whereDate('created_at', \Carbon\Carbon::today())
                ->sum('amount');
        }

        if ($user->role === 'admin') {
            $stats['total_orders'] = \App\Models\Order::count();
            $stats['active_carriers'] = \App\Models\User::where('role', 'carrier')->count();
            $stats['conflicts'] = \App\Models\Order::where('status', 'conflict')->count();
        }

        return Inertia::render('dashboard', [
            'stats' => $stats
        ]);
    })->name('dashboard');

    Route::resource('orders', \App\Http\Controllers\OrderController::class)->only(['index', 'store', 'show', 'update']);

    Route::get('transactions', [\App\Http\Controllers\TransactionController::class, 'index'])->name('transactions.index');
    Route::post('transactions/withdraw', [\App\Http\Controllers\TransactionController::class, 'withdraw'])->name('transactions.withdraw');
});

require __DIR__ . '/settings.php';
