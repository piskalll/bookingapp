<?php

use App\Models\User;
use App\Models\Court;
use App\Models\Venue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;

uses(RefreshDatabase::class);

test('customer dapat membuat pesanan lapangan dengan sukses', function () {
    // 1. ARRANGE
    $customer = User::factory()->create(['role' => 'customer']);
    
    // Pastikan relasi Venue dan Owner juga tercipta agar perhitungan komisi aman
    $owner = User::factory()->create(['role' => 'owner', 'commission_rate' => 10.00]);
    $venue = Venue::factory()->create(['owner_id' => $owner->id]);
    $court = Court::factory()->create([
        'venue_id' => $venue->id,
        'price_per_hour' => 50000 
    ]);

    // Mock konfigurasi Midtrans agar proses Snap Token tidak crash saat di-test
    Config::set('midtrans.server_key', 'dummy_server_key');
    Config::set('midtrans.is_production', false);

    // Data form yang PASTI VALID sesuai BookingController
    // Gunakan tanggal masa depan (besok) agar lolos aturan 'after_or_equal:today'
    $besok = now()->addDay()->format('Y-m-d'); 
    
    $bookingData = [
        'court_id' => $court->id,
        'booking_date' => $besok,
        // Gunakan format H:i (tanpa detik) agar lolos aturan 'date_format:H:i'
        'start_time' => '19:00',
        'end_time' => '21:00', 
    ];

    // 2. ACT
    $response = actingAs($customer)->post('/bookings', $bookingData);

    // 3. ASSERT
    // Jika validasi gagal, Laravel akan menyimpan error di session
    // Kita bisa mengecek jika ada error tak terduga
    $response->assertSessionHasNoErrors();
    
    $response->assertRedirect('/bookings'); 

    // Verifikasi data tersimpan, pastikan format pencocokannya menggunakan detik (karena DB MySQL/SQLite mengubah H:i menjadi H:i:s)
    assertDatabaseHas('bookings', [
        'user_id' => $customer->id,
        'court_id' => $court->id,
        'booking_date' => $besok,
        'start_time' => '19:00',
        'end_time' => '21:00',
        'status' => 'pending', 
        'total_price' => 100000, 
    ]);
});