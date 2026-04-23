<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Court;
use App\Models\User;
use App\Models\Venue;
use Illuminate\Support\Facades\Hash;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user dengan password yang di-hash
        User::create([
     
            'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        // Create owner user
        User::create([
            'name' => 'Owner User',
            'email' => 'owner@example.com',
            'password' => Hash::make('password'),
            'role' => 'owner',
            'email_verified_at' => now(),
        ]);

        // Create test customer
        User::create([
            'name' => 'Test Customer',
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'role' => 'customer',
            'email_verified_at' => now(),
        ]);

        // Create additional customers
        User::factory(10)->create([
            'role' => 'customer',
        ]);

        // Create venues with courts
        Venue::factory(3)
            ->has(Court::factory(3), 'courts')
            ->create();

        // Create some bookings
        Booking::factory(15)->create();
    }
}

