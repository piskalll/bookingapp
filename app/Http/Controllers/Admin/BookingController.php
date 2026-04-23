<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookingController extends Controller
{
    /**
     * Display a listing of the resource.
     * Show all bookings for admin dashboard.
     * Sorted: pending/waiting with payment_proof first, then newest.
     */
    public function index()
    {
        $bookings = Booking::with('user', 'court', 'court.venue')
            ->orderByRaw("CASE WHEN (status = 'pending' OR status = 'waiting_confirmation') AND payment_proof IS NOT NULL THEN 0 WHEN status = 'waiting_confirmation' THEN 1 ELSE 2 END")
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'user_name' => $booking->user->name,
                    'user_email' => $booking->user->email,
                    'court_name' => $booking->court->name,
                    'court_type' => $booking->court->type,
                    'venue_name' => $booking->court->venue->name,
                    'venue_address' => $booking->court->venue->address,
                    'booking_date' => $booking->booking_date,
                    'start_time' => $booking->start_time,
                    'end_time' => $booking->end_time,
                    'total_price' => $booking->total_price,
                    'status' => $booking->status,
                    'payment_proof' => $booking->payment_proof,
                    'created_at' => $booking->created_at->toDateTimeString(),
                ];
            });

        return Inertia::render('Admin/BookingManager', [
            'bookings' => $bookings,
        ]);
    }

    /**
     * Approve booking - set status to confirmed
     */
    public function approve(Booking $booking)
    {
        $booking->update(['status' => 'confirmed']);

        return back()->with('success', "Pesanan dari {$booking->user->name} telah dikonfirmasi.");
    }

    /**
     * Reject booking - set status to cancelled
     */
    public function reject(Booking $booking)
    {
        $booking->update(['status' => 'cancelled']);

        return back()->with('success', "Pesanan dari {$booking->user->name} telah ditolak.");
    }
}

