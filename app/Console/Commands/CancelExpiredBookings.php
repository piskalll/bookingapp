<?php

namespace App\Console\Commands;

use App\Models\Booking;
use Illuminate\Console\Command;

class CancelExpiredBookings extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'bookings:cancel-expired';

    /**
     * The description of the console command.
     *
     * @var string
     */
    protected $description = 'Otomatis membatalkan booking yang pending dan belum bayar lebih dari 15 menit';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        // Query booking dengan kondisi:
        // 1. Status pending (belum dikonfirmasi)
        // 2. Belum ada bukti pembayaran (payment_proof NULL)
        // 3. Dibuat lebih dari 15 menit yang lalu
        $expiredBookings = Booking::where('status', 'pending')
            ->whereNull('payment_proof')
            ->where('created_at', '<', now()->subMinutes(2))
            ->get();

        $count = $expiredBookings->count();

        if ($count === 0) {
            $this->info('✓ Tidak ada booking yang kedaluwarsa untuk dibatalkan.');
            return self::SUCCESS;
        }

        // Update status menjadi cancelled
        Booking::where('status', 'pending')
            ->whereNull('payment_proof')
            ->where('created_at', '<', now()->subMinutes(2))
            ->update(['status' => 'cancelled']);

        // Output informasi ke console
        $this->info("✓ Berhasil membatalkan {$count} pesanan yang kedaluwarsa (pending > 15 menit)");
        $this->line("Waktu eksekusi: " . now()->format('Y-m-d H:i:s'));

        return self::SUCCESS;
    }
}
