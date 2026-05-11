<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'court_id', 'booking_date', 'start_time', 'end_time', 'total_price', 'admin_fee', 'owner_revenue', 'status', 'payment_proof'])]
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
}
