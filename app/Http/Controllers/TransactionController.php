<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Enums\TransactionType;
use App\Enums\UserRole;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Transaction::query()->with('order');

        if ($user->role !== UserRole::Admin->value) {
            $query->where('user_id', $user->id);
        }

        $earnings = $user->transactions()->where('type', TransactionType::Earning->value)->sum('amount');
        $withdrawals = $user->transactions()->where('type', TransactionType::Withdrawal->value)->sum('amount');
        $balance = $earnings - $withdrawals;

        return Inertia::render('Transactions/Index', [
            'transactions' => $query->latest()->get(),
            'balance' => $balance,
        ]);
    }

    public function withdraw(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
        ]);

        $user = $request->user();

        $earnings = $user->transactions()->where('type', TransactionType::Earning->value)->sum('amount');
        $withdrawals = $user->transactions()->where('type', TransactionType::Withdrawal->value)->sum('amount');
        $balance = $earnings - $withdrawals;

        if ($request->input('amount') > $balance) {
            return back()->withErrors(['amount' => 'Insufficient funds.']);
        }

        $user->transactions()->create([
            'amount' => $request->input('amount'),
            'type' => TransactionType::Withdrawal->value,
            'status' => 'pending',
        ]);

        return back();
    }
}
