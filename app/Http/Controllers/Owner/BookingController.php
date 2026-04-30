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
}
