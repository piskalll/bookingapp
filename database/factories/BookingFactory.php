<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Court;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $court = Court::inRandomOrder()->first() ?? Court::factory();
        $startTime = fake()->randomElement(['08:00', '10:00', '13:00', '15:00', '17:00', '19:00']);
        $endHour = (int)explode(':', $startTime)[0] + 1;
        $endTime = str_pad((string)$endHour, 2, '0', STR_PAD_LEFT) . ':00';

        $hours = $endHour - (int)explode(':', $startTime)[0];
        $totalPrice = $court->price_per_hour * $hours;

        return [
            'user_id' => User::factory(),
            'court_id' => $court->id,
            'booking_date' => fake()->dateTimeBetween('tomorrow', '+7 days')->format('Y-m-d'),
            'start_time' => $startTime,
            'end_time' => $endTime,
            'total_price' => $totalPrice,
            'status' => fake()->randomElement(['pending', 'confirmed', 'cancelled']),
        ];
    }
}
