<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BookingController extends Controller
{
    /**
     * Display a list of all bookings for the owner's venues.
     */
    public function index()
    {
        $userId = Auth::id();

        // Get all bookings for venues belonging to the owner
        $bookings = DB::table('bookings')
            ->join('courts', 'bookings.court_id', '=', 'courts.id')
            ->join('venues', 'courts.venue_id', '=', 'venues.id')
            ->join('users', 'bookings.user_id', '=', 'users.id')
            ->select(
                'bookings.id',
                'users.name as customer_name',
                'users.email as customer_email',
                'courts.name as court_name',
                'venues.name as venue_name',
                'bookings.booking_date',
                'bookings.start_time',
                'bookings.end_time',
                'bookings.total_price',
                'bookings.admin_fee',
                'bookings.owner_revenue',
                'bookings.status',
                'bookings.payment_proof',
                'bookings.created_at'
            )
            ->where('venues.user_id', $userId)
            ->orderBy('bookings.booking_date', 'desc')
            ->orderBy('bookings.start_time', 'desc')
            ->paginate(15)
            ->toArray();

        return Inertia::render('Owner/Bookings/Index', [
            'bookings' => $bookings,
        ]);
    }

    /**
     * Approve booking - set status to confirmed
     */
    public function approve($id)
    {
        $booking = DB::table('bookings')->where('id', $id)->first();
        if (!$booking) {
            abort(404);
        }

        // Verify ownership
        $court = DB::table('courts')->where('id', $booking->court_id)->first();
        $venue = DB::table('venues')->where('id', $court->venue_id)->first();
        if ($venue->user_id !== Auth::id()) {
            abort(403);
        }

        DB::table('bookings')->where('id', $id)->update(['status' => 'confirmed']);

        return back()->with('success', "Pesanan telah dikonfirmasi.");
    }

    /**
     * Reject booking - set status to cancelled
     */
    public function reject($id)
    {
        $booking = DB::table('bookings')->where('id', $id)->first();
        if (!$booking) {
            abort(404);
        }

        // Verify ownership
        $court = DB::table('courts')->where('id', $booking->court_id)->first();
        $venue = DB::table('venues')->where('id', $court->venue_id)->first();
        if ($venue->user_id !== Auth::id()) {
            abort(403);
        }

        DB::table('bookings')->where('id', $id)->update(['status' => 'cancelled']);

        return back()->with('success', "Pesanan telah ditolak.");
    }
}
