<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DefaultUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@unick.local'],
            ['name' => 'Admin', 'password' => Hash::make('password'), 'role' => 'admin']
        );

        User::updateOrCreate(
            ['email' => 'staff@unick.local'],
            ['name' => 'Staff', 'password' => Hash::make('password'), 'role' => 'staff']
        );

        User::updateOrCreate(
            ['email' => 'customer@unick.local'],
            ['name' => 'Customer', 'password' => Hash::make('password'), 'role' => 'customer']
        );
    }
}
