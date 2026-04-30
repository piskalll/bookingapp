<?php

use App\Models\Booking;
use App\Models\Court;
use App\Models\User;
use App\Models\Venue;
use Carbon\Carbon;

describe('Owner Dashboard', function () {
    beforeEach(function () {
        // Create an owner user
        $this->owner = User::factory()->create(['role' => 'owner']);

        // Create venues for the owner
        $this->venue1 = Venue::factory()->create(['user_id' => $this->owner->id]);
        $this->venue2 = Venue::factory()->create(['user_id' => $this->owner->id]);

        // Create courts for venues
        $this->court1 = Court::factory()->create(['venue_id' => $this->venue1->id, 'price_per_hour' => 100000]);
        $this->court2 = Court::factory()->create(['venue_id' => $this->venue1->id, 'price_per_hour' => 150000]);
        $this->court3 = Court::factory()->create(['venue_id' => $this->venue2->id, 'price_per_hour' => 200000]);

        // Create another user for bookings
        $this->customer = User::factory()->create(['role' => 'customer']);
    });

    test('owner can access dashboard', function () {
        $response = $this->actingAs($this->owner)
            ->get(route('owner.dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Owner/Dashboard')
        );
    });

    test('dashboard displays correct total venues count', function () {
        $response = $this->actingAs($this->owner)
            ->get(route('owner.dashboard'));

        $response->assertInertia(fn ($page) => $page
            ->has('statistics', fn ($stat) => $stat
                ->where('total_venues', 2)
            )
        );
    });

    test('dashboard displays correct total courts count', function () {
        $response = $this->actingAs($this->owner)
            ->get(route('owner.dashboard'));

        $response->assertInertia(fn ($page) => $page
            ->has('statistics', fn ($stat) => $stat
                ->where('total_courts', 3)
            )
        );
    });

    test('dashboard calculates monthly revenue correctly', function () {
        // Create confirmed bookings this month
        Booking::factory()->create([
            'court_id' => $this->court1->id,
            'user_id' => $this->customer->id,
            'status' => 'confirmed',
            'booking_date' => Carbon::now()->toDateString(),
            'total_price' => 500000,
        ]);

        Booking::factory()->create([
            'court_id' => $this->court2->id,
            'user_id' => $this->customer->id,
            'status' => 'confirmed',
            'booking_date' => Carbon::now()->toDateString(),
            'total_price' => 600000,
        ]);

        // Create booking from other owner (should not be counted)
        $otherOwner = User::factory()->create(['role' => 'owner']);
        $otherVenue = Venue::factory()->create(['user_id' => $otherOwner->id]);
        $otherCourt = Court::factory()->create(['venue_id' => $otherVenue->id]);
        Booking::factory()->create([
            'court_id' => $otherCourt->id,
            'user_id' => $this->customer->id,
            'status' => 'confirmed',
            'booking_date' => Carbon::now()->toDateString(),
            'total_price' => 1000000,
        ]);

        $response = $this->actingAs($this->owner)
            ->get(route('owner.dashboard'));

        $response->assertInertia(fn ($page) => $page
            ->has('statistics', fn ($stat) => $stat
                ->where('monthly_revenue', 1100000)
            )
        );
    });

    test('dashboard does not count pending bookings without payment proof', function () {
        // Create pending booking without payment_proof
        Booking::factory()->create([
            'court_id' => $this->court1->id,
            'user_id' => $this->customer->id,
            'status' => 'pending',
            'payment_proof' => null,
            'booking_date' => Carbon::now()->toDateString(),
            'total_price' => 500000,
        ]);

        $response = $this->actingAs($this->owner)
            ->get(route('owner.dashboard'));

        $response->assertInertia(fn ($page) => $page
            ->has('statistics', fn ($stat) => $stat
                ->where('pending_bookings_count', 0)
            )
        );
    });

    test('dashboard counts pending bookings with payment proof', function () {
        // Create pending bookings with payment_proof
        Booking::factory()->create([
            'court_id' => $this->court1->id,
            'user_id' => $this->customer->id,
            'status' => 'pending',
            'payment_proof' => 'proof_1.jpg',
            'booking_date' => Carbon::now()->toDateString(),
            'total_price' => 500000,
        ]);

        Booking::factory()->create([
            'court_id' => $this->court2->id,
            'user_id' => $this->customer->id,
            'status' => 'pending',
            'payment_proof' => 'proof_2.jpg',
            'booking_date' => Carbon::now()->toDateString(),
            'total_price' => 600000,
        ]);

        $response = $this->actingAs($this->owner)
            ->get(route('owner.dashboard'));

        $response->assertInertia(fn ($page) => $page
            ->has('statistics', fn ($stat) => $stat
                ->where('pending_bookings_count', 2)
            )
        );
    });

    test('dashboard displays recent bookings (limit 5)', function () {
        // Create 10 bookings
        for ($i = 0; $i < 10; $i++) {
            Booking::factory()->create([
                'court_id' => $this->court1->id,
                'user_id' => $this->customer->id,
                'status' => 'confirmed',
                'booking_date' => Carbon::now()->subDays($i)->toDateString(),
                'total_price' => 500000 + ($i * 10000),
            ]);
        }

        $response = $this->actingAs($this->owner)
            ->get(route('owner.dashboard'));

        $response->assertInertia(fn ($page) => $page
            ->has('recent_bookings', 5)
        );
    });

    test('dashboard shows recent bookings in correct order', function () {
        $booking1 = Booking::factory()->create([
            'court_id' => $this->court1->id,
            'user_id' => $this->customer->id,
            'status' => 'confirmed',
            'booking_date' => Carbon::now()->subDays(2)->toDateString(),
            'total_price' => 500000,
        ]);

        $booking2 = Booking::factory()->create([
            'court_id' => $this->court1->id,
            'user_id' => $this->customer->id,
            'status' => 'confirmed',
            'booking_date' => Carbon::now()->subDays(1)->toDateString(),
            'total_price' => 600000,
        ]);

        $booking3 = Booking::factory()->create([
            'court_id' => $this->court1->id,
            'user_id' => $this->customer->id,
            'status' => 'confirmed',
            'booking_date' => Carbon::now()->toDateString(),
            'total_price' => 700000,
        ]);

        $response = $this->actingAs($this->owner)
            ->get(route('owner.dashboard'));

        $response->assertInertia(fn ($page) => $page
            ->has('recent_bookings.0', fn ($booking) => $booking
                ->where('id', $booking3->id)
            )
            ->has('recent_bookings.1', fn ($booking) => $booking
                ->where('id', $booking2->id)
            )
            ->has('recent_bookings.2', fn ($booking) => $booking
                ->where('id', $booking1->id)
            )
        );
    });

    test('dashboard includes correct booking details', function () {
        $booking = Booking::factory()->create([
            'court_id' => $this->court1->id,
            'user_id' => $this->customer->id,
            'status' => 'confirmed',
            'booking_date' => Carbon::now()->toDateString(),
            'start_time' => '10:00:00',
            'end_time' => '12:00:00',
            'total_price' => 500000,
        ]);

        $response = $this->actingAs($this->owner)
            ->get(route('owner.dashboard'));

        $response->assertInertia(fn ($page) => $page
            ->has('recent_bookings.0', fn ($b) => $b
                ->where('id', $booking->id)
                ->where('customer_name', $this->customer->name)
                ->where('court_name', $this->court1->name)
                ->where('total_price', 500000)
                ->where('status', 'confirmed')
            )
        );
    });

    test('owner cannot see bookings from other owners', function () {
        $otherOwner = User::factory()->create(['role' => 'owner']);
        $otherVenue = Venue::factory()->create(['user_id' => $otherOwner->id]);
        $otherCourt = Court::factory()->create(['venue_id' => $otherVenue->id]);

        Booking::factory()->create([
            'court_id' => $otherCourt->id,
            'user_id' => $this->customer->id,
            'status' => 'confirmed',
            'booking_date' => Carbon::now()->toDateString(),
            'total_price' => 500000,
        ]);

        $response = $this->actingAs($this->owner)
            ->get(route('owner.dashboard'));

        $response->assertInertia(fn ($page) => $page
            ->has('recent_bookings', 0)
        );
    });

    test('unauthenticated user cannot access dashboard', function () {
        $response = $this->get(route('owner.dashboard'));

        $response->assertRedirect(route('login'));
    });
});
