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
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        // Create owner user
        $owner = User::create([
            'name'                 => 'Owner User',
            'email'                => 'owner@example.com',
            'password'             => Hash::make('password'),
            'role'                 => 'owner',
            'email_verified_at'    => now(),
            'commission_rate'      => 10.00,        // 10% komisi ke admin
            'subscription_status'  => 'active',
            'subscription_ends_at' => now()->addMonths(3)->toDateString(),
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

        // Create venues and courts
        $venue1 = Venue::create([
            'user_id' => $owner->id,
            'name' => 'Futsal Premium Arena',
            'address' => 'Jl. Jenderal Sudirman No. 1, Jakarta',
            'image' => 'futsal_premium.png',
        ]);
        
        Court::create([
            'venue_id' => $venue1->id,
            'name' => 'Lapangan Futsal 1 (Vinyl)',
            'type' => 'futsal',
            'price_per_hour' => 150000,
        ]);
        Court::create([
            'venue_id' => $venue1->id,
            'name' => 'Lapangan Futsal 2 (Sintetis)',
            'type' => 'futsal',
            'price_per_hour' => 120000,
        ]);

        $venue2 = Venue::create([
            'user_id' => $owner->id,
            'name' => 'Badminton Elite Center',
            'address' => 'Jl. Gatot Subroto No. 45, Bandung',
            'image' => 'badminton_elite.png',
        ]);

        Court::create([
            'venue_id' => $venue2->id,
            'name' => 'Court A (Karpet)',
            'type' => 'badminton',
            'price_per_hour' => 80000,
        ]);
        Court::create([
            'venue_id' => $venue2->id,
            'name' => 'Court B (Kayu)',
            'type' => 'badminton',
            'price_per_hour' => 100000,
        ]);

        $venue3 = Venue::create([
            'user_id' => $owner->id,
            'name' => 'Pro Basketball Arena',
            'address' => 'Jl. Pemuda No. 10, Surabaya',
            'image' => 'basketball_pro.png',
        ]);

        Court::create([
            'venue_id' => $venue3->id,
            'name' => 'Main Court (Indoor)',
            'type' => 'basket',
            'price_per_hour' => 200000,
        ]);

        // Create some bookings (Optional: If Booking factory uses Venue/Court factory, it may fail or create duplicates. 
        // We will disable Booking::factory here, or limit it if it supports random court ids).
        // Booking::factory(15)->create();
    }
}

