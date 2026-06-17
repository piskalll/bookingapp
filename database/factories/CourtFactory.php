<?php

namespace Database\Factories;

use App\Models\Venue;
use Illuminate\Database\Eloquent\Factories\Factory;

class CourtFactory extends Factory
{
    public function definition(): array
    {
        return [
            // Magic: Otomatis membuatkan Venue jika tidak didefinisikan
            'venue_id' => Venue::factory(), 
            
            'name' => 'Lapangan ' . $this->faker->numberBetween(1, 10),
            
            // Memilih acak dari enum Anda
            'type' => $this->faker->randomElement(['futsal', 'badminton', 'basket']),
            
            // Harga acak
            'price_per_hour' => $this->faker->randomElement([50000, 75000, 100000]), 
        ];
    }
}