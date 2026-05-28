<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if an admin already exists to prevent duplicates on multiple runs
        if (User::where('email', 'admin@snap.com')->exists()) {
            return;
        }

        User::create([
            'name' => 'System Admin',
            'email' => 'admin@snap.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);
    }
}
