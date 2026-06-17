<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Venue;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Venue>
 */
class VenueFactory extends Factory
{
    public function definition(): array
    {
        return [
            // Magic: Jika kita tidak mengirim owner_id saat test, 
            // Factory otomatis membuatkan User baru!
            'owner_id' => User::factory(), 
            
            // Faker akan membuat nama seperti "PT Sejahtera Sport Center"
            'name' => $this->faker->company() . ' Sport Center', 
            
            // Alamat acak yang terlihat nyata
            'address' => $this->faker->address(), 
            
            // Kita kosongkan gambar dulu untuk mempercepat testing
            'image' => null, 
        ];
    }
}
