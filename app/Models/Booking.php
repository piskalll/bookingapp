<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id', 'court_id', 'booking_date', 'start_time', 'end_time',
    'total_price', 'admin_fee', 'owner_revenue',
    'status', 'payment_proof', 'snap_token', 'booking_code',
])]
class Booking extends Model
{
    /** @use HasFactory<\Database\Factories\BookingFactory> */
    use HasFactory;

    /**
     * Get the user this booking belongs to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the court this booking belongs to.
     */
    public function court(): BelongsTo
    {
        return $this->belongsTo(Court::class);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Static Helpers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Generate kode struk unik untuk booking yang dikonfirmasi.
     * Format: SPB-YYYYMMDD-XXXX (contoh: SPB-20260518-0023)
     *
     * XXXX = ID booking, zero-padded ke 4 digit.
     * Jika ID > 9999, tidak di-pad (tetap unik).
     */
    public static function generateBookingCode(int $bookingId): string
    {
        $datePart = now()->format('Ymd');
        $idPart   = str_pad($bookingId, 4, '0', STR_PAD_LEFT);

        return "SPB-{$datePart}-{$idPart}";
    }
}
